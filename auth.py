import logging
import uuid
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
    except Exception as e:
        logger.error(f"Password verification error: {e}")
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
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT access token"""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload: raise credentials_exception
    
    user_id: str = payload.get("sub")
    if not user_id: raise credentials_exception
    
    profile = db.get_profile(user_id)
    if profile is None: raise credentials_exception
    return profile

# --- Refactored Local Auth (replacing Supabase) ---

def supabase_auth_signup(email: str, password: str, full_name: Optional[str] = None) -> Dict[str, Any]:
    """Sign up using local SQLite instead of Supabase"""
    try:
        # Check if user already exists
        existing = db.get_user_by_email(email)
        if existing:
            return {"success": False, "error": "User already exists"}
            
        user_id = str(uuid.uuid4())
        hashed_pw = get_password_hash(password)
        
        # Create user record
        if db.create_user(user_id, email, hashed_pw):
            # Create profile record
            profile_data = {
                "id": user_id, 
                "email": email,
                "full_name": full_name or email.split("@")[0]
            }
            db.create_profile(profile_data)
            
            # Auto-login: generate token
            access_token = create_access_token(data={"sub": user_id, "email": email})
            
            return {
                "success": True, 
                "message": "Sign up successful",
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id, 
                    "email": email, 
                    "full_name": profile_data["full_name"]
                }
            }
        return {"success": False, "error": "Failed to create user"}
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return {"success": False, "error": str(e)}

def supabase_auth_login(email: str, password: str) -> Dict[str, Any]:
    """Login using local SQLite instead of Supabase"""
    try:
        user = db.get_user_by_email(email)
        if not user or not verify_password(password, user["hashed_password"]):
            return {"success": False, "error": "Invalid email or password"}
            
        user_id = user["id"]
        profile = db.get_profile(user_id)
        
        access_token = create_access_token(data={"sub": user_id, "email": email})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id, 
                "email": email, 
                "full_name": profile["full_name"] if profile else email.split("@")[0]
            }
        }
    except Exception as e:
        logger.error(f"Login error: {e}")
        return {"success": False, "error": str(e)}

def supabase_auth_logout() -> Dict[str, Any]:
    """Logout locally"""
    # No server-side session yet, just return success
    return {"success": True, "message": "Logged out"}

def blacklist_token(token: str): 
    # Optional: implement token revocation
    pass

def get_current_user_websocket(websocket: WebSocket) -> Dict[str, Any]:
    """Get the current authenticated user from WebSocket connection"""
    token = websocket.query_params.get("token")
    if not token: 
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token")
    
    payload = decode_access_token(token)
    if not payload: 
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
    
    user_id = payload.get("sub")
    profile = db.get_profile(user_id)
    if not profile: 
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
    
    return profile
