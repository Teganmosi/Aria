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
from fastapi.responses import FileResponse, RedirectResponse
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


AUDIO_MPEG = "audio/mpeg"
AUDIO_WAV = "audio/wav"

background_tasks = set()

def run_background_task(coro):
    task = asyncio.create_task(coro)
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    return task


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


def _extract_bible_study_messages(session_id: str) -> List[Dict[str, Any]]:
    messages = db.get_bible_study_messages(session_id)
    session = db.get_bible_study_session(session_id)
    full_messages = []
    if session and session.get("selected_text"):
        full_messages.append({"role": "user", "content": f"Selected Scripture: {session.get('book')} {session.get('chapter')}:{session.get('verses')}\nText: {session.get('selected_text')}"})
    if session and session.get("ai_explanation"):
        full_messages.append({"role": "assistant", "content": session.get("ai_explanation")})
    for m in messages:
        full_messages.append({"role": m.get("role"), "content": m.get("content")})
    return full_messages


def _extract_emotional_support_messages(session_id: str) -> List[Dict[str, Any]]:
    messages = db.get_emotional_support_messages(session_id)
    session = db.get_emotional_support_session(session_id)
    full_messages = []
    if session and session.get("mood"):
        full_messages.append({"role": "user", "content": f"I am feeling: {session.get('mood')}. Situation: {session.get('situation_description')}"})
    if session and session.get("ai_response"):
        full_messages.append({"role": "assistant", "content": session.get("ai_response")})
    for m in messages:
        full_messages.append({"role": m.get("role"), "content": m.get("content")})
    return full_messages


async def synthesize_session_journey(user_id: str, session_id: str, session_type: str):
    """Asynchronous background task to synthesize the user's spiritual journey after a session update."""
    try:
        # Load messages
        if session_type == "bibleStudy":
            full_messages = _extract_bible_study_messages(session_id)
        elif session_type == "emotionalSupport":
            full_messages = _extract_emotional_support_messages(session_id)
        else:
            return

        if not full_messages:
            return

        # Run synthesis using AI
        synthesis = await asyncio.to_thread(
            lambda: ai_service.synthesize_journey(full_messages, session_type)
        )
        if not synthesis:
            return

        # Load profile
        profile = db.get_profile(user_id)
        if not profile:
            return

        # Append/Update personal context
        current_context = profile.get("aria_personal_context") or ""
        timestamp = datetime.now().strftime("%Y-%m-%d")
        new_context_entry = f"[{timestamp} {session_type} Session Takeaway]: {synthesis}"
        
        # Keep the last 6 entries to manage prompt length
        old_entries = [entry.strip() for entry in current_context.split("\n\n") if entry.strip()]
        
        # Check if the new synthesis is different from the last one to avoid duplication
        if not old_entries or old_entries[-1] != new_context_entry:
            old_entries.append(new_context_entry)
            updated_context = "\n\n".join(old_entries[-6:])
            db.update_profile(user_id, {"aria_personal_context": updated_context})
            logger.info(f"Successfully updated personal context for user {user_id}")
    except Exception:
        logger.exception("Failed background journey synthesis task")


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
async def root(request: Request):
    """Root endpoint returning welcome message or redirect to app depending on Accept header"""
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return RedirectResponse(url="/app")
    return {"message": "Welcome to Aria API"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# ==================== Authentication Endpoints ====================


@app.post("/api/v1/auth/register", response_model=Dict[str, Any])
@limiter.limit("3/minute")
async def register(request: Request, user_data: UserRegister):
    """Register a new user"""
    from auth import supabase_auth_signup
    result = await asyncio.to_thread(
        supabase_auth_signup,
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
    from auth import supabase_auth_login
    result = await asyncio.to_thread(supabase_auth_login, email=user_data.email, password=user_data.password)

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("error", "Invalid credentials"),
        )

    return result


@app.post("/api/v1/auth/logout", response_model=Dict[str, Any])
async def logout(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """Logout a user and invalidate their token"""
    from auth import blacklist_token, supabase_auth_logout
    # Blacklist the token
    token = credentials.credentials
    await asyncio.to_thread(blacklist_token, token)

    # Try to get user_id from token for Supabase logout
    payload = decode_access_token(token)
    user_id = payload.get("sub") if payload else None

    if user_id:
        await asyncio.to_thread(supabase_auth_logout)

    return {"success": True, "message": "Logged out successfully. Token invalidated."}


@app.post("/api/v1/auth/refresh", response_model=Dict[str, Any])
async def refresh_token(request: Request):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    body = await request.json()
    old_refresh = body.get("refresh_token", "").strip()
    if not old_refresh:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token required")

    row = await asyncio.to_thread(db.get_refresh_token, old_refresh)
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user_id: str = row["user_id"]
    profile = await asyncio.to_thread(db.get_profile, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Rotate: revoke old, issue new pair
    await asyncio.to_thread(db.revoke_refresh_token, old_refresh)
    new_access = create_access_token(data={"sub": user_id, "email": profile["email"]})
    new_refresh, _ = await asyncio.to_thread(create_refresh_token, user_id, profile["email"])

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


@app.get("/api/v1/auth/oauth/google")
async def oauth_google(redirect_to: str):
    """Redirect user to Supabase Google OAuth authorize endpoint"""
    from fastapi.responses import RedirectResponse
    if not settings.supabase_url:
        raise HTTPException(status_code=400, detail="Supabase URL not configured")
    authorize_url = f"{settings.supabase_url}/auth/v1/authorize?provider=google&redirect_to={redirect_to}"
    return RedirectResponse(url=authorize_url)


class OAuthExchangeRequest(BaseModel):
    access_token: str


@app.post("/api/v1/auth/oauth/exchange", response_model=Dict[str, Any])
async def oauth_exchange(request_data: OAuthExchangeRequest):
    """Exchange a Supabase OAuth access token for a backend local JWT token"""
    from auth import supabase_oauth_exchange
    result = await asyncio.to_thread(supabase_oauth_exchange, request_data.access_token)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "OAuth exchange failed"),
        )
    return result



# ==================== Profile Endpoints ====================


@app.get("/api/v1/profile", response_model=Profile)
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user profile"""
    profile = await asyncio.to_thread(db.get_profile, current_user["id"])
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
    profile = await asyncio.to_thread(
        db.update_profile,
        current_user["id"],
        profile_data.model_dump(exclude_unset=True),
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    invalidate_home_cache(current_user["id"])
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
        password_hash = await asyncio.to_thread(get_password_hash, note_dict.pop("password"))
        note_dict["password_hash"] = password_hash
        note_dict["is_locked"] = True
    else:
        # Avoid passing password if it's None or empty string if not intended
        note_dict.pop("password", None)

    note = await asyncio.to_thread(db.create_note, current_user["id"], note_dict)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create note",
        )
    invalidate_home_cache(current_user["id"])
    return note


@app.get("/api/v1/notes", response_model=List[Note])
async def get_notes(
    source_type: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all notes for the user, optionally filtered by source_type"""
    notes = await asyncio.to_thread(db.get_notes, current_user["id"], source_type)
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
    note = await asyncio.to_thread(db.get_note, note_id, current_user["id"])
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

    is_verified = await asyncio.to_thread(db.verify_note_password, note_id, current_user["id"], password)
    if is_verified:
        note = await asyncio.to_thread(db.get_note, note_id, current_user["id"])
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
            password_hash = await asyncio.to_thread(get_password_hash, update_dict.pop("password"))
            update_dict["password_hash"] = password_hash
            update_dict["is_locked"] = True
        else:
            # If password is set to empty string or null, unlock it?
            # Or maybe we need an explicit 'is_locked' = False
            update_dict.pop("password")
            if update_dict.get("is_locked") is False:
                update_dict["password_hash"] = None

    note = await asyncio.to_thread(db.update_note, note_id, current_user["id"], update_dict)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=NOTE_NOT_FOUND
        )
    invalidate_home_cache(current_user["id"])
    return note


@app.delete("/api/v1/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a note"""
    success = await asyncio.to_thread(db.delete_note, note_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=NOTE_NOT_FOUND
        )
    invalidate_home_cache(current_user["id"])
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

    session = await asyncio.to_thread(db.create_bible_study_session, session_dict)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_CREATE_SESSION,
        )

    # Generate AI explanation
    try:
        custom_instructions = _get_user_custom_instructions(current_user)
        explanation = await asyncio.to_thread(
            ai_service.explain_bible_verse,
            book=session_data.book,
            chapter=session_data.chapter,
            verses=session_data.verses,
            selected_text=session_data.selected_text,
            custom_instructions=custom_instructions,
        )

        await asyncio.to_thread(db.update_bible_study_session, session["id"], {"ai_explanation": explanation})
        session["ai_explanation"] = explanation
        # Trigger background synthesis
        run_background_task(synthesize_session_journey(current_user["id"], session["id"], "bibleStudy"))
    except Exception:
        logger.exception("Error generating AI explanation")

    return session


@app.get("/api/v1/bible-study/sessions", response_model=List[BibleStudySession])
async def get_bible_study_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all Bible study sessions for current user"""
    sessions = await asyncio.to_thread(db.get_bible_study_sessions, current_user["id"])
    return sessions


@app.get("/api/v1/bible-study/sessions/{session_id}", response_model=BibleStudySession)
async def get_bible_study_session(
    session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific Bible study session"""
    session = await asyncio.to_thread(db.get_bible_study_session, session_id)
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
    session = await asyncio.to_thread(db.get_bible_study_session, session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    message_dict = message_data.model_dump()
    message_dict["session_id"] = session_id

    message = await asyncio.to_thread(db.create_bible_study_message, message_dict)
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
    session = await asyncio.to_thread(db.get_bible_study_session, session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    messages = await asyncio.to_thread(db.get_bible_study_messages, session_id)
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

    session = await asyncio.to_thread(db.create_emotional_support_session, session_dict)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FAILED_TO_CREATE_SESSION,
        )

    # Generate AI response
    try:
        custom_instructions = _get_user_custom_instructions(current_user)
        response = await asyncio.to_thread(
            ai_service.provide_emotional_support,
            mood=session_data.mood,
            situation=session_data.situation_description or "",
            custom_instructions=custom_instructions,
        )

        await asyncio.to_thread(db.update_emotional_support_session, session["id"], {"ai_response": response})
        session["ai_response"] = response
        # Trigger background synthesis
        run_background_task(synthesize_session_journey(current_user["id"], session["id"], "emotionalSupport"))
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
    sessions = await asyncio.to_thread(db.get_emotional_support_sessions, current_user["id"])
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
    session = await asyncio.to_thread(db.get_emotional_support_session, session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    message_dict = message_data.model_dump()
    message_dict["session_id"] = session_id

    message = await asyncio.to_thread(db.create_emotional_support_message, message_dict)
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
    session = await asyncio.to_thread(db.get_emotional_support_session, session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=ACCESS_DENIED)

    messages = await asyncio.to_thread(db.get_emotional_support_messages, session_id)
    return messages


# ==================== Devotion Endpoints ====================


@app.get("/api/v1/devotion/settings", response_model=DevotionSettings)
async def get_devotion_settings(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get devotion settings"""
    settings_data = await asyncio.to_thread(db.get_devotion_settings, current_user["id"])
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
        settings_data = await asyncio.to_thread(db.create_devotion_settings, default_settings)

    return settings_data


@app.put("/api/v1/devotion/settings", response_model=DevotionSettings)
async def update_devotion_settings(
    settings_data: DevotionSettingsUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update devotion settings"""
    settings_result = await asyncio.to_thread(
        db.update_devotion_settings,
        current_user["id"],
        settings_data.model_dump(exclude_unset=True),
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

    devotion = await asyncio.to_thread(db.create_devotion, devotion_dict)
    if not devotion:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to schedule devotion",
        )

    return devotion


@app.get("/api/v1/devotion/devotions", response_model=List[Devotion])
async def get_devotions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all devotions for current user"""
    devotions = await asyncio.to_thread(db.get_devotions, current_user["id"])
    return devotions


@app.put("/api/v1/devotion/devotions/{devotion_id}/complete", response_model=Devotion)
async def complete_devotion(
    devotion_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark a devotion as completed"""
    devotion = await asyncio.to_thread(
        db.update_devotion,
        devotion_id,
        {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()},
    )
    if not devotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=DEVOTION_NOT_FOUND
        )
    invalidate_home_cache(current_user["id"])
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
    devotions = await asyncio.to_thread(db.get_devotions, current_user["id"])
    devotion = next((d for d in devotions if d["id"] == devotion_id), None)
    if not devotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=DEVOTION_NOT_FOUND)

    message_dict = message_data.model_dump()
    message_dict["devotion_id"] = devotion_id

    message = await asyncio.to_thread(db.create_devotion_message, message_dict)
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
    devotions = await asyncio.to_thread(db.get_devotions, current_user["id"])
    devotion = next((d for d in devotions if d["id"] == devotion_id), None)
    if not devotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=DEVOTION_NOT_FOUND)

    messages = await asyncio.to_thread(db.get_devotion_messages, devotion_id)
    return messages


async def process_devotion_ai(devotion_id: str):
    """Helper to process AI interaction for daily devotion"""
    try:
        messages = await asyncio.to_thread(db.get_devotion_messages, devotion_id)
        conversation_history = [
            {"role": m["role"], "content": m["content"]} for m in messages
        ]

        # Get devotion context
        def get_user_id():
            with db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT user_id, day_plan_summary FROM devotions WHERE id = ?", (devotion_id,))
                row = cursor.fetchone()
                return row['user_id'] if row else None

        user_id = await asyncio.to_thread(get_user_id)
        if not user_id: return

        user_profile = await asyncio.to_thread(db.get_profile, user_id)
        custom_instructions = (
            _get_user_custom_instructions(user_profile) if user_profile else None
        )

        response = await asyncio.to_thread(
            ai_service.generate_response,
            conversation_history,
            "devotion",
            custom_instructions=custom_instructions,
        )
        
        await asyncio.to_thread(
            db.create_devotion_message,
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
        user = await get_current_user_websocket(websocket)
        devotions = await asyncio.to_thread(db.get_devotions, user.get("id"))
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
                await asyncio.to_thread(
                    db.create_devotion_message,
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
    verses = await asyncio.to_thread(db.search_bible_verses, query)
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
    verse_data = await asyncio.to_thread(db.get_bible_verse, book.lower(), chapter, verse, version)
    if verse_data:
        _cache_in_redis(cache_key, verse_data)
        return verse_data

    # 3. Try fetching from external API (L3 Fallback)
    verse_data = await _fetch_verse_from_api(book, chapter, verse, version)
    if verse_data:
        # Cache in SQLite and Redis
        await asyncio.to_thread(db.save_bible_verses, [verse_data])
        _cache_in_redis(cache_key, verse_data)
        return verse_data

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verse not found")


@app.get("/api/v1/bible/scriptures/{category}", response_model=List[ScriptureReference])
async def get_scripture_references(category: str):
    """Get scripture references by category"""
    references = await asyncio.to_thread(db.get_scripture_references, category)
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


@app.get("/api/v1/ai/welcome-greeting")
async def get_welcome_greeting(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Generate a highly personalized welcome greeting based on user personal context."""
    user_id = current_user["id"]
    profile = await asyncio.to_thread(db.get_profile, user_id)
    if not profile:
        return {"greeting": "Welcome back! How can I walk with you in faith today?"}
         
    context = (profile.get("aria_personal_context") or "").strip()
    full_name = profile.get("full_name", "Believer")
    first_name = full_name.split(" ")[0]
    
    if not context:
        return {"greeting": f"Welcome back, {first_name}. I'm here to reflect and pray with you. What is on your heart today?"}
         
    # Prompt the LLM to generate a personalized check-in
    prompt = f"""You are Aria, a Christ-centred spiritual companion. 
Generate a warm, short (2-3 sentences max) welcome-back greeting for {first_name} based on their personal context.
Reference their recent study focus or emotional hurdles if present in the context, and ask them how they are holding up or how you can support them today.
Ground your greeting in a gentle, caring, and faith-filled tone. Do not use markdown format or list bullet points. Keep it in a single paragraph of text.

Their current life and spiritual context:
{context}

Response:"""
    
    try:
        response_content = await asyncio.to_thread(
            ai_service.generate_response,
            messages=[{"role": "user", "content": prompt}],
            mode="general"
        )
        return {"greeting": response_content.strip()}
    except Exception:
        logger.exception("Failed to generate welcome greeting")
        return {"greeting": f"Welcome back, {first_name}. How are you holding up today?"}


@app.post("/api/v1/ai/generate", response_model=AIResponse)
async def generate_ai_response(
    request: AIRequest, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate AI response for any mode"""
    try:
        custom_instructions = _get_user_custom_instructions(current_user)
        content = await asyncio.to_thread(
            ai_service.generate_response,
            request.messages,
            request.mode,
            custom_instructions=custom_instructions,
            user_id=current_user["id"],
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
            user_id=current_user["id"],
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


# GCP Service Account Credentials Setup
if settings.google_application_credentials:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
    logger.info(f"🔑 Google Cloud credentials file path set to: {settings.google_application_credentials}")
elif settings.gcp_service_account_json:
    try:
        if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            gcp_creds_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gcp-credentials-temp.json")
            creds_data = json.loads(settings.gcp_service_account_json)
            with open(gcp_creds_path, "w", encoding="utf-8") as f:
                json.dump(creds_data, f)
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = gcp_creds_path
            logger.info("🔑 Google Cloud Service Account credentials written dynamically from environment string.")
    except Exception:
        logger.exception("❌ Failed to set up dynamic GCP credentials from GCP_SERVICE_ACCOUNT_JSON")

_GCP_VOICE_MAP = {
    "Idera": {"language_code": "en-GB", "name": "en-GB-Neural2-A"},
    "Emma": {"language_code": "en-GB", "name": "en-GB-Neural2-B"},
    "Zainab": {"language_code": "en-GB", "name": "en-GB-Neural2-C"},
    "Osagie": {"language_code": "en-GB", "name": "en-GB-Neural2-D"},
    "Wura": {"language_code": "en-US", "name": "en-US-Neural2-F"},
    "Jude": {"language_code": "en-US", "name": "en-US-Neural2-D"},
    "Chinenye": {"language_code": "en-US", "name": "en-US-Neural2-H"},
    "Tayo": {"language_code": "en-US", "name": "en-US-Neural2-I"},
    "Regina": {"language_code": "en-US", "name": "en-US-Neural2-F"},
    "Femi": {"language_code": "en-GB", "name": "en-GB-Neural2-D"},
    "Adaora": {"language_code": "en-GB", "name": "en-GB-Neural2-A"},
    "Umar": {"language_code": "en-US", "name": "en-US-Neural2-J"},
    "Mary": {"language_code": "en-US", "name": "en-US-Neural2-C"},
    "Nonso": {"language_code": "en-US", "name": "en-US-Neural2-J"},
    "Remi": {"language_code": "en-GB", "name": "en-GB-Neural2-C"},
    "Adam": {"language_code": "en-US", "name": "en-US-Neural2-D"},
}

def _is_gcp_tts_configured() -> bool:
    """Check if Google Cloud credentials are set up"""
    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    return bool(creds_path and os.path.exists(creds_path))

def _generate_gcp_tts(text: str, voice_name: str, response_format: str) -> Optional[bytes]:
    """Generate speech using Google Cloud Text-to-Speech premium voices"""
    try:
        from google.cloud import texttospeech
        
        voice_info = _GCP_VOICE_MAP.get(voice_name, {"language_code": "en-US", "name": "en-US-Neural2-F"})
        
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=voice_info["language_code"],
            name=voice_info["name"]
        )
        
        encoding_map = {
            "mp3": texttospeech.AudioEncoding.MP3,
            "wav": texttospeech.AudioEncoding.LINEAR16,
            "ogg": texttospeech.AudioEncoding.OGG_OPUS,
            "opus": texttospeech.AudioEncoding.OGG_OPUS,
            "flac": texttospeech.AudioEncoding.LINEAR16,
        }
        encoding = encoding_map.get(response_format.lower(), texttospeech.AudioEncoding.MP3)
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=encoding
        )
        
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        return response.audio_content
    except Exception:
        logger.exception(f"Error generating Google Cloud TTS for voice {voice_name}")
        return None


class TTSRequest(BaseModel):
    text: str = Field(..., max_length=2000)
    voice: Optional[str] = "Idera"
    response_format: Optional[str] = "mp3"


def _split_long_sentence(sentence: str, max_chunk_len: int) -> List[str]:
    """Splits a single long sentence into smaller pieces."""
    chunks = []
    current_chunk = []
    current_len = 0
    words = sentence.split(' ')
    for word in words:
        if len(word) > max_chunk_len:
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_len = 0
            for i in range(0, len(word), max_chunk_len):
                chunks.append(word[i:i+max_chunk_len])
        elif current_len + len(word) + 1 > max_chunk_len:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_len = len(word)
        else:
            current_chunk.append(word)
            current_len += len(word) + 1
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks


def _split_text_into_chunks(text: str, max_chunk_len: int = 450) -> List[str]:
    """Splits a long text into chunks of at most max_chunk_len characters, trying to split on sentence boundaries."""
    if len(text) <= max_chunk_len:
        return [text]
    
    import re
    # Split on sentence boundaries: period, exclamation, question mark followed by space
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_len = 0
    
    for sentence in sentences:
        if len(sentence) > max_chunk_len:
            # If a single sentence is longer than max_chunk_len, we split it by words/spaces
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_len = 0
            chunks.extend(_split_long_sentence(sentence, max_chunk_len))
        elif current_len + len(sentence) + 1 > max_chunk_len:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_len = len(sentence)
        else:
            current_chunk.append(sentence)
            current_len += len(sentence) + 1
            
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return [c.strip() for c in chunks if c.strip()]


async def _generate_pocket_tts(text: str, voice: str) -> Optional[bytes]:
    pocket_voice = POCKET_TTS_VOICE_MAP.get(voice, "cosette")
    logger.info(f"Generating TTS using Pocket-TTS (voice={voice} -> {pocket_voice})")
    try:
        import httpx
        chunks = _split_text_into_chunks(text, max_chunk_len=450)
        async with httpx.AsyncClient(timeout=30.0) as client:
            all_pcm = []
            for chunk_idx, chunk in enumerate(chunks):
                logger.info(f"Generating Pocket-TTS chunk {chunk_idx + 1}/{len(chunks)}: length={len(chunk)}")
                payload = {"text": chunk, "voice": pocket_voice}
                chunk_wav = None
                response = await client.post("https://teganmosi-realtime.hf.space/tts", json=payload)
                if response.status_code == 200:
                    chunk_wav = response.content
                else:
                    logger.warning(f"Pocket-TTS POST failed for chunk {chunk_idx + 1} with status {response.status_code}; trying GET fallback...")
                    response_get = await client.get("https://teganmosi-realtime.hf.space/tts", params={"text": chunk, "voice": pocket_voice})
                    if response_get.status_code == 200:
                        chunk_wav = response_get.content
                    else:
                        logger.error(f"Pocket-TTS GET also failed for chunk {chunk_idx + 1} with status {response_get.status_code}")
                
                if chunk_wav is None:
                    raise RuntimeError(f"Failed to generate Pocket-TTS audio for chunk {chunk_idx + 1}")
                
                chunk_pcm = _wav_to_pcm16(chunk_wav)
                if not chunk_pcm:
                    raise RuntimeError(f"Failed to extract PCM bytes from WAV for chunk {chunk_idx + 1}")
                all_pcm.append(chunk_pcm)
            
            combined_pcm = b"".join(all_pcm)
            return _pcm16_to_wav(combined_pcm, sample_rate=24000)
    except Exception:
        logger.exception("Pocket-TTS generation failed")
        return None


async def _generate_yarngpt_tts(text: str, voice: str, response_format: str) -> Optional[bytes]:
    if settings.yarngpt_api_key and settings.yarngpt_api_key != "your_yarngpt_api_key_here":
        logger.info(f"Generating TTS using YarnGPT (voice={voice})")
        try:
            import httpx
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "Authorization": f"Bearer {settings.yarngpt_api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "text": text,
                    "voice": voice,
                    "response_format": response_format
                }
                response = await client.post("https://yarngpt.ai/api/v1/tts", headers=headers, json=payload)
                if response.status_code == 200:
                    return response.content
                else:
                    logger.error(f"YarnGPT TTS API returned error {response.status_code}: {response.text}")
        except Exception:
            logger.exception("YarnGPT TTS generation failed")
    return None


async def _generate_openai_tts(text: str, voice: str, response_format: str) -> Optional[bytes]:
    if settings.openai_api_key and settings.openai_api_key != "your_openai_api_key_here":
        logger.info(f"Generating TTS using OpenAI (voice={voice})")
        try:
            from openai import AsyncOpenAI
            oai = AsyncOpenAI(api_key=settings.openai_api_key)
            openai_voice_map = {
                "Osagie": "alloy", "Jude": "echo", "Femi": "onyx",
                "Adaora": "nova", "Umar": "echo", "Wura": "shimmer", "Idera": "nova"
            }
            oai_voice = openai_voice_map.get(voice, "nova")
            oai_format = response_format.lower()
            if oai_format not in ["mp3", "opus", "aac", "flac", "wav", "pcm"]:
                oai_format = "mp3"
            tts_response = await oai.audio.speech.create(
                model="tts-1",
                voice=oai_voice,
                input=text,
                response_format=oai_format,
            )
            return tts_response.content
        except Exception:
            logger.exception("OpenAI TTS generation failed")
    return None


async def _generate_tts_bytes(text: str, voice: str, response_format: str) -> bytes:
    """Generate TTS bytes using Pocket-TTS (primary), GCP, YarnGPT, or OpenAI (fallbacks)"""
    # 1. Try Pocket-TTS (Primary)
    pocket_bytes = await _generate_pocket_tts(text, voice)
    if pocket_bytes:
        return pocket_bytes

    # 2. Try Google Cloud Text-to-Speech
    if _is_gcp_tts_configured():
        logger.info(f"Generating TTS using Google Cloud (voice={voice})")
        gcp_bytes = _generate_gcp_tts(text, voice, response_format)
        if gcp_bytes:
            return gcp_bytes
        logger.warning("Google Cloud TTS generation failed; attempting fallback...")

    # 3. Try YarnGPT
    yarngpt_bytes = await _generate_yarngpt_tts(text, voice, response_format)
    if yarngpt_bytes:
        return yarngpt_bytes

    # 4. Try OpenAI
    openai_bytes = await _generate_openai_tts(text, voice, response_format)
    if openai_bytes:
        return openai_bytes

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="No Text-to-Speech provider is available or configured."
    )


@app.post("/api/v1/tts")
async def text_to_speech(request: TTSRequest):
    """Proxy Text-to-Speech requests to the active TTS provider with fallback"""
    try:
        content = await _generate_tts_bytes(request.text, request.voice, request.response_format)
        
        from fastapi.responses import StreamingResponse
        import io
        
        content_types = {
            "mp3": AUDIO_MPEG,
            "wav": AUDIO_WAV,
            "opus": "audio/opus",
            "flac": "audio/flac"
        }
        media_type = content_types.get(request.response_format.lower(), AUDIO_MPEG)
        if content.startswith(b"RIFF"):
            media_type = AUDIO_WAV
        
        return StreamingResponse(
            io.BytesIO(content),
            media_type=media_type
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during POST TTS request")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during speech conversion: {e}"
        )


@app.get("/api/v1/tts")
async def text_to_speech_get(
    text: str,
    voice: Optional[str] = "Idera",
    response_format: Optional[str] = "mp3",
    token: Optional[str] = None
):
    """Proxy Text-to-Speech requests to the active TTS provider via GET for progressive streaming"""
    if token:
        try:
            from auth import get_current_user_from_token
            get_current_user_from_token(token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token."
            )
            
    try:
        content = await _generate_tts_bytes(text, voice, response_format)
        
        from fastapi.responses import StreamingResponse
        import io
        
        content_types = {
            "mp3": AUDIO_MPEG,
            "wav": AUDIO_WAV,
            "opus": "audio/opus",
            "flac": "audio/flac"
        }
        media_type = content_types.get(response_format.lower(), AUDIO_MPEG)
        if content.startswith(b"RIFF"):
            media_type = AUDIO_WAV
        
        headers = {
            "Accept-Ranges": "bytes",
            "Cache-Control": "no-cache",
        }
        
        return StreamingResponse(
            io.BytesIO(content),
            media_type=media_type,
            headers=headers
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during GET TTS request")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during speech conversion: {e}"
        )


# ==================== Voice Call WebSocket ====================


class VoiceCallManager:
    """Manager for active voice call WebSocket connections."""

    def __init__(self):
        self.active_calls: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, call_id: str):
        from starlette.websockets import WebSocketState
        if websocket.client_state == WebSocketState.CONNECTING:
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


# Maps Realtime API voice names → YarnGPT voice names
_TTS_VOICE_MAP: Dict[str, str] = {
    "alloy": "Osagie",
    "ash": "Jude",
    "ballad": "Femi",
    "coral": "Adaora",
    "echo": "Umar",
    "sage": "Osagie",
    "stella": "Wura",
    "verse": "Idera",
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


def _wav_to_pcm16(wav_bytes: bytes) -> bytes:
    """Extract raw PCM bytes from a WAV container."""
    import io, wave
    try:
        with wave.open(io.BytesIO(wav_bytes), "rb") as wf:
            params = wf.getparams()
            return wf.readframes(params.nframes)
    except Exception:
        logger.exception("Error converting WAV to PCM")
        return b""


POCKET_TTS_VOICE_MAP = {
    "Osagie": "marius",
    "Jude": "javert",
    "Femi": "jean",
    "Adaora": "alba",
    "Umar": "charles",
    "Wura": "anna",
    "Idera": "cosette",
    "nova": "cosette",
    "alloy": "cosette",
    "ash": "javert",
    "ballad": "jean",
    "coral": "alba",
    "echo": "charles",
    "sage": "cosette",
    "stella": "anna",
    "verse": "cosette",
}


def _resample_24k_to_16k_float32(pcm_bytes: bytes) -> bytes:
    """Resample 24kHz 16-bit mono PCM to 16kHz Float32 PCM using linear interpolation."""
    import numpy as np
    pcm_data = np.frombuffer(pcm_bytes, dtype=np.int16)
    if len(pcm_data) == 0:
        return b""
    # Convert to float32 normalized to [-1.0, 1.0]
    float32_data = pcm_data.astype(np.float32) / 32768.0

    # Resample 24000 to 16000 (ratio 2/3)
    duration = len(float32_data) / 24000
    num_target_samples = int(duration * 16000)
    if num_target_samples == 0:
        return b""

    x_orig = np.arange(len(float32_data))
    x_target = np.linspace(0, len(float32_data) - 1, num_target_samples)
    resampled = np.interp(x_target, x_orig, float32_data).astype(np.float32)
    return resampled.tobytes()


# ==================== Voice Call WebSocket ====================


# ==================== Voice Call WebSocket ====================


async def synthesize_voice_journey(user_id: str, messages: List[Dict[str, str]]):
    """Background task to synthesize a journey summary from a voice call transcript."""
    try:
        synthesis = await asyncio.to_thread(
            ai_service.synthesize_journey,
            messages,
            "voiceCall"
        )
        if not synthesis:
            return
            
        profile = db.get_profile(user_id)
        if not profile:
            return
            
        old_context = profile.get("aria_personal_context") or ""
        old_entries = [e.strip() for e in old_context.split("\n\n") if e.strip()]
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        new_context_entry = f"[{timestamp} Voice Session Takeaway]: {synthesis}"
        
        if not old_entries or old_entries[-1] != new_context_entry:
            old_entries.append(new_context_entry)
            updated_context = "\n\n".join(old_entries[-6:])
            db.update_profile(user_id, {"aria_personal_context": updated_context})
            logger.info(f"Successfully updated personal context from voice call for user {user_id}")
    except Exception:
        logger.exception("Failed background voice journey synthesis task")


@app.websocket("/ws/voice-call/{call_id}")
async def _connect_and_configure_s2s(call_id: str, pocket_voice: str, system_prompt: str):
    """Connect to S2S with exponential backoff retry (handles 1012 cold-start)."""
    import websockets
    import json
    
    max_attempts = 5
    s2s_url = "wss://teganmosi-realtime.hf.space/s2s"
    for attempt in range(1, max_attempts + 1):
        try:
            logger.info(f"S2S connect attempt {attempt}/{max_attempts} for call {call_id}...")
            ws = await websockets.connect(
                s2s_url, 
                open_timeout=15,
                ping_interval=30,
                ping_timeout=60
            )
            config_payload = {
                "type": "config",
                "voice": pocket_voice,
                "system_prompt": system_prompt,
            }
            await ws.send(json.dumps(config_payload))
            config_response = await ws.recv()
            logger.info(f"S2S configured (attempt {attempt}): {config_response}")
            return ws
        except Exception as e:
            logger.warning(f"S2S connect attempt {attempt} failed: {e}")
            if attempt < max_attempts:
                wait = 2 ** (attempt - 1)   # 1s, 2s, 4s, 8s
                logger.info(f"Retrying in {wait}s...")
                await asyncio.sleep(wait)
            else:
                raise


async def _process_frontend_message(data: Dict[str, Any], call_id: str, s2s_ref: Dict[str, Any], reconnecting: asyncio.Event) -> bool:
    import base64
    msg_type = data.get("type")
    if msg_type == "ping":
        await voice_call_manager.send_message(call_id, {"type": "pong"})
    elif msg_type == "close":
        return False
    elif msg_type == "audio_input" and not reconnecting.is_set():
        audio_b64 = data.get("audio", "")
        if audio_b64:
            float32_bytes = base64.b64decode(audio_b64)
            if float32_bytes:
                try:
                    await s2s_ref["ws"].send(float32_bytes)
                except Exception:
                    pass
    return True


async def _forward_frontend_to_s2s(websocket: WebSocket, call_id: str, s2s_ref: Dict[str, Any], reconnecting: asyncio.Event):
    try:
        while True:
            data = await websocket.receive_json()
            should_continue = await _process_frontend_message(data, call_id, s2s_ref, reconnecting)
            if not should_continue:
                break
    except Exception as e:
        if not isinstance(e, (WebSocketDisconnect, RuntimeError)):
            logger.exception("Error in forward_frontend_to_s2s")


async def _handle_s2s_status(data: Dict[str, Any], call_id: str):
    msg = data.get("message", "")
    if msg == "Listening...":
        await voice_call_manager.send_message(call_id, {"type": "user_speaking", "speaking": True})
    elif msg == "Transcribing...":
        await voice_call_manager.send_message(call_id, {"type": "user_speaking", "speaking": False})


async def _handle_s2s_transcription(data: Dict[str, Any], call_messages: List[Dict[str, str]], call_id: str):
    text = data.get("text", "")
    if text:
        call_messages.append({"role": "user", "content": text})
        await voice_call_manager.send_message(call_id, {
            "type": "transcript",
            "text": text,
            "role": "user"
        })


async def _handle_s2s_llm_text(data: Dict[str, Any], call_messages: List[Dict[str, str]], call_id: str):
    text = data.get("text", "")
    if text:
        if call_messages and call_messages[-1]["role"] == "assistant":
            call_messages[-1]["content"] += " " + text
        else:
            call_messages.append({"role": "assistant", "content": text})
        await voice_call_manager.send_message(call_id, {
            "type": "transcript",
            "text": text,
            "role": "assistant"
        })


async def _handle_s2s_string_message(data: Dict[str, Any], call_messages: List[Dict[str, str]], call_id: str) -> Optional[bool]:
    msg_type = data.get("type")
    if msg_type == "status":
        await _handle_s2s_status(data, call_id)
    elif msg_type == "transcription":
        await _handle_s2s_transcription(data, call_messages, call_id)
    elif msg_type == "llm_text":
        await _handle_s2s_llm_text(data, call_messages, call_id)
    elif msg_type == "done":
        await voice_call_manager.send_message(call_id, {"type": "aria_speaking", "speaking": False})
        return False
    return None



async def _handle_s2s_message(res, call_messages: List[Dict[str, str]], call_id: str, aria_speaking_active: bool) -> bool:
    import base64
    import json
    
    if isinstance(res, str):
        data = json.loads(res)
        result = await _handle_s2s_string_message(data, call_messages, call_id)
        if result is False:
            return False
            
    elif isinstance(res, bytes):
        base64_audio = base64.b64encode(res).decode()
        if not aria_speaking_active:
            await voice_call_manager.send_message(call_id, {"type": "aria_speaking", "speaking": True})
            aria_speaking_active = True
        await voice_call_manager.send_message(call_id, {
            "type": "audio_output",
            "audio": base64_audio
        })
        
    return aria_speaking_active


async def _reconnect_s2s(
    call_id: str,
    s2s_ref: Dict[str, Any],
    reconnecting: asyncio.Event,
    pocket_voice: str,
    system_prompt: str
) -> bool:
    logger.warning("S2S closed, reconnecting...")
    reconnecting.set()
    await voice_call_manager.send_message(call_id, {
        "type": "status",
        "message": "Reconnecting to Aria, please hold..."
    })

    try:
        old_ws = s2s_ref["ws"]
        try:
            await old_ws.close()
        except Exception:
            pass
        s2s_ref["ws"] = await _connect_and_configure_s2s(call_id, pocket_voice, system_prompt)
        reconnecting.clear()
        await voice_call_manager.send_message(call_id, {
            "type": "status",
            "message": "Reconnected. Aria is listening."
        })
        logger.info(f"S2S reconnected for call {call_id}")
        return True
    except Exception:
        logger.exception("S2S reconnection failed")
        await voice_call_manager.send_message(call_id, {
            "type": "error",
            "message": "Could not reconnect to Aria. Please try again."
        })
        return False


async def _forward_s2s_to_frontend(
    call_id: str,
    s2s_ref: Dict[str, Any],
    reconnecting: asyncio.Event,
    call_messages: List[Dict[str, str]],
    pocket_voice: str,
    system_prompt: str
):
    import websockets
    
    aria_speaking_active = False
    max_reconnects = 4

    for reconnect_count in range(max_reconnects + 1):
        try:
            while True:
                res = await s2s_ref["ws"].recv()
                aria_speaking_active = await _handle_s2s_message(res, call_messages, call_id, aria_speaking_active)

        except websockets.exceptions.ConnectionClosed:
            aria_speaking_active = False
            if reconnect_count >= max_reconnects:
                logger.exception(f"S2S connection lost permanently after {max_reconnects} reconnects")
                await voice_call_manager.send_message(call_id, {
                    "type": "error",
                    "message": "Connection to Aria lost. Please try again."
                })
                return

            success = await _reconnect_s2s(call_id, s2s_ref, reconnecting, pocket_voice, system_prompt)
            if not success:
                return

        except Exception:
            logger.exception("Unexpected error in forward_s2s_to_frontend")
            return


@app.websocket("/ws/voice-call/{call_id}")
async def websocket_voice_call(websocket: WebSocket, call_id: str):
    """Voice call websocket endpoint. Bridges frontend to the S2S Hugging Face space."""
    try:
        user = await get_current_user_websocket(websocket)
    except Exception:
        logger.exception("WebSocket authentication failed")
        await websocket.close(code=4001, reason="Authentication failed")
        return

    # Accept the connection early to complete handshake and avoid browser/load-balancer timeouts
    await websocket.accept()

    voice_preference = user.get("aria_voice", "Adaora") if user else "Adaora"
    
    # Get user custom instructions
    user_id = user.get("id") if user else None
    profile = db.get_profile(user_id) if user_id else None
    custom_instructions = _get_user_custom_instructions(profile) if profile else None

    # Build Aria's spiritual companion persona
    ARIA_SPIRITUAL_SYSTEM_PROMPT = (
        "You are Aria, a warm and deeply faithful spiritual companion. "
        "You speak with the gentleness of a trusted pastor and the intimacy of a close friend who prays. "
        "Your role is to listen attentively, encourage faith, and walk beside the user in their spiritual journey. "
        "\n\n"
        "GUIDELINES:\n"
        "- Speak naturally and conversationally — you are in a voice call, so keep sentences short and flowing.\n"
        "- Ground every response in Scripture. Quote a relevant Bible verse when it truly helps.\n"
        "- Always validate the user's feelings before offering spiritual insight or comfort.\n"
        "- Offer to pray with the user when they are struggling, grieving, or asking for strength.\n"
        "- Never lecture. Ask questions to understand where the user is in their walk with God.\n"
        "- Be culturally sensitive and inclusive across all Christian denominations.\n"
        "- Keep responses brief in voice — 2 to 4 sentences unless the user asks for more depth.\n"
        "- If you do not know something, admit it humbly and point to Scripture or prayer.\n"
    )
    if custom_instructions:
        ARIA_SPIRITUAL_SYSTEM_PROMPT += f"\n\n{custom_instructions}"
        
    ARIA_SPIRITUAL_SYSTEM_PROMPT += (
        "\n\nYou open every new conversation with a warm greeting and a gentle check-in, "
        "such as: 'Hi, I'm Aria. How are you doing today? I'm here for you.'"
    )

    # Always use alba — warm, clear, feminine voice perfect for a spiritual companion
    pocket_voice = "alba"
    logger.info(f"Voice call {call_id}: voice={pocket_voice} (user preference: {voice_preference})")

    # Initial connection — close frontend if all retries fail
    try:
        s2s_ws = await _connect_and_configure_s2s(call_id, pocket_voice, ARIA_SPIRITUAL_SYSTEM_PROMPT)
    except Exception:
        logger.exception("All S2S connection attempts failed")
        await websocket.close(code=4002, reason="S2S connection failed")
        return

    # Connect frontend
    await voice_call_manager.connect(websocket, call_id)
    await voice_call_manager.send_message(
        call_id, {"type": "conversation_started", "message": "Connected to Aria."}
    )

    # Shared mutable reference so forward_frontend_to_s2s sees reconnected ws
    s2s_ref = {"ws": s2s_ws}
    reconnecting = asyncio.Event()
    call_messages = []

    # Run tasks concurrently
    tasks = [
        asyncio.create_task(_forward_frontend_to_s2s(websocket, call_id, s2s_ref, reconnecting)),
        asyncio.create_task(_forward_s2s_to_frontend(
            call_id, s2s_ref, reconnecting, call_messages, pocket_voice, ARIA_SPIRITUAL_SYSTEM_PROMPT
        ))
    ]
    try:
        await asyncio.gather(*tasks, return_exceptions=True)
    finally:
        for t in tasks:
            if not t.done():
                t.cancel()
        voice_call_manager.disconnect(call_id)
        try:
            await s2s_ref["ws"].close()
        except Exception:
            pass
        try:
            from starlette.websockets import WebSocketState
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.close()
        except Exception:
            pass
            
        # Trigger background synthesis
        if call_messages and user_id:
            run_background_task(synthesize_voice_journey(user_id, call_messages))
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
            # Trigger background synthesis
            run_background_task(synthesize_session_journey(session["user_id"], session_id, "bibleStudy"))
    except Exception:
        logger.exception("Error in Bible study AI")
        await manager.send_message(
            session_id, {"type": "error", "message": FAILED_TO_GENERATE_RESPONSE}
        )


@app.websocket("/ws/bible-study/{session_id}")
async def websocket_bible_study(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time Bible study chat with authentication"""
    try:
        user = await get_current_user_websocket(websocket)
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
        # Trigger background synthesis
        if session:
            run_background_task(synthesize_session_journey(session["user_id"], session_id, "emotionalSupport"))
    except Exception:
        logger.exception("Error in emotional support AI")
        await manager.send_message(
            session_id, {"type": "error", "message": FAILED_TO_GENERATE_RESPONSE}
        )


@app.websocket("/ws/emotional-support/{session_id}")
async def websocket_emotional_support(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time emotional support chat with authentication"""
    try:
        user = await get_current_user_websocket(websocket)
        sessions = await asyncio.to_thread(db.get_emotional_support_sessions, user.get("id"))
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
                await asyncio.to_thread(
                    db.create_emotional_support_message,
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
    sessions = await asyncio.to_thread(db.get_chat_sessions, current_user["id"])
    return sessions


@app.post("/api/v1/ai-chat/sessions", response_model=AIChatSession)
async def create_chat_session(
    session_data: AIChatSessionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new chat session"""
    session = await asyncio.to_thread(db.create_chat_session, current_user["id"], session_data.title)
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
    session = await asyncio.to_thread(db.get_chat_session, session_id)
    if not session or session.get("user_id") != current_user.get("id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    messages = await asyncio.to_thread(db.get_chat_session_messages, session_id)
    return messages


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
            session = await asyncio.to_thread(db.create_chat_session, user_id, title)
            if not session:
                raise HTTPException(status_code=500, detail=FAILED_TO_CREATE_SESSION)
            session_id = session["id"]

            # Save the welcome message if the frontend sent it as the first message
            if len(request.messages) > 1 and request.messages[0].get("role") == "assistant":
                await asyncio.to_thread(
                    db.create_chat_message,
                    {"session_id": session_id, "role": "assistant", "content": request.messages[0].get("content", "")}
                )

        # Save user message
        user_message = request.messages[-1].get("content", "") if request.messages else ""
        if user_message:
            await asyncio.to_thread(
                db.create_chat_message,
                {"session_id": session_id, "role": "user", "content": user_message}
            )

        # Get custom instructions
        profile = await asyncio.to_thread(db.get_profile, user_id)
        custom_instructions = (
            _get_user_custom_instructions(profile) if profile else None
        )

        # Prepare full context for AI
        full_context = [
            {"role": m.get("role", "user"), "content": m.get("content", "")} for m in request.messages
        ]

        # Generate response
        response_content = await asyncio.to_thread(
            ai_service.generate_response,
            messages=full_context,
            mode=request.mode or "general",
            custom_instructions=custom_instructions,
            user_id=user_id,
        )

        # Save assistant message
        await asyncio.to_thread(
            db.create_chat_message,
            {"session_id": session_id, "role": "assistant", "content": response_content}
        )

        return AIResponse(content=response_content, mode=request.mode or "general")

    except Exception:
        logger.exception("Chat error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=FAILED_TO_GENERATE_RESPONSE)


from fastapi.responses import StreamingResponse

async def _get_or_create_chat_session(user_id: str, session_id: Optional[str], messages: List[Dict[str, str]]) -> str:
    if session_id:
        return session_id
    title = messages[-1].get("content", "")[:30] if messages else "New Conversation"
    session = await asyncio.to_thread(db.create_chat_session, user_id, title)
    if not session:
        raise HTTPException(status_code=500, detail=FAILED_TO_CREATE_SESSION)
    
    # Save the welcome message if the frontend sent it as the first message
    if len(messages) > 1 and messages[0].get("role") == "assistant":
        await asyncio.to_thread(
            db.create_chat_message,
            {"session_id": session["id"], "role": "assistant", "content": messages[0].get("content", "")}
        )
    return session["id"]


async def _generate_chat_stream(session_id: str, full_context: List[Dict[str, str]], mode: str, custom_instructions: Optional[str], user_id: str):
    chunks = await asyncio.to_thread(
        lambda: list(ai_service.generate_response_stream(
            messages=full_context,
            mode=mode,
            custom_instructions=custom_instructions,
            user_id=user_id,
        ))
    )
    full_content = ""
    for chunk in chunks:
        full_content += chunk
        yield chunk
    if full_content:
        await asyncio.to_thread(
            db.create_chat_message,
            {"session_id": session_id, "role": "assistant", "content": full_content}
        )


@app.post("/api/v1/ai/chat/stream")
async def chat_with_aria_stream(
    request: AIRequest,
    session_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Stream chat with Aria and save to history"""
    try:
        user_id = current_user["id"]
        session_id = await _get_or_create_chat_session(user_id, session_id, request.messages)

        user_message = request.messages[-1].get("content", "") if request.messages else ""
        if user_message:
            await asyncio.to_thread(
                db.create_chat_message,
                {"session_id": session_id, "role": "user", "content": user_message}
            )

        profile = await asyncio.to_thread(db.get_profile, user_id)
        custom_instructions = _get_user_custom_instructions(profile) if profile else None
        full_context = [{"role": m.get("role", "user"), "content": m.get("content", "")} for m in request.messages]

        return StreamingResponse(
            _generate_chat_stream(session_id, full_context, request.mode or "general", custom_instructions, user_id),
            media_type="text/plain"
        )

    except Exception:
        logger.exception("Chat stream error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=FAILED_TO_GENERATE_RESPONSE)


def invalidate_home_cache(user_id: str):
    """Invalidate cached home data in Redis for a specific user"""
    if settings.redis_enabled and redis_client and user_id:
        try:
            cache_key = f"user:home_data:{user_id}"
            redis_client.delete(cache_key)
            logger.info(f"🧹 Invalidated home data cache for user: {user_id}")
        except Exception:
            logger.exception("Failed to delete Redis home data cache")


# ==================== Serve Frontend ====================


async def _get_or_generate_personalized_verse(user_id: str, activity: List[Dict[str, Any]]) -> Dict[str, Any]:
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        # Try database cache first
        verse = await asyncio.to_thread(db.get_cached_verse, user_id, today)

        # If no cached verse, generate new one
        if not verse:
            # Get user's recent topics from activity
            recent_moods = []
            if activity:
                for a in activity[:3]:
                    if a.get("type") == "support":
                        recent_moods.append(a.get("title", ""))

            # Generate personalized verse with insight (runs AI, offloaded to thread)
            verse = await asyncio.to_thread(ai_service.get_personalized_verse, recent_moods)

            # Generate Daily Manna based on the verse (runs AI, offloaded to thread)
            verse["daily_manna"] = await asyncio.to_thread(ai_service.get_daily_manna, verse)

            # Save to database cache
            await asyncio.to_thread(db.save_cached_verse, user_id, today, verse)
        return verse
    except Exception:
        logger.exception("Error getting personalized verse")
        # Fallback verse
        return {
            "verse": "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
            "reference": "Jeremiah 29:11",
            "insight": "Even in uncertain times, God's promise of a hopeful future stands as an anchor for your soul.",
            "daily_manna": "Grant me the grace to see Your hand in the mundane today, and the courage to follow where You lead.",
        }


@app.get("/api/v1/home/data")
async def get_home_data(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all home page data including verse, activity and stats with Redis caching"""
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

    # 1. Try Redis cache
    cache_key = f"user:home_data:{user_id}"
    if settings.redis_enabled and redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                logger.info(f"🚀 Redis HIT for home data: {cache_key}")
                return json.loads(cached_data)
        except Exception:
            logger.exception("Redis home data cache check failed")

    # 2. Query database in thread pool
    profile = await asyncio.to_thread(db.get_profile, user_id)
    user_name = profile.get("full_name", "Believer") if profile else "Believer"

    # Get recent activity
    activity = await asyncio.to_thread(db.get_user_activity, user_id, limit=3)

    # Get user stats
    stats = await asyncio.to_thread(db.get_user_stats, user_id)

    # Get recent prayers
    prayers = await asyncio.to_thread(db.get_prayers, user_id)
    recent_prayers = prayers[:3] if prayers else []

    # Get personalized verse - Cache in DB to ensure it only changes once per day
    verse = await _get_or_generate_personalized_verse(user_id, activity)

    response_data = {
        "user": {"name": user_name},
        "verse_of_day": verse,
        "activity": activity,
        "stats": stats,
        "recent_prayers": recent_prayers,
    }

    # 3. Store in Redis cache with 60s expiration
    if settings.redis_enabled and redis_client:
        try:
            redis_client.setex(cache_key, 60, json.dumps(response_data))
        except Exception:
            logger.exception("Redis home data cache save failed")

    return response_data


@app.get("/api/v1/home/verse")
async def get_personalized_verse(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get AI-generated personalized verse with insight based on user's recent activity"""
    try:
        user_id = current_user.get("id")
        today = datetime.now().strftime("%Y-%m-%d")

        # Try database cache first
        verse = await asyncio.to_thread(db.get_cached_verse, user_id, today)

        # If no cached verse, generate new one
        if not verse:
            # Get recent activity to determine user's current state
            activity = await asyncio.to_thread(db.get_user_activity, current_user["id"], limit=5)
            recent_moods = []
            for a in activity:
                if a.get("type") == "support":
                    recent_moods.append(a.get("title", ""))

            verse = await asyncio.to_thread(ai_service.get_personalized_verse, recent_moods)

            # Generate Daily Manna based on the verse
            verse["daily_manna"] = await asyncio.to_thread(ai_service.get_daily_manna, verse)

            # Save to database cache
            await asyncio.to_thread(db.save_cached_verse, user_id, today, verse)

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
        activity = await asyncio.to_thread(db.get_user_activity, current_user["id"], limit=limit)
        return {"success": True, "activity": activity}
    except Exception:
        logger.exception("Error getting activity")
        return {"success": False, "activity": [], "error": "Failed to load activity"}


@app.get("/api/v1/home/stats")
async def get_home_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user stats for spiritual growth"""
    try:
        stats = await asyncio.to_thread(db.get_user_stats, current_user["id"])
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

    prayer = await asyncio.to_thread(db.create_prayer, prayer_dict)
    if not prayer:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create prayer",
        )

    invalidate_home_cache(current_user["id"])
    return prayer


@app.get("/api/v1/prayers", response_model=List[Prayer])
async def get_prayers(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all prayers for current user"""
    prayers = await asyncio.to_thread(db.get_prayers, current_user["id"])
    return prayers


@app.delete("/api/v1/prayers/{prayer_id}")
async def delete_prayer(
    prayer_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a prayer"""
    success = await asyncio.to_thread(db.delete_prayer, prayer_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer not found or failed to delete",
        )
    invalidate_home_cache(current_user["id"])
    return {"success": True, "message": "Prayer deleted"}


@app.get("/app")
async def serve_frontend():
    """Serve the frontend application"""
    return FileResponse("static/index.html")


@app.get("/app/{path:path}")
async def serve_frontend_app(path: str):
    """Serve the frontend application for any app route"""
    return FileResponse("static/index.html")


@app.on_event("startup")
async def startup_event():
    # Start the proactive devotions background task
    run_background_task(proactive_devotions_scheduler())


def _should_trigger_devotion(profile: Dict[str, Any], local_time: datetime) -> bool:
    user_id = profile.get("id")
    # Fetch user's devotion settings
    settings_data = db.get_devotion_settings(user_id)
    if not settings_data:
        pref_time_str = "06:00"
    else:
        pref_time_str = settings_data.get("preferred_time") or "06:00"
    
    # Parse preferred time
    try:
        pref_hour, pref_minute = map(int, pref_time_str.split(":"))
    except Exception:
        pref_hour, pref_minute = 6, 0
    
    # Check if local time is past preferred time
    return local_time.hour > pref_hour or (local_time.hour == pref_hour and local_time.minute >= pref_minute)


def _get_user_timezone(profile: Dict[str, Any]) -> str:
    user_id = profile.get("id")
    settings_data = db.get_devotion_settings(user_id)
    if not settings_data:
        return "UTC"
    return settings_data.get("timezone") or "UTC"


def _generate_and_save_proactive_devotion(profile: Dict[str, Any], user_id: str, local_date_str: str):
    # 1. Fetch unanswered prayers
    with db.get_connection() as conn:
        cur = db._cursor(conn)
        cur.execute(
            "SELECT title, content FROM prayers WHERE user_id = %s AND isanswered = FALSE ORDER BY created_at DESC LIMIT 5",
            (user_id,)
        )
        prayers = cur.fetchall()
        unanswered_prayers = [f"{p['title'] or ''}: {p['content']}".strip() for p in prayers]

    # 2. Fetch last 3 emotional support moods/descriptions
    with db.get_connection() as conn:
        cur = db._cursor(conn)
        cur.execute(
            "SELECT mood, situation_description FROM emotional_support_sessions WHERE user_id = %s ORDER BY created_at DESC LIMIT 3",
            (user_id,)
        )
        support_sessions = cur.fetchall()
        recent_moods = [f"{s['mood'] or ''} ({s['situation_description'] or ''})".strip() for s in support_sessions]

    # 3. Generate proactive devotion
    logger.info(f"Generating proactive devotion for user {user_id} for date {local_date_str}...")
    first_name = profile.get("full_name", "Believer").split(" ")[0]
    devotion = ai_service.generate_proactive_devotion(unanswered_prayers, recent_moods, first_name)
    
    # 4. Save to database cache
    db.save_cached_verse(user_id, local_date_str, devotion)
    logger.info(f"Proactive devotion saved for user {user_id} for date {local_date_str}")
    
    # 5. Push notification simulation payload
    struggle = "your spiritual walk"
    if recent_moods:
        struggle = support_sessions[0]["mood"]
    elif unanswered_prayers:
        struggle = prayers[0]["title"] or "your needs"
    
    headline = f"Your morning bread is ready, {first_name}. I was praying about your concern regarding {struggle}..."
    logger.info(f"🔔 PUSH NOTIFICATION SIMULATION PAYLOAD: {headline}")


def _get_user_local_time(profile: Dict[str, Any]) -> datetime:
    from zoneinfo import ZoneInfo
    tz_str = _get_user_timezone(profile)
    try:
        tz = ZoneInfo(tz_str)
    except Exception:
        tz = ZoneInfo("UTC")
    return datetime.now(tz)


def _scan_and_check_devotions() -> List[tuple[Dict[str, Any], str, str]]:
    """Synchronously scan profiles and find users needing devotions generated."""
    try:
        profiles = db.get_all_profiles()
        to_generate = []
        for profile in profiles:
            user_id = profile.get("id")
            if not user_id:
                continue
            
            local_time = _get_user_local_time(profile)
            
            # Check if local time is past preferred time
            if _should_trigger_devotion(profile, local_time):
                # Check if devotion is already cached for today's local date
                local_date_str = local_time.strftime("%Y-%m-%d")
                cached_verse = db.get_cached_verse(user_id, local_date_str)
                if not cached_verse:
                    to_generate.append((profile, user_id, local_date_str))
        return to_generate
    except Exception:
        logger.exception("Error scanning devotions in background thread")
        return []


async def proactive_devotions_scheduler():
    """Background task running every minute to trigger devotions for users when it is their preferred time."""
    logger.info("⏰ Proactive devotions background scheduler started.")
    while True:
        try:
            # Offload the entire blocking DB scan to a thread pool
            to_generate = await asyncio.to_thread(_scan_and_check_devotions)
            
            for profile, user_id, local_date_str in to_generate:
                await asyncio.to_thread(_generate_and_save_proactive_devotion, profile, user_id, local_date_str)
        except Exception:
            logger.exception("Error in proactive devotions scheduler loop")
            
        await asyncio.sleep(60)  # Check every 60 seconds


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
