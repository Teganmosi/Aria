from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, WebSocket, WebSocketException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings
from database import db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Security
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )

    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT access token"""
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return payload
    except JWTError as e:
        logger.error(f"Error decoding token: {e}")
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    user_email: Optional[str] = payload.get("email")
    if user_id is None:
        raise credentials_exception

    # Get user profile from database
    profile = await db.get_profile(user_id)
    if profile is None:
        # Create profile if it doesn't exist
        try:
            profile_data = {
                "id": user_id,
                "email": user_email or f"user_{user_id}@faithai.app",
                "full_name": "User",
            }
            profile = await db.create_profile(profile_data)
        except Exception as e:
            logger.error(f"Error creating profile in get_current_user: {e}")
            # Return a minimal user object if profile creation fails
            return {
                "id": user_id,
                "email": user_email or f"user_{user_id}@faithai.app",
                "full_name": "User",
            }

    return profile


async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get the current active user (can be extended for user status checks)"""
    return current_user


# Supabase Auth Integration (using Supabase Auth for authentication)


async def supabase_auth_signup(
    email: str, password: str, full_name: Optional[str] = None
) -> Dict[str, Any]:
    """Sign up a user using Supabase Auth"""
    try:
        # Use Supabase client for authentication
        response = db.client.auth.sign_up(
            {
                "email": email,
                "password": password,
                "options": {"data": {"full_name": full_name} if full_name else {}},
            }
        )

        if response.user:
            user_id = response.user.id

            # Create user profile in our database
            profile_data = {
                "id": user_id,
                "email": email,
                "full_name": full_name or email.split("@")[0],
            }
            await db.create_profile(profile_data)

            return {
                "success": True,
                "message": "Registration successful! Please check your email to confirm your account, then log in.",
                "user": {"id": user_id, "email": email, "full_name": full_name},
            }

        return {"success": False, "error": "Failed to create user"}
    except Exception as e:
        logger.error(f"Error signing up user: {e}")
        return {"success": False, "error": str(e)}


async def supabase_auth_login(email: str, password: str) -> Dict[str, Any]:
    """Login a user using Supabase Auth - using direct API call"""
    try:
        import httpx

        # Make direct API call to Supabase Auth
        response = httpx.post(
            f"{settings.supabase_url}/auth/v1/token?grant_type=password",
            headers={
                "apikey": settings.supabase_key,
                "Content-Type": "application/json",
            },
            json={"email": email, "password": password},
        )

        if response.status_code != 200:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get(
                "error_description",
                error_data.get("msg", "Invalid credentials or email not confirmed"),
            )
            print(f"Supabase auth error: {response.status_code} - {error_msg}")
            return {"success": False, "error": error_msg}

        data = response.json()

        if not data.get("access_token"):
            return {
                "success": False,
                "error": "Invalid credentials or email not confirmed",
            }

        access_token_from_supabase = data["access_token"]

        # Get user details to get the user_id
        user_response = httpx.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "apikey": settings.supabase_key,
                "Authorization": f"Bearer {access_token_from_supabase}",
            },
        )

        user_metadata = {}
        full_name = email.split("@")[0]
        user_id = None
        user_email = email

        if user_response.status_code == 200:
            user_data = user_response.json()
            user_id = user_data.get("id")
            user_email = user_data.get("email", email)
            user_metadata = user_data.get("user_metadata", {})
            full_name = user_metadata.get("full_name", email.split("@")[0])

        if user_id is None:
            return {"success": False, "error": "Could not retrieve user ID"}

        # Create profile if it doesn't exist (skip if API key issue)
        try:
            existing_profile = await db.get_profile(user_id)
            if not existing_profile:
                profile_data = {
                    "id": user_id,
                    "email": user_email,
                    "full_name": full_name,
                    "avatar_url": user_metadata.get("avatar_url"),
                }
                await db.create_profile(profile_data)
        except Exception as profile_err:
            logger.warning(f"Could not create/get profile: {profile_err}")

        # Create our own JWT token with proper user_id as string
        access_token = create_access_token(
            data={"sub": str(user_id), "email": user_email}
        )

        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": user_id, "email": user_email, "full_name": full_name},
        }
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        return {"success": False, "error": str(e)}


async def supabase_auth_logout(user_id: str) -> Dict[str, Any]:
    """Logout a user using Supabase Auth - using direct API call"""
    try:
        import httpx

        # First, try to get the user's access token from the profiles table
        profile = await db.get_profile(user_id)
        if not profile:
            return {"success": True, "message": "Logged out successfully"}

        # Since we don't store the access token, we'll just return success
        # In a production app, you'd want to invalidate the token properly
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Error logging out user: {e}")
        return {"success": False, "error": str(e)}


# Token blacklist for invalidated tokens
token_blacklist: set = set()


def is_token_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted"""
    return token in token_blacklist


def blacklist_token(token: str) -> None:
    """Add a token to the blacklist"""
    token_blacklist.add(token)
    logger.info(f"Token blacklisted. Blacklist size: {len(token_blacklist)}")


async def get_current_user_websocket(websocket: WebSocket) -> Dict[str, Any]:
    """Get the current authenticated user from WebSocket connection"""
    from fastapi import WebSocketException, WebSocketDisconnect

    # Get token from query parameters
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        raise WebSocketException(code=4001, reason="Missing authentication token")

    # Check if token is blacklisted
    if is_token_blacklisted(token):
        await websocket.close(code=4002, reason="Token has been invalidated")
        raise WebSocketException(code=4002, reason="Token has been invalidated")

    # Decode and verify token
    payload = decode_access_token(token)

    if payload is None:
        await websocket.close(code=4001, reason="Invalid or expired token")
        raise WebSocketException(code=4001, reason="Invalid or expired token")

    user_id: Optional[str] = payload.get("sub")
    user_email: Optional[str] = payload.get("email")

    if user_id is None:
        await websocket.close(code=4001, reason="Invalid token payload")
        raise WebSocketException(code=4001, reason="Invalid token payload")

    # Get user profile from database
    profile = await db.get_profile(user_id)
    if profile is None:
        # Create profile if it doesn't exist
        try:
            profile_data = {
                "id": user_id,
                "email": user_email or f"user_{user_id}@faithai.app",
                "full_name": "User",
            }
            profile = await db.create_profile(profile_data)
        except Exception as e:
            logger.error(f"Error creating profile in websocket auth: {e}")
            return {
                "id": user_id,
                "email": user_email or f"user_{user_id}@faithai.app",
                "full_name": "User",
            }

    return profile
