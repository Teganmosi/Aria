from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    Request,
    status,
    WebSocket,
    WebSocketDisconnect,
    UploadFile,
    File,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import asyncio
import logging
import json
import aiofiles
import aiofiles.os
import uuid

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import settings
from models import (
    UserRegister,
    UserResponse,
    UserLogin,
    Token,
    Note,
    NoteUpdate,
    NoteCreate,
    BibleStudySession,
    BibleStudySessionCreate,
    BibleStudyMessage,
    BibleStudyMessageCreate,
    EmotionalSupportSession,
    EmotionalSupportSessionCreate,
    EmotionalSupportMessage,
    EmotionalSupportMessageCreate,
    Devotion,
    DevotionCreate,
    DevotionSettings,
    DevotionSettingsUpdate,
    DevotionSettingsCreate,
    DevotionMessage,
    DevotionMessageCreate,
    BibleVerse,
    JournalEntry,
    JournalEntryCreate,
    ScriptureReference,
    Prayer,
    PrayerCreate,
    AIRequest,
    AIResponse,
    AIChatSession,
    AIChatSessionCreate,
    AIChatMessage,
    ProfileUpdate,
    Profile,
)
from database import db
from auth import (
    get_current_user,
    supabase_auth_signup,
    supabase_auth_login,
    supabase_auth_logout,
    get_current_user_websocket,
    blacklist_token,
    decode_access_token,
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from ai_service import ai_service
import redis
import os
import tempfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants for common error messages
NOTE_NOT_FOUND = "Note not found"
ACCESS_DENIED = "Access denied"
FAILED_TO_GENERATE_RESPONSE = "Failed to generate response"
FAILED_TO_CREATE_SESSION = "Failed to create session"
FAILED_TO_CREATE_MESSAGE = "Failed to create message"
DEVOTION_NOT_FOUND = "Devotion not found"


BIBLE_BOOK_MAPPING = {
    "genesis": "genesis", "exodus": "exodus", "leviticus": "leviticus",
    "numbers": "numbers", "deuteronomy": "deuteronomy", "joshua": "joshua",
    "judges": "judges", "ruth": "ruth", "1 samuel": "1samuel",
    "2 samuel": "2samuel", "1 kings": "1kings", "2 kings": "2kings",
    "1 chronicles": "1chronicles", "2 chronicles": "2chronicles",
    "ezra": "ezra", "nehemiah": "nehemiah", "esther": "esther",
    "job": "job", "psalms": "psalms", "proverbs": "proverbs",
    "ecclesiastes": "ecclesiastes", "song of solomon": "songofsongs",
    "isaiah": "isaiah", "jeremiah": "jeremiah", "lamentations": "lamentations",
    "ezekiel": "ezekiel", "daniel": "daniel", "hosea": "hosea",
    "joel": "joel", "amos": "amos", "obadiah": "obadiah",
    "jonah": "jonah", "micah": "micah", "nahum": "nahum",
    "habakkuk": "habakkuk", "zephaniah": "zephaniah", "haggai": "haggai",
    "zechariah": "zechariah", "malachi": "malachi", "matthew": "matthew",
    "mark": "mark", "luke": "luke", "john": "john", "acts": "acts",
    "romans": "romans", "1 corinthians": "1corinthians", "2 corinthians": "2corinthians",
    "galatians": "galatians", "ephesians": "ephesians", "philippians": "philippians",
    "colossians": "colossians", "1 thessalonians": "1thessalonians",
    "2 thessalonians": "2thessalonians", "1 timothy": "1timothy",
    "2 timothy": "2timothy", "titus": "titus", "philemon": "philemon",
    "hebrews": "hebrews", "james": "james", "1 peter": "1peter",
    "2 peter": "2peter", "1 john": "1john", "2 john": "2john",
    "3 john": "3john", "jude": "jude", "revelation": "revelation",
}

BIBLE_API_URL = "https://bible-api.com"


async def _handle_voice_realtime_event(event: dict, call_id: str):
    """Dispatch a raw OpenAI Realtime API event dict to the frontend."""
    event_type = event.get("type", "")
    if event_type == "response.audio.delta":
        await voice_call_manager.send_message(
            call_id, {"type": "audio_output", "audio": event.get("delta", "")}
        )
    elif event_type == "response.created":
        await voice_call_manager.send_message(
            call_id, {"type": "aria_speaking", "speaking": True}
        )
    elif event_type == "response.done":
        await voice_call_manager.send_message(
            call_id, {"type": "aria_speaking", "speaking": False}
        )
    elif event_type == "response.audio_transcript.delta":
        await voice_call_manager.send_message(
            call_id,
            {"type": "transcript", "text": event.get("delta", ""), "role": "assistant"},
        )
    elif event_type == "input_audio_buffer.speech_started":
        await voice_call_manager.send_message(
            call_id, {"type": "user_speaking", "speaking": True}
        )
    elif event_type == "input_audio_buffer.speech_stopped":
        await voice_call_manager.send_message(
            call_id, {"type": "user_speaking", "speaking": False}
        )
    elif event_type == "error":
        logger.error(f"OpenAI Realtime error: {event.get('error')}")


def _cache_in_redis(key: str, data: Any, expire_seconds: int = 3600 * 24 * 7):
    """Helper to cache data in Redis if enabled"""
    if settings.redis_enabled and redis_client:
        try:
            redis_client.setex(key, expire_seconds, json.dumps(data))
            logger.info(f"📝 Redis SET: {key}")
        except Exception:
            logger.exception(f"Redis set error for key: {key}")


async def _fetch_verse_from_api(book: str, chapter: int, verse: int, version: str) -> Optional[Dict[str, Any]]:
    """Helper to fetch a specific verse from the external API"""
    try:
        import httpx
        api_book = BIBLE_BOOK_MAPPING.get(book.lower(), book.lower().replace(" ", ""))
        formatted_query = f"{api_book}+{chapter}:{verse}"
        url = f"{BIBLE_API_URL}/{formatted_query}?translation={version.lower()}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                verses = data.get("verses", [])
                if verses:
                    v = verses[0]
                    return {
                        "book": book,
                        "chapter": chapter,
                        "verse": verse,
                        "text": v.get("text", "").strip(),
                        "version": version.upper(),
                    }
    except Exception:
        logger.exception(f"Error fetching verse {book} {chapter}:{verse} from API")
    return None


def _get_user_custom_instructions(user_profile: Dict[str, Any]) -> Optional[str]:
    """Build a personalisation block that tells the model who it is talking to
    and how to adapt — not just a raw data dump."""
    parts = []

    custom_prompt = (user_profile.get("aria_custom_prompt") or "").strip()
    personal_context = (user_profile.get("aria_personal_context") or "").strip()

    if not custom_prompt and not personal_context:
        return None

    parts.append(
        "## ABOUT THIS USER — PERSONALISE EVERY RESPONSE\n"
        "The user has shared the following about themselves. "
        "Let this shape the depth, tone, and scripture choices in every reply. "
        "Do not give generic answers when you have personal information about them. "
        "Speak directly to where they are in their walk with God."
    )

    if custom_prompt:
        parts.append(f"**How they want Aria to engage / their spiritual focus:**\n{custom_prompt}")

    if personal_context:
        parts.append(f"**Their current life and spiritual context:**\n{personal_context}")

    parts.append(
        "Use this context to make your responses personal and relevant. "
        "Reference their situation when applicable — do not ignore it. "
        "The guardrails in the core instructions above still apply fully."
    )

    return "\n\n".join(parts)


# Initialize Redis client
redis_client = None
if settings.redis_enabled:
    try:
        redis_client = redis.from_url(
            settings.redis_url, 
            socket_timeout=2, 
            socket_connect_timeout=2,
            retry_on_timeout=True,
            decode_responses=True
        )
        redis_client.ping()
        logger.info(f"✅ Redis connected: {settings.redis_url}")
    except Exception as e:
        logger.warning(f"⚠️ Redis connection failed: {e}. Falling back to no caching.")
        redis_client = None
else:
    logger.info("ℹ️ Redis caching is disabled (REDIS_ENABLED=false)")

limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered Bible study, emotional support, and daily devotion assistant",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for frontend
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")


# ==================== Root Endpoint ====================


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Aria - Your Spiritual Companion",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# ==================== Authentication Endpoints ====================


@app.post("/api/v1/auth/register", response_model=Dict[str, Any])
@limiter.limit("3/minute")
async def register(request: Request, user_data: UserRegister):
    """Register a new user"""
    result = supabase_auth_signup(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
    )

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Registration failed"),
        )

    return result


@app.post("/api/v1/auth/login", response_model=Dict[str, Any])
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin):
    """Login a user"""
    result = supabase_auth_login(email=user_data.email, password=user_data.password)

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Invalid credentials"),
        )

    return result


@app.post("/api/v1/auth/logout", response_model=Dict[str, Any])
async def logout(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """Logout a user and invalidate their token"""
    # Blacklist the token
    token = credentials.credentials
    blacklist_token(token)

    # Try to get user_id from token for Supabase logout
    payload = decode_access_token(token)
    user_id = payload.get("sub") if payload else None

    if user_id:
        supabase_auth_logout()

    return {"success": True, "message": "Logged out successfully. Token invalidated."}


@app.post("/api/v1/auth/refresh", response_model=Dict[str, Any])
async def refresh_token(request: Request):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    body = await request.json()
    old_refresh = body.get("refresh_token", "").strip()
    if not old_refresh:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token required")

    row = db.get_refresh_token(old_refresh)
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user_id: str = row["user_id"]
    profile = db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Rotate: revoke old, issue new pair
    db.revoke_refresh_token(old_refresh)
    new_access = create_access_token(data={"sub": user_id, "email": profile["email"]})
    new_refresh, _ = create_refresh_token(user_id, profile["email"])

    return {
        "success": True,
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


@app.get("/api/v1/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


# ==================== Profile Endpoints ====================


@app.get("/api/v1/profile", response_model=Profile)
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user profile"""
    profile = db.get_profile(current_user["id"])
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return profile


@app.put("/api/v1/profile", response_model=Profile)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update user profile"""
    profile = db.update_profile(
        current_user["id"], profile_data.model_dump(exclude_unset=True)
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return profile


# ==================== Notes Endpoints ====================


@app.post("/api/v1/notes", response_model=Note, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new note"""
    note_dict = note_data.model_dump()
    if note_dict.get("password"):
        note_dict["password_hash"] = get_password_hash(note_dict.pop("password"))
        note_dict["is_locked"] = True
    else:
        # Avoid passing password if it's None or empty string if not intended
        note_dict.pop("password", None)

    note = db.create_note(current_user["id"], note_dict)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create note",
        )
    return note


@app.get("/api/v1/notes", response_model=List[Note])
async def get_notes(
    source_type: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all notes for the user, optionally filtered by source_type"""
    notes = db.get_notes(current_user["id"], source_type)
    # Mask content for locked notes in the list view
    processed_notes = []
    for note in notes:
        n = dict(note)
        if n.get("is_locked"):
            n["content"] = "This note is locked."
        processed_notes.append(n)
    return processed_notes


@app.get("/api/v1/notes/{note_id}", response_model=Note)
async def get_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get a specific note"""
    note = db.get_note(note_id, current_user["id"])
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=NOTE_NOT_FOUND
        )

    # If it's locked, don't return the content
    if note.get("is_locked"):
        return {**note, "content": "This note is locked."}

    return note


@app.post("/api/v1/notes/{note_id}/unlock", response_model=Note)
async def unlock_note(
    note_id: str,
    password_data: Dict[str, str],
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Unlock a note to view its full content"""
    password = password_data.get("password")
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Password required"
        )

    if db.verify_note_password(note_id, current_user["id"], password):
        note = db.get_note(note_id, current_user["id"])
        return note
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password"
        )


@app.put("/api/v1/notes/{note_id}", response_model=Note)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update a note"""
    update_dict = note_data.model_dump(exclude_unset=True)

    # Handle password change/lock status
    if "password" in update_dict:
        if update_dict["password"]:
            update_dict["password_hash"] = get_password_hash(
                update_dict.pop("password")
            )
            update_dict["is_locked"] = True
        else:
            # If password is set to empty string or null, unlock it?
            # Or maybe we need an explicit 'is_locked' = False
            update_dict.pop("password")
            if update_dict.get("is_locked") is False:
                update_dict["password_hash"] = None

    note = db.update_note(note_id, current_user["id"], update_dict)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=NOTE_NOT_FOUND
        )
    return note


@app.delete("/api/v1/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a note"""
    success = db.delete_note(note_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=NOTE_NOT_FOUND
        )
    return None


# ==================== Bible Study Endpoints ====================


@app.post("/api/v1/bible-study/sessions", response_model=BibleStudySession)
async def create_bible_study_session(
    session_data: BibleStudySessionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new Bible study session"""
    session_dict = session_data.model_dump()
    session_dict["user_id"] = current_user["id"]

    session = db.create_bible_study_session(session_dict)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_CREATE_SESSION,
        )

    # Generate AI explanation
    try:
        explanation = ai_service.explain_bible_verse(
            book=session_data.book,
            chapter=session_data.chapter,
            verses=session_data.verses,
            selected_text=session_data.selected_text,
            custom_instructions=_get_user_custom_instructions(current_user),
        )

        db.update_bible_study_session(session["id"], {"ai_explanation": explanation})
        session["ai_explanation"] = explanation
    except Exception:
        logger.exception("Error generating AI explanation")

    return session


@app.get("/api/v1/bible-study/sessions", response_model=List[BibleStudySession])
async def get_bible_study_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all Bible study sessions for current user"""
    sessions = db.get_bible_study_sessions(current_user["id"])
    return sessions


@app.get("/api/v1/bible-study/sessions/{session_id}", response_model=BibleStudySession)
async def get_bible_study_session(
    session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific Bible study session"""
    session = db.get_bible_study_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    if session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    return session


@app.post(
    "/api/v1/bible-study/sessions/{session_id}/messages",
    response_model=BibleStudyMessage,
)
async def create_bible_study_message(
    session_id: str,
    message_data: BibleStudyMessageCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a message in a Bible study session"""
    # Verify session ownership
    session = db.get_bible_study_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    message_dict = message_data.model_dump()
    message_dict["session_id"] = session_id

    message = db.create_bible_study_message(message_dict)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_CREATE_MESSAGE,
        )

    return message


@app.get(
    "/api/v1/bible-study/sessions/{session_id}/messages",
    response_model=List[BibleStudyMessage],
)
async def get_bible_study_messages(
    session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all messages for a Bible study session"""
    # Verify session ownership
    session = db.get_bible_study_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    messages = db.get_bible_study_messages(session_id)
    return messages


# ==================== Emotional Support Endpoints ====================


@app.post("/api/v1/emotional-support/sessions", response_model=EmotionalSupportSession)
async def create_emotional_support_session(
    session_data: EmotionalSupportSessionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new emotional support session"""
    session_dict = session_data.model_dump()
    session_dict["user_id"] = current_user["id"]

    session = db.create_emotional_support_session(session_dict)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_CREATE_SESSION,
        )

    # Generate AI response
    try:
        response = ai_service.provide_emotional_support(
            mood=session_data.mood,
            situation=session_data.situation_description or "",
            custom_instructions=_get_user_custom_instructions(current_user),
        )

        db.update_emotional_support_session(session["id"], {"ai_response": response})
        session["ai_response"] = response
    except Exception:
        logger.exception("Error generating AI response")

    return session


@app.get(
    "/api/v1/emotional-support/sessions", response_model=List[EmotionalSupportSession]
)
async def get_emotional_support_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all emotional support sessions for current user"""
    sessions = db.get_emotional_support_sessions(current_user["id"])
    return sessions


@app.post(
    "/api/v1/emotional-support/sessions/{session_id}/messages",
    response_model=EmotionalSupportMessage,
)
async def create_emotional_support_message(
    session_id: str,
    message_data: EmotionalSupportMessageCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a message in an emotional support session"""
    # Verify session ownership
    session = db.get_emotional_support_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    message_dict = message_data.model_dump()
    message_dict["session_id"] = session_id

    message = db.create_emotional_support_message(message_dict)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_CREATE_MESSAGE,
        )

    return message


@app.get(
    "/api/v1/emotional-support/sessions/{session_id}/messages",
    response_model=List[EmotionalSupportMessage],
)
async def get_emotional_support_messages(
    session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all messages for an emotional support session"""
    # Verify session ownership
    session = db.get_emotional_support_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    messages = db.get_emotional_support_messages(session_id)
    return messages


# ==================== Devotion Endpoints ====================


@app.get("/api/v1/devotion/settings", response_model=DevotionSettings)
async def get_devotion_settings(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get devotion settings"""
    settings_data = db.get_devotion_settings(current_user["id"])
    if not settings_data:
        # Create default settings
        default_settings = {
            "user_id": current_user["id"],
            "preferred_time": "07:00",
            "timezone": "UTC",
            "duration_minutes": 15,
            "topics": [],
            "auto_prayer": True,
        }
        settings_data = db.create_devotion_settings(default_settings)

    return settings_data


@app.put("/api/v1/devotion/settings", response_model=DevotionSettings)
async def update_devotion_settings(
    settings_data: DevotionSettingsUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update devotion settings"""
    settings_result = db.update_devotion_settings(
        current_user["id"], settings_data.model_dump(exclude_unset=True)
    )
    if not settings_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update settings",
        )
    return settings_result


@app.post("/api/v1/devotion/schedule", response_model=Devotion)
async def schedule_devotion(
    devotion_data: DevotionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Schedule a devotion"""
    devotion_dict = devotion_data.model_dump()
    devotion_dict["user_id"] = current_user["id"]

    devotion = db.create_devotion(devotion_dict)
    if not devotion:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to schedule devotion",
        )

    return devotion


@app.get("/api/v1/devotion/devotions", response_model=List[Devotion])
async def get_devotions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all devotions for current user"""
    devotions = db.get_devotions(current_user["id"])
    return devotions


@app.put("/api/v1/devotion/devotions/{devotion_id}/complete", response_model=Devotion)
async def complete_devotion(
    devotion_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark a devotion as completed"""
    devotion = db.update_devotion(
        devotion_id,
        {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()},
    )
    if not devotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=DEVOTION_NOT_FOUND
        )
    return devotion


@app.post(
    "/api/v1/devotion/devotions/{devotion_id}/messages",
    response_model=DevotionMessage,
)
async def create_devotion_message(
    devotion_id: str,
    message_data: DevotionMessageCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a message in a devotion session"""
    # Verify devotion ownership
    devotions = db.get_devotions(current_user["id"])
    devotion = next((d for d in devotions if d["id"] == devotion_id), None)
    if not devotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=DEVOTION_NOT_FOUND)

    message_dict = message_data.model_dump()
    message_dict["devotion_id"] = devotion_id

    message = db.create_devotion_message(message_dict)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_CREATE_MESSAGE,
        )

    return message


@app.get(
    "/api/v1/devotion/devotions/{devotion_id}/messages",
    response_model=List[DevotionMessage],
)
async def get_devotion_messages(
    devotion_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all messages for a devotion session"""
    # Verify devotion ownership
    devotions = db.get_devotions(current_user["id"])
    devotion = next((d for d in devotions if d["id"] == devotion_id), None)
    if not devotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=DEVOTION_NOT_FOUND)

    messages = db.get_devotion_messages(devotion_id)
    return messages


async def process_devotion_ai(devotion_id: str):
    """Helper to process AI interaction for daily devotion"""
    try:
        messages = db.get_devotion_messages(devotion_id)
        conversation_history = [
            {"role": m["role"], "content": m["content"]} for m in messages
        ]

        # Get devotion context
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id, day_plan_summary FROM devotions WHERE id = ?", (devotion_id,))
            row = cursor.fetchone()
            if not row: return
            user_id = row['user_id']

        user_profile = db.get_profile(user_id)
        custom_instructions = (
            _get_user_custom_instructions(user_profile) if user_profile else None
        )

        response = await asyncio.to_thread(
            ai_service.generate_response,
            conversation_history,
            "devotion",
            custom_instructions=custom_instructions,
        )
        
        db.create_devotion_message(
            {"devotion_id": devotion_id, "role": "assistant", "content": response}
        )
        
        # If there's an active websocket, send it
        await manager.send_message(
            devotion_id, {"type": "message", "role": "assistant", "content": response}
        )
    except Exception:
        logger.exception("Error in devotion AI")
        await manager.send_message(
            devotion_id, {"type": "error", "message": FAILED_TO_GENERATE_RESPONSE}
        )


@app.websocket("/ws/devotion/{devotion_id}")
async def websocket_devotion(websocket: WebSocket, devotion_id: str):
    """WebSocket endpoint for real-time devotion chat with authentication"""
    try:
        user = get_current_user_websocket(websocket)
        devotions = db.get_devotions(user.get("id"))
        devotion = next((d for d in devotions if d.get("id") == devotion_id), None)
        if not devotion:
            await websocket.close(
                code=4003, reason="Access denied: Devotion ownership failed"
            )
            return

        await manager.connect(websocket, devotion_id)
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                db.create_devotion_message(
                    {
                        "devotion_id": devotion_id,
                        "role": data.get("role", "user"),
                        "content": data.get("content", ""),
                    }
                )
                if data.get("role") == "user":
                    await process_devotion_ai(devotion_id)
    except WebSocketDisconnect:
        manager.disconnect(devotion_id)
    except Exception:
        logger.exception("Devotion WebSocket error")


# ==================== Bible Endpoints ====================


@app.get("/api/v1/bible/chapter/{book}/{chapter}")
async def get_bible_chapter(book: str, chapter: int, version: str = "KJV"):
    """Get all verses in a Bible chapter with Redis + SQLite caching"""
    cache_key = f"bible:chapter:{version.lower()}:{book.lower().replace(' ', '_')}:{chapter}"
    
    # 1. Try Redis (L1 Cache)
    if settings.redis_enabled and redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                logger.info(f"🚀 Redis HIT: {cache_key}")
                return json.loads(cached_data)
        except Exception:
            logger.exception("Redis error")

    try:
        # 2. Try SQLite or API (L2/L3 Cache)
        verses = await db.fetch_bible_chapter_from_api(book, chapter, version)
        if verses:
            result = {
                "success": True, 
                "book": book, 
                "chapter": chapter, 
                "version": version.upper(),
                "verses": verses
            }
            
            # 3. Save to Redis for next time
            if settings.redis_enabled and redis_client:
                try:
                    redis_client.setex(
                        cache_key, 
                        3600 * 24 * 7, # Cache for 1 week
                        json.dumps(result)
                    )
                    logger.info(f"📝 Redis SET: {cache_key}")
                except Exception:
                    logger.exception("Redis set error")
                    
            return result

        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chapter not found or could not be fetched",
            )
    except Exception:
        logger.exception("Error fetching Bible chapter")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch Bible chapter",
        )


@app.get("/api/v1/bible/search", response_model=List[BibleVerse])
async def search_bible(query: str):
    """Search Bible verses"""
    verses = db.search_bible_verses(query)
    return verses


@app.get("/api/v1/bible/verses/{book}/{chapter}/{verse}", response_model=BibleVerse)
async def get_bible_verse(book: str, chapter: int, verse: int, version: str = "KJV"):
    """Get a specific Bible verse with Redis + SQLite caching"""
    cache_key = f"bible:verse:{version.lower()}:{book.lower().replace(' ', '_')}:{chapter}:{verse}"
    
    # 1. Try Redis (L1 Cache)
    if settings.redis_enabled and redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                logger.info(f"🚀 Redis HIT: {cache_key}")
                return json.loads(cached_data)
        except Exception:
            logger.exception("Redis error")

    # 2. Try SQLite (L2 Cache)
    verse_data = db.get_bible_verse(book.lower(), chapter, verse, version)
    if verse_data:
        _cache_in_redis(cache_key, verse_data)
        return verse_data

    # 3. Try fetching from external API (L3 Fallback)
    verse_data = await _fetch_verse_from_api(book, chapter, verse, version)
    if verse_data:
        # Cache in SQLite and Redis
        db.save_bible_verses([verse_data])
        _cache_in_redis(cache_key, verse_data)
        return verse_data

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verse not found")


@app.get("/api/v1/bible/scriptures/{category}", response_model=List[ScriptureReference])
async def get_scripture_references(category: str):
    """Get scripture references by category"""
    references = db.get_scripture_references(category)
    return references


# ==================== AI Endpoints ====================


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    mode: str = Field(
        default="general", pattern="^(general|bibleStudy|emotionalSupport|devotion)$"
    )


class ChatResponse(BaseModel):
    content: str
    role: str = "assistant"
    timestamp: datetime


@app.post("/api/v1/ai/generate", response_model=AIResponse)
async def generate_ai_response(
    request: AIRequest, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate AI response for any mode"""
    try:
        content = ai_service.generate_response(
            request.messages,
            request.mode,
            custom_instructions=_get_user_custom_instructions(current_user),
        )
        return AIResponse(content=content, mode=request.mode)
    except Exception:
        logger.exception("Error generating AI response")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_GENERATE_RESPONSE,
        )



@app.post("/api/v1/ai/voice-chat")
async def voice_chat(
    audio_file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Voice chat endpoint - transcribes audio and returns AI response"""
    try:
        from openai import OpenAI

        # Validate file type
        if not audio_file.content_type.startswith("audio/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Please upload an audio file.",
            )

        # Read audio content (cap at 10 MB)
        MAX_AUDIO_BYTES = 10 * 1024 * 1024
        audio_content = await audio_file.read(MAX_AUDIO_BYTES + 1)
        if len(audio_content) > MAX_AUDIO_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Audio file exceeds the 10 MB limit.",
            )

        # Initialize OpenAI client
        client = OpenAI(api_key=settings.openai_api_key)

        # Transcribe audio using Whisper directly from memory
        transcription_response = client.audio.transcriptions.create(
            model="whisper-1", 
            file=("audio.wav", audio_content), 
            response_format="text"
        )

        transcription = transcription_response.strip()

        # Generate AI response based on transcription
        custom_instructions = _get_user_custom_instructions(current_user)
        response = ai_service.generate_response(
            messages=[{"role": "user", "content": transcription}],
            mode="general",
            custom_instructions=custom_instructions,
        )

        return {
            "transcription": transcription,
            "response": response,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    except Exception:
        logger.exception("Error in voice chat")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process voice message",
        )


class VoiceSessionCreate(BaseModel):
    mode: str = Field(
        default="general",
        pattern="^(general|bibleStudy|emotionalSupport|devotion|voiceCall)$",
    )


@app.post("/api/v1/ai/voice-session", response_model=Dict[str, Any])
async def create_voice_session(
    request: VoiceSessionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new voice call session and return session ID"""
    import uuid

    session_id = str(uuid.uuid4())
    return {
        "session_id": session_id,
        "mode": request.mode,
        "max_duration_minutes": 10,
        "warning_at_minutes": 8,
    }


# ==================== Voice Call WebSocket ====================


class VoiceCallManager:
    """Manager for active voice call WebSocket connections."""

    def __init__(self):
        self.active_calls: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, call_id: str):
        await websocket.accept()
        self.active_calls[call_id] = websocket

    def disconnect(self, call_id: str):
        self.active_calls.pop(call_id, None)

    async def send_message(self, call_id: str, message: Dict[str, Any]):
        if call_id in self.active_calls:
            websocket = self.active_calls[call_id]
            try:
                # Check if socket is still open
                from starlette.websockets import WebSocketState
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_json(message)
            except Exception as e:
                # If sending fails, assume disconnected and cleanup silently
                logger.debug(f"Silent send failure for {call_id}: {e}")
                self.disconnect(call_id)


voice_call_manager = VoiceCallManager()


# Maps Realtime API voice names → TTS voice names (different model families)
_TTS_VOICE_MAP: Dict[str, str] = {
    "alloy": "alloy", "ash": "echo", "ballad": "fable",
    "coral": "nova", "echo": "echo", "sage": "nova",
    "stella": "shimmer", "verse": "nova",
}


def _pcm16_rms(pcm_bytes: bytes) -> float:
    """Return RMS energy of a raw PCM16-LE byte buffer without numpy."""
    import struct
    n = len(pcm_bytes) // 2
    if n == 0:
        return 0.0
    samples = struct.unpack(f"<{n}h", pcm_bytes[:n * 2])
    return (sum(s * s for s in samples) / n) ** 0.5


def _pcm16_to_wav(pcm_bytes: bytes, sample_rate: int = 24000) -> bytes:
    """Wrap raw PCM16-LE mono bytes in a WAV container."""
    import io, wave
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm_bytes)
    return buf.getvalue()


@app.websocket("/ws/voice-call/{call_id}")
async def websocket_voice_call(websocket: WebSocket, call_id: str):
    """Voice call via Whisper STT → NVIDIA NIM → OpenAI TTS pipeline.

    Replaces the OpenAI Realtime API (requires Tier 2) with a Tier-1-compatible
    turn-based approach: accumulate PCM audio, detect end-of-turn by silence,
    transcribe with Whisper, generate with NVIDIA NIM, speak with OpenAI TTS.
    """
    import base64
    from openai import AsyncOpenAI

    try:
        user = get_current_user_websocket(websocket)
    except Exception:
        logger.exception("WebSocket authentication failed")
        await websocket.close(code=4001, reason="Authentication failed")
        return

    ai_config = ai_service.AI_CONFIGS.get("voiceCall", ai_service.AI_CONFIGS["general"])
    custom_instructions = _get_user_custom_instructions(user) if user else None
    voice_preference = user.get("aria_voice", "sage") if user else "sage"
    tts_voice = _TTS_VOICE_MAP.get(voice_preference, "nova")
    instructions = ai_config["system_prompt"]
    if custom_instructions:
        instructions = f"{instructions}\n\nUSER CUSTOMIZATION:\n{custom_instructions}"

    await voice_call_manager.connect(websocket, call_id)
    await voice_call_manager.send_message(
        call_id, {"type": "conversation_started", "message": "Connected to Aria."}
    )

    oai = AsyncOpenAI(api_key=settings.openai_api_key)

    # VAD constants — audio arrives at ~24 kHz, 4096 samples/chunk ≈ 0.17 s/chunk
    BASE_THRESHOLD = 300        # absolute RMS floor; adaptive threshold stays above this
    NOISE_MULTIPLIER = 3.5      # speech must be this many × above ambient noise floor
    SILENCE_FRAMES_END = 7      # ~1.2 s silence triggers end-of-turn (feels natural)
    MIN_SPEECH_FRAMES = 3       # ignore bursts shorter than ~0.5 s
    PREROLL_FRAMES = 3          # prepend ~0.5 s before speech onset to avoid clipping first word
    NOISE_WINDOW = 40           # rolling window of silent frames used to track noise floor

    from collections import deque as _deque
    audio_buffer: list[bytes] = []
    preroll_buffer: _deque[bytes] = _deque(maxlen=PREROLL_FRAMES)
    silence_frames = 0
    speech_frames = 0
    is_speaking = False
    noise_samples: list[float] = []   # recent silent-frame RMS values
    noise_floor = 0.0                 # rolling mean of ambient noise
    conversation_history: list[Dict[str, str]] = []

    # Completed turns wait here; the worker drains them one at a time so
    # the user can keep speaking while Aria is still processing/talking.
    turn_queue: asyncio.Queue[bytes] = asyncio.Queue()

    async def process_turn(pcm_bytes: bytes) -> None:
        """Run the STT → LLM → TTS pipeline for one completed user turn."""
        try:
            import io
            wav_bytes = _pcm16_to_wav(pcm_bytes)
            result = await oai.audio.transcriptions.create(
                model="whisper-1",
                file=("speech.wav", io.BytesIO(wav_bytes), "audio/wav"),
                language="en",
            )
            user_text = result.text.strip()
            if not user_text:
                return
            logger.info(f"[VoiceCall] User said: {user_text}")
            await voice_call_manager.send_message(
                call_id, {"type": "transcript", "text": user_text, "role": "user"}
            )

            conversation_history.append({"role": "user", "content": user_text})
            ai_text = await asyncio.to_thread(
                ai_service.generate_response,
                conversation_history,
                "voiceCall",
                custom_instructions,
            )
            conversation_history.append({"role": "assistant", "content": ai_text})
            await voice_call_manager.send_message(
                call_id, {"type": "transcript", "text": ai_text, "role": "assistant"}
            )

            await voice_call_manager.send_message(call_id, {"type": "aria_speaking", "speaking": True})
            tts_response = await oai.audio.speech.create(
                model="tts-1",
                voice=tts_voice,
                input=ai_text,
                response_format="pcm",
            )
            pcm_out = tts_response.content
            chunk_size = 8192
            for i in range(0, len(pcm_out), chunk_size):
                await voice_call_manager.send_message(call_id, {
                    "type": "audio_output",
                    "audio": base64.b64encode(pcm_out[i:i + chunk_size]).decode(),
                })
        except Exception:
            logger.exception("[VoiceCall] process_turn error")
        finally:
            await voice_call_manager.send_message(call_id, {"type": "aria_speaking", "speaking": False})

    async def turn_worker() -> None:
        """Drain turn_queue sequentially so turns never overlap."""
        while True:
            pcm = await turn_queue.get()
            if pcm is None:          # sentinel — shut down
                break
            await process_turn(pcm)
            turn_queue.task_done()

    worker_task = asyncio.create_task(turn_worker())

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "ping":
                await voice_call_manager.send_message(call_id, {"type": "pong"})

            elif msg_type == "close":
                break

            elif msg_type == "audio_input":
                audio_b64 = data.get("audio", "")
                if not audio_b64:
                    continue

                pcm_chunk = base64.b64decode(audio_b64)
                energy = _pcm16_rms(pcm_chunk)

                # Adaptive threshold: rises with ambient noise so a loud room
                # doesn't cause constant false-positive speech detection.
                adaptive_threshold = max(BASE_THRESHOLD, noise_floor * NOISE_MULTIPLIER)

                if energy > adaptive_threshold:
                    if not is_speaking:
                        is_speaking = True
                        # Prepend pre-roll so the first syllable isn't clipped
                        audio_buffer = list(preroll_buffer)
                        await voice_call_manager.send_message(
                            call_id, {"type": "user_speaking", "speaking": True}
                        )
                    silence_frames = 0
                    speech_frames += 1
                    audio_buffer.append(pcm_chunk)

                else:
                    if not is_speaking:
                        # Track ambient noise floor while the user isn't speaking
                        preroll_buffer.append(pcm_chunk)
                        noise_samples.append(energy)
                        if len(noise_samples) > NOISE_WINDOW:
                            noise_samples.pop(0)
                        noise_floor = sum(noise_samples) / len(noise_samples)
                    else:
                        silence_frames += 1
                        audio_buffer.append(pcm_chunk)

                        if silence_frames >= SILENCE_FRAMES_END and speech_frames >= MIN_SPEECH_FRAMES:
                            is_speaking = False
                            await voice_call_manager.send_message(
                                call_id, {"type": "user_speaking", "speaking": False}
                            )
                            full_audio = b"".join(audio_buffer)
                            audio_buffer = []
                            silence_frames = 0
                            speech_frames = 0
                            await turn_queue.put(full_audio)

    except Exception as e:
        if not isinstance(e, (WebSocketDisconnect, RuntimeError)):
            logger.exception("Voice call error")
            await voice_call_manager.send_message(
                call_id, {"type": "error", "message": "Connection error."}
            )
    finally:
        await turn_queue.put(None)   # stop the worker
        worker_task.cancel()
        voice_call_manager.disconnect(call_id)
        try:
            from starlette.websockets import WebSocketState
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.close()
        except Exception:
            pass
        logger.info(f"Voice call {call_id} ended")


# ==================== WebSocket for Real-time Chat ====================


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_message(self, session_id: str, message: Dict[str, Any]):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)


manager = ConnectionManager()


async def process_bible_study_ai(session_id: str):
    """Helper to process AI interaction for Bible study"""
    try:
        messages = db.get_bible_study_messages(session_id)
        conversation_history = [
            {"role": m["role"], "content": m["content"]} for m in reversed(messages)
        ]
        # Use reversed messages to get history in correct order if get_bible_study_messages returns chronological

        session = db.get_bible_study_session(session_id)
        if session:
            user_profile = db.get_profile(session["user_id"])
            custom_instructions = (
                _get_user_custom_instructions(user_profile) if user_profile else None
            )

            response = ai_service.explain_bible_verse(
                book=session["book"],
                chapter=session["chapter"],
                verses=session["verses"],
                selected_text=session["selected_text"],
                conversation_history=conversation_history,
                custom_instructions=custom_instructions,
            )
            db.create_bible_study_message(
                {"session_id": session_id, "role": "assistant", "content": response}
            )
            await manager.send_message(
                session_id,
                {"type": "message", "role": "assistant", "content": response},
            )
    except Exception:
        logger.exception("Error in Bible study AI")
        await manager.send_message(
            session_id, {"type": "error", "message": FAILED_TO_GENERATE_RESPONSE}
        )


@app.websocket("/ws/bible-study/{session_id}")
async def websocket_bible_study(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time Bible study chat with authentication"""
    try:
        user = get_current_user_websocket(websocket)
        session = db.get_bible_study_session(session_id)
        if not session or session.get("user_id") != user.get("id"):
            await websocket.close(
                code=4003, reason="Access denied: Session ownership failed"
            )
            return

        await manager.connect(websocket, session_id)
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                db.create_bible_study_message(
                    {
                        "session_id": session_id,
                        "role": data.get("role", "user"),
                        "content": data.get("content", ""),
                    }
                )
                if data.get("role") == "user":
                    await process_bible_study_ai(session_id)
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception:
        logger.exception("Bible study WebSocket error")


async def process_emotional_support_ai(session_id: str):
    """Helper to process AI interaction for emotional support"""
    try:
        messages = db.get_emotional_support_messages(session_id)
        conversation_history = [
            {"role": m["role"], "content": m["content"]} for m in reversed(messages)
        ]

        session = db.get_emotional_support_session(session_id)
        user_profile = db.get_profile(session["user_id"]) if session else None
        custom_instructions = (
            _get_user_custom_instructions(user_profile) if user_profile else None
        )

        response = await asyncio.to_thread(
            ai_service.generate_response,
            conversation_history,
            "emotionalSupport",
            custom_instructions=custom_instructions,
        )
        db.create_emotional_support_message(
            {"session_id": session_id, "role": "assistant", "content": response}
        )
        await manager.send_message(
            session_id, {"type": "message", "role": "assistant", "content": response}
        )
    except Exception:
        logger.exception("Error in emotional support AI")
        await manager.send_message(
            session_id, {"type": "error", "message": FAILED_TO_GENERATE_RESPONSE}
        )


@app.websocket("/ws/emotional-support/{session_id}")
async def websocket_emotional_support(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time emotional support chat with authentication"""
    try:
        user = get_current_user_websocket(websocket)
        sessions = db.get_emotional_support_sessions(user.get("id"))
        session = next((s for s in sessions if s.get("id") == session_id), None)
        if not session:
            await websocket.close(
                code=4003, reason="Access denied: Session ownership failed"
            )
            return

        await manager.connect(websocket, session_id)
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "message":
                db.create_emotional_support_message(
                    {
                        "session_id": session_id,
                        "role": data.get("role", "user"),
                        "content": data.get("content", ""),
                    }
                )
                if data.get("role") == "user":
                    await process_emotional_support_ai(session_id)
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception:
        logger.exception("Emotional support WebSocket error")


# ==================== AI Chat Endpoints ====================


@app.get("/api/v1/ai-chat/sessions", response_model=List[AIChatSession])
async def get_chat_sessions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all chat sessions for the current user"""
    return db.get_chat_sessions(current_user["id"])


@app.post("/api/v1/ai-chat/sessions", response_model=AIChatSession)
async def create_chat_session(
    session_data: AIChatSessionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new chat session"""
    session = db.create_chat_session(current_user["id"], session_data.title)
    if not session:
        raise HTTPException(status_code=500, detail=FAILED_TO_CREATE_SESSION)
    return session


@app.get(
    "/api/v1/ai-chat/sessions/{session_id}/messages", response_model=List[AIChatMessage]
)
async def get_chat_messages(
    session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get all messages for a chat session"""
    session = db.get_chat_session(session_id)
    if not session or session.get("user_id") != current_user.get("id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return db.get_chat_session_messages(session_id)


@app.post("/api/v1/ai/chat", response_model=AIResponse)
async def chat_with_aria(
    request: AIRequest,
    session_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Chat with Aria and save to history"""
    try:
        user_id = current_user["id"]

        # If no session_id provided, create a new one
        if not session_id:
            # Try to extract a title from the first message
            title = (
                request.messages[-1].get("content", "")[:30]
                if request.messages
                else "New Conversation"
            )
            session = db.create_chat_session(user_id, title)
            if not session:
                raise HTTPException(status_code=500, detail=FAILED_TO_CREATE_SESSION)
            session_id = session["id"]

        # Save user message
        user_message = request.messages[-1].get("content", "") if request.messages else ""
        if user_message:
            db.create_chat_message(
                {"session_id": session_id, "role": "user", "content": user_message}
            )

        # Get custom instructions
        profile = db.get_profile(user_id)
        custom_instructions = (
            _get_user_custom_instructions(profile) if profile else None
        )

        # Prepare full context for AI
        full_context = [
            {"role": m.get("role", "user"), "content": m.get("content", "")} for m in request.messages
        ]

        # Generate response
        response_content = ai_service.generate_response(
            messages=full_context,
            mode=request.mode or "general",
            custom_instructions=custom_instructions,
        )

        # Save assistant message
        db.create_chat_message(
            {"session_id": session_id, "role": "assistant", "content": response_content}
        )

        return AIResponse(content=response_content, mode=request.mode or "general")

    except Exception as e:
        logger.exception("Chat error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=FAILED_TO_GENERATE_RESPONSE)


from fastapi.responses import StreamingResponse

@app.post("/api/v1/ai/chat/stream")
async def chat_with_aria_stream(
    request: AIRequest,
    session_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Stream chat with Aria and save to history"""
    try:
        user_id = current_user["id"]

        if not session_id:
            title = request.messages[-1].get("content", "")[:30] if request.messages else "New Conversation"
            session = db.create_chat_session(user_id, title)
            if not session:
                raise HTTPException(status_code=500, detail=FAILED_TO_CREATE_SESSION)
            session_id = session["id"]

        user_message = request.messages[-1].get("content", "") if request.messages else ""
        if user_message:
            db.create_chat_message(
                {"session_id": session_id, "role": "user", "content": user_message}
            )

        profile = db.get_profile(user_id)
        custom_instructions = _get_user_custom_instructions(profile) if profile else None
        full_context = [{"role": m.get("role", "user"), "content": m.get("content", "")} for m in request.messages]

        async def generate():
            chunks = await asyncio.to_thread(
                lambda: list(ai_service.generate_response_stream(
                    messages=full_context,
                    mode=request.mode or "general",
                    custom_instructions=custom_instructions,
                ))
            )
            full_content = ""
            for chunk in chunks:
                full_content += chunk
                yield chunk
            if full_content:
                db.create_chat_message(
                    {"session_id": session_id, "role": "assistant", "content": full_content}
                )

        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        logger.exception("Chat stream error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=FAILED_TO_GENERATE_RESPONSE)


# ==================== Serve Frontend ====================


@app.get("/api/v1/home/data")
async def get_home_data(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all home page data including verse, activity and stats"""
    from datetime import datetime

    # Get user profile - handle case where current_user might be None
    user_id = current_user.get("id") if current_user else None

    if not user_id:
        # Return default data if no user
        return {
            "user": {"name": "Believer"},
            "verse_of_day": {
                "verse": "The LORD is my shepherd; I shall not want.",
                "reference": "Psalm 23:1",
            },
            "activity": [],
            "stats": {"streak": 0, "time_today_minutes": 0, "verses_saved": 0},
            "recent_prayers": [],
        }

    # Get user profile
    profile = db.get_profile(user_id)
    user_name = profile.get("full_name", "Believer") if profile else "Believer"

    # Get recent activity
    activity = db.get_user_activity(user_id, limit=3)

    # Get user stats
    stats = db.get_user_stats(user_id)

    # Get recent prayers
    prayers = db.get_prayers(user_id)
    recent_prayers = prayers[:3] if prayers else []

    # Get personalized verse - Cache in DB to ensure it only changes once per day
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        # Try database cache first
        verse = db.get_cached_verse(user_id, today)

        # If no cached verse, generate new one
        if not verse:
            # Get user's recent topics from activity
            recent_moods = []
            if activity:
                for a in activity[:3]:
                    if a.get("type") == "support":
                        recent_moods.append(a.get("title", ""))

            # Generate personalized verse with insight
            verse = ai_service.get_personalized_verse(recent_moods)

            # Generate Daily Manna based on the verse
            verse["daily_manna"] = ai_service.get_daily_manna(verse)

            # Save to database cache
            db.save_cached_verse(user_id, today, verse)
    except Exception:
        logger.exception("Error getting personalized verse")
        # Fallback verse
        verse = {
            "verse": "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
            "reference": "Jeremiah 29:11",
            "insight": "Even in uncertain times, God's promise of a hopeful future stands as an anchor for your soul.",
            "daily_manna": "Grant me the grace to see Your hand in the mundane today, and the courage to follow where You lead.",
        }

    return {
        "user": {"name": user_name},
        "verse_of_day": verse,
        "activity": activity,
        "stats": stats,
        "recent_prayers": recent_prayers,
    }


@app.get("/api/v1/home/verse")
async def get_personalized_verse(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get AI-generated personalized verse with insight based on user's recent activity"""
    try:
        user_id = current_user.get("id")
        today = datetime.now().strftime("%Y-%m-%d")

        # Try database cache first
        verse = db.get_cached_verse(user_id, today)

        # If no cached verse, generate new one
        if not verse:
            # Get recent activity to determine user's current state
            activity = db.get_user_activity(current_user["id"], limit=5)
            recent_moods = []
            for a in activity:
                if a.get("type") == "support":
                    recent_moods.append(a.get("title", ""))

            verse = ai_service.get_personalized_verse(recent_moods)

            # Generate Daily Manna based on the verse
            verse["daily_manna"] = ai_service.get_daily_manna(verse)

            # Save to database cache
            db.save_cached_verse(user_id, today, verse)

        return {"success": True, "verse": verse}
    except Exception:
        logger.exception("Error getting personalized verse")
        # Fallback verse
        return {
            "success": True,
            "verse": {
                "verse": "The LORD is my shepherd; I shall not want.",
                "reference": "Psalm 23:1",
                "insight": "When the day feels overwhelming, find rest in the truth that you are fully seen and perfectly cared for by your Shepherd.",
            },
        }


@app.get("/api/v1/home/activity")
async def get_home_activity(
    limit: int = 5, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's recent activity for the home page or full list"""
    try:
        activity = db.get_user_activity(current_user["id"], limit=limit)
        return {"success": True, "activity": activity}
    except Exception:
        logger.exception("Error getting activity")
        return {"success": False, "activity": [], "error": "Failed to load activity"}


@app.get("/api/v1/home/stats")
async def get_home_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user stats for spiritual growth"""
    try:
        stats = db.get_user_stats(current_user["id"])
        return {"success": True, "stats": stats}
    except Exception:
        logger.exception("Error getting stats")
        return {"success": False, "stats": {}, "error": "Failed to load stats"}


# ==================== Prayer Endpoints ====================


@app.post("/api/v1/prayers", response_model=Prayer)
async def create_prayer(
    prayer_data: PrayerCreate, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Create a new prayer"""
    if not current_user or not current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    prayer_dict = prayer_data.model_dump()
    prayer_dict["user_id"] = current_user["id"]

    prayer = db.create_prayer(prayer_dict)
    if not prayer:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create prayer",
        )

    return prayer


@app.get("/api/v1/prayers", response_model=List[Prayer])
async def get_prayers(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all prayers for current user"""
    prayers = db.get_prayers(current_user["id"])
    return prayers


@app.delete("/api/v1/prayers/{prayer_id}")
async def delete_prayer(
    prayer_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a prayer"""
    success = db.delete_prayer(prayer_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer not found or failed to delete",
        )
    return {"success": True, "message": "Prayer deleted"}


@app.get("/app")
async def serve_frontend():
    """Serve the frontend application"""
    return FileResponse("static/index.html")


@app.get("/app/{path:path}")
async def serve_frontend_app(path: str):
    """Serve the frontend application for any app route"""
    return FileResponse("static/index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
