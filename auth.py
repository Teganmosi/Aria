import logging
import uuid
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, WebSocket, WebSocketException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from database import db
import bcrypt

# Set up logging
logger = logging.getLogger(__name__)

# JWT Security
security = HTTPBearer()

# Password hashing
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        if not hashed_password: return False
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        logger.exception("Password verification error")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # bcrypt spec says max 72 bytes
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def create_refresh_token(user_id: str, email: str) -> tuple[str, datetime]:
    """Create an opaque refresh token, persist it, and return (token, expires_at)."""
    if not email:
        logger.warning("create_refresh_token called without a valid email reference.")
    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    db.store_refresh_token(token, user_id, expires_at.strftime("%Y-%m-%d %H:%M:%S"))
    return token, expires_at

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT access token"""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    jti: Optional[str] = payload.get("jti")
    if jti and await asyncio.to_thread(db.is_token_revoked, jti):
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    profile = await asyncio.to_thread(db.get_profile, user_id)
    if profile is None:
        raise credentials_exception
    return profile

async def get_current_user_from_token(token: str) -> Dict[str, Any]:
    """Get the current authenticated user from a raw token string"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    jti: Optional[str] = payload.get("jti")
    if jti and await asyncio.to_thread(db.is_token_revoked, jti):
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    profile = await asyncio.to_thread(db.get_profile, user_id)
    if profile is None:
        raise credentials_exception
    return profile

# --- Supabase Auth Integration ---

def supabase_auth_signup(email: str, password: str, full_name: Optional[str] = None) -> Dict[str, Any]:
    """Sign up using Supabase Auth"""
    try:
        response = db.client.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"full_name": full_name} if full_name else {}}
        })
        
        if response.user:
            user_id = response.user.id
            
            # Create user record in our database first to satisfy foreign key constraint
            db.create_user(user_id, email, "")
            
            # Create profile record in our database
            profile_data = {
                "id": user_id, 
                "email": email,
                "full_name": full_name or email.split("@")[0]
            }
            db.create_profile(profile_data)
            
            # Auto-login: generate tokens if session is returned
            access_token = None
            refresh_token = None
            if response.session:
                access_token = create_access_token(data={"sub": user_id, "email": email})
                refresh_token, _ = create_refresh_token(user_id, email)

            return {
                "success": True,
                "message": "Sign up successful! " + ("Please confirm your email." if not response.session else ""),
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "email": email,
                    "full_name": profile_data["full_name"]
                }
            }
        return {"success": False, "error": "Failed to create user"}
    except Exception as e:
        logger.exception("Signup error")
        # Extract a clean message if possible
        err_msg = str(e)
        if "User already registered" in err_msg:
            err_msg = "User already exists"
        return {"success": False, "error": err_msg}

def supabase_auth_login(email: str, password: str) -> Dict[str, Any]:
    """Login using Supabase Auth"""
    try:
        response = db.client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if response.user and response.session:
            user_id = response.user.id
            user_email = response.user.email
            
            profile = db.get_profile(user_id)
            if not profile:
                metadata = response.user.user_metadata or {}
                full_name = metadata.get("full_name") or user_email.split("@")[0]
                # Create user record in our database first to satisfy foreign key constraint
                db.create_user(user_id, user_email, "")
                
                profile_data = {
                    "id": user_id,
                    "email": user_email,
                    "full_name": full_name
                }
                db.create_profile(profile_data)
                profile = db.get_profile(user_id)
            
            access_token = create_access_token(data={"sub": user_id, "email": user_email})
            refresh_token, _ = create_refresh_token(user_id, user_email)

            return {
                "success": True,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "email": user_email,
                    "full_name": profile["full_name"] if profile else user_email.split("@")[0]
                }
            }
        return {"success": False, "error": "Invalid email or password"}
    except Exception as e:
        logger.exception("Login error")
        err_msg = str(e)
        if "Invalid login credentials" in err_msg:
            err_msg = "Invalid email or password"
        return {"success": False, "error": err_msg}

def supabase_auth_logout() -> Dict[str, Any]:
    """Logout from Supabase Auth"""
    try:
        db.client.auth.sign_out()
        return {"success": True, "message": "Logged out successfully"}
    except Exception:
        logger.exception("Logout error")
        return {"success": True, "message": "Logged out"}

def blacklist_token(token: str) -> None:
    payload = decode_access_token(token)
    if not payload:
        return
    jti: Optional[str] = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        return
    expires_at = datetime.fromtimestamp(exp, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    db.revoke_token(jti, expires_at)

async def get_current_user_websocket(websocket: WebSocket) -> Dict[str, Any]:
    """Get the current authenticated user from WebSocket connection"""
    token = websocket.query_params.get("token")
    if not token: 
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token")
    
    payload = decode_access_token(token)
    if not payload: 
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
    
    user_id = payload.get("sub")
    profile = await asyncio.to_thread(db.get_profile, user_id)
    if not profile: 
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
    
    return profile


def supabase_oauth_exchange(access_token: str) -> Dict[str, Any]:
    """Exchange a Supabase access token for local JWT access and refresh tokens"""
    try:
        response = db.client.auth.get_user(access_token)
        if not response or not response.user:
            return {"success": False, "error": "Invalid Supabase token"}
            
        user_id = response.user.id
        user_email = response.user.email
        
        profile = db.get_profile(user_id)
        if not profile:
            metadata = response.user.user_metadata or {}
            full_name = metadata.get("full_name") or user_email.split("@")[0]
            avatar_url = metadata.get("avatar_url")
            # Create user record in our database first to satisfy foreign key constraint
            db.create_user(user_id, user_email, "")
            
            profile_data = {
                "id": user_id,
                "email": user_email,
                "full_name": full_name,
                "avatar_url": avatar_url
            }
            db.create_profile(profile_data)
            profile = db.get_profile(user_id)
            
        local_access_token = create_access_token(data={"sub": user_id, "email": user_email})
        local_refresh_token, _ = create_refresh_token(user_id, user_email)
        
        return {
            "success": True,
            "access_token": local_access_token,
            "refresh_token": local_refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user_email,
                "full_name": profile["full_name"] if profile else user_email.split("@")[0]
            }
        }
    except Exception as e:
        logger.exception("OAuth exchange error")
        return {"success": False, "error": str(e)}

