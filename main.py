from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging
import json

from config import settings
from models import *
from database import db
from auth import (
    get_current_user,
    supabase_auth_signup,
    supabase_auth_login,
    supabase_auth_logout,
    get_current_user_websocket,
    blacklist_token,
    decode_access_token,
)
from ai_service import ai_service
import redis
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Redis client
redis_client = None
if settings.redis_enabled:
    try:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        redis_client.ping()
        logger.info(f"✅ Redis connected: {settings.redis_url}")
    except Exception as e:
        logger.warning(f"⚠️ Redis connection failed: {e}. Falling back to no caching.")
        redis_client = None
else:
    logger.info("ℹ️ Redis caching is disabled (REDIS_ENABLED=false)")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered Bible study, emotional support, and daily devotion assistant",
)

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
async def register(user_data: UserRegister):
    """Register a new user"""
    result = await supabase_auth_signup(
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
async def login(user_data: UserLogin):
    """Login a user"""
    result = await supabase_auth_login(
        email=user_data.email, password=user_data.password
    )

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
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
        await supabase_auth_logout(user_id)

    return {"success": True, "message": "Logged out successfully. Token invalidated."}


@app.get("/api/v1/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


# ==================== Profile Endpoints ====================


@app.get("/api/v1/profile", response_model=Profile)
async def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user profile"""
    profile = await db.get_profile(current_user["id"])
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
    profile = await db.update_profile(
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
    note = await db.create_note(current_user["id"], note_data.model_dump())
    if not note:
        raise HTTPException(
            status_code=status.HTTP_500_CREATED, detail="Failed to create note"
        )
    return note


@app.get("/api/v1/notes", response_model=List[Note])
async def get_notes(
    source_type: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all notes for the user, optionally filtered by source_type"""
    notes = await db.get_notes(current_user["id"], source_type)
    return notes


@app.get("/api/v1/notes/{note_id}", response_model=Note)
async def get_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get a specific note"""
    note = await db.get_note(note_id, current_user["id"])
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )
    return note


@app.put("/api/v1/notes/{note_id}", response_model=Note)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update a note"""
    note = await db.update_note(
        note_id, current_user["id"], note_data.model_dump(exclude_unset=True)
    )
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        )
    return note


@app.delete("/api/v1/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a note"""
    success = await db.delete_note(note_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
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

    session = await db.create_bible_study_session(session_dict)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session",
        )

    # Generate AI explanation
    try:
        explanation = ai_service.explain_bible_verse(
            book=session_data.book,
            chapter=session_data.chapter,
            verses=session_data.verses,
            selected_text=session_data.selected_text,
        )

        await db.update_bible_study_session(
            session["id"], {"ai_explanation": explanation}
        )
        session["ai_explanation"] = explanation
    except Exception as e:
        logger.error(f"Error generating AI explanation: {e}")

    return session


@app.get("/api/v1/bible-study/sessions", response_model=List[BibleStudySession])
async def get_bible_study_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all Bible study sessions for current user"""
    sessions = await db.get_bible_study_sessions(current_user["id"])
    return sessions


@app.get("/api/v1/bible-study/sessions/{session_id}", response_model=BibleStudySession)
async def get_bible_study_session(
    session_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a specific Bible study session"""
    session = await db.get_bible_study_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    if session["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

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
    session = await db.get_bible_study_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    message_dict = message_data.model_dump()
    message_dict["session_id"] = session_id

    message = await db.create_bible_study_message(message_dict)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create message",
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
    session = await db.get_bible_study_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    messages = await db.get_bible_study_messages(session_id)
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

    session = await db.create_emotional_support_session(session_dict)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session",
        )

    # Generate AI response
    try:
        response = ai_service.provide_emotional_support(
            mood=session_data.mood, situation=session_data.situation_description or ""
        )

        await db.update_emotional_support_session(
            session["id"], {"ai_response": response}
        )
        session["ai_response"] = response
    except Exception as e:
        logger.error(f"Error generating AI response: {e}")

    return session


@app.get(
    "/api/v1/emotional-support/sessions", response_model=List[EmotionalSupportSession]
)
async def get_emotional_support_sessions(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get all emotional support sessions for current user"""
    sessions = await db.get_emotional_support_sessions(current_user["id"])
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
    session = await db.get_emotional_support_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    message_dict = message_data.model_dump()
    message_dict["session_id"] = session_id

    message = await db.create_emotional_support_message(message_dict)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create message",
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
    session = await db.get_emotional_support_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    messages = await db.get_emotional_support_messages(session_id)
    return messages


# ==================== Devotion Endpoints ====================


@app.get("/api/v1/devotion/settings", response_model=DevotionSettings)
async def get_devotion_settings(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get devotion settings"""
    settings_data = await db.get_devotion_settings(current_user["id"])
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
        settings_data = await db.create_devotion_settings(default_settings)

    return settings_data


@app.put("/api/v1/devotion/settings", response_model=DevotionSettings)
async def update_devotion_settings(
    settings_data: DevotionSettingsUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update devotion settings"""
    settings_result = await db.update_devotion_settings(
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

    devotion = await db.create_devotion(devotion_dict)
    if not devotion:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to schedule devotion",
        )

    return devotion


@app.get("/api/v1/devotion/devotions", response_model=List[Devotion])
async def get_devotions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all devotions for current user"""
    devotions = await db.get_devotions(current_user["id"])
    return devotions


@app.put("/api/v1/devotion/devotions/{devotion_id}/complete", response_model=Devotion)
async def complete_devotion(
    devotion_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Mark a devotion as completed"""
    from datetime import datetime

    devotion = await db.update_devotion(
        devotion_id,
        {"status": "completed", "completed_at": datetime.utcnow().isoformat()},
    )
    if not devotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Devotion not found"
        )
    return devotion


# ==================== Bible Endpoints ====================


@app.get("/api/v1/bible/chapter/{book}/{chapter}")
async def get_bible_chapter(book: str, chapter: int):
    """Get all verses in a Bible chapter"""
    try:
        verses = await db.fetch_bible_chapter_from_api(book, chapter)
        if verses:
            return {"success": True, "book": book, "chapter": chapter, "verses": verses}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chapter not found or could not be fetched",
            )
    except Exception as e:
        logger.error(f"Error fetching Bible chapter: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch Bible chapter",
        )


@app.get("/api/v1/bible/search", response_model=List[BibleVerse])
async def search_bible(query: str):
    """Search Bible verses"""
    verses = await db.search_bible_verses(query)
    return verses


@app.get("/api/v1/bible/verses/{book}/{chapter}/{verse}", response_model=BibleVerse)
async def get_bible_verse(book: str, chapter: int, verse: int):
    """Get a specific Bible verse - first from DB, then from external API"""
    # First try to get from database
    verse_data = await db.get_bible_verse(book.lower(), chapter, verse)

    if not verse_data:
        # Try fetching from external API (bible-api.com)
        try:
            import httpx

            BIBLE_API_URL = "https://bible-api.com"

            # Map book name
            book_mapping = {
                "genesis": "genesis",
                "exodus": "exodus",
                "leviticus": "leviticus",
                "numbers": "numbers",
                "deuteronomy": "deuteronomy",
                "joshua": "joshua",
                "judges": "judges",
                "ruth": "ruth",
                "1 samuel": "1samuel",
                "2 samuel": "2samuel",
                "1 kings": "1kings",
                "2 kings": "2kings",
                "1 chronicles": "1chronicles",
                "2 chronicles": "2chronicles",
                "ezra": "ezra",
                "nehemiah": "nehemiah",
                "esther": "esther",
                "job": "job",
                "psalms": "psalms",
                "proverbs": "proverbs",
                "ecclesiastes": "ecclesiastes",
                "song of solomon": "songofsongs",
                "isaiah": "isaiah",
                "jeremiah": "jeremiah",
                "lamentations": "lamentations",
                "ezekiel": "ezekiel",
                "daniel": "daniel",
                "hosea": "hosea",
                "joel": "joel",
                "amos": "amos",
                "obadiah": "obadiah",
                "jonah": "jonah",
                "micah": "micah",
                "nahum": "nahum",
                "habakkuk": "habakkuk",
                "zephaniah": "zephaniah",
                "haggai": "haggai",
                "zechariah": "zechariah",
                "malachi": "malachi",
                "matthew": "matthew",
                "mark": "mark",
                "luke": "luke",
                "john": "john",
                "acts": "acts",
                "romans": "romans",
                "1 corinthians": "1corinthians",
                "2 corinthians": "2corinthians",
                "galatians": "galatians",
                "ephesians": "ephesians",
                "philippians": "philippians",
                "colossians": "colossians",
                "1 thessalonians": "1thessalonians",
                "2 thessalonians": "2thessalonians",
                "1 timothy": "1timothy",
                "2 timothy": "2timothy",
                "titus": "titus",
                "philemon": "philemon",
                "hebrews": "hebrews",
                "james": "james",
                "1 peter": "1peter",
                "2 peter": "2peter",
                "1 john": "1john",
                "2 john": "2john",
                "3 john": "3john",
                "jude": "jude",
                "revelation": "revelation",
            }

            api_book = book_mapping.get(book.lower(), book.lower().replace(" ", ""))
            url = f"{BIBLE_API_URL}/{api_book}.{chapter}?translation=kjv"

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    verses = data.get("verses", [])
                    for v in verses:
                        if v.get("verse") == verse:
                            return {
                                "book": book,
                                "chapter": chapter,
                                "verse": verse,
                                "text": v.get("text", ""),
                                "version": "KJV",
                            }
        except Exception as e:
            logger.error(f"Error fetching verse from API: {e}")

        # If still not found, return 404
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Verse not found"
        )
    return verse_data


@app.get("/api/v1/bible/scriptures/{category}", response_model=List[ScriptureReference])
async def get_scripture_references(category: str):
    """Get scripture references by category"""
    references = await db.get_scripture_references(category)
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
        content = ai_service.generate_response(request.messages, request.mode)
        return AIResponse(
            content=content, role="assistant", timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error generating AI response: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate response",
        )


@app.post("/api/v1/ai/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """General AI chat endpoint"""
    try:
        # Use emotional support mode for general chat as it provides compassionate responses
        content = ai_service.generate_response(request.messages, request.mode)
        return ChatResponse(
            content=content, role="assistant", timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate response",
        )


@app.post("/api/v1/ai/voice-chat")
async def voice_chat(
    audio: bytes, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Voice chat endpoint - transcribes audio and returns AI response"""
    try:
        # For now, return a placeholder response
        # In production, this would use OpenAI's Whisper for transcription
        return {
            "transcription": "Voice message received",
            "response": "I'm here to listen and support you. How can I help you today?",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error in voice chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process voice message",
        )


class VoiceSessionCreate(BaseModel):
    mode: str = Field(
        default="general", pattern="^(general|bibleStudy|emotionalSupport|devotion)$"
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
    """Manager for voice call connections with OpenAI Realtime API"""

    def __init__(self):
        self.active_calls: Dict[str, WebSocket] = {}
        self.openai_clients: Dict[str, Any] = {}

    async def connect(self, websocket: WebSocket, call_id: str):
        await websocket.accept()
        self.active_calls[call_id] = websocket

    def disconnect(self, call_id: str):
        if call_id in self.active_calls:
            del self.active_calls[call_id]
        if call_id in self.openai_clients:
            del self.openai_clients[call_id]

    async def send_message(self, call_id: str, message: Dict[str, Any]):
        if call_id in self.active_calls:
            await self.active_calls[call_id].send_json(message)


voice_call_manager = VoiceCallManager()


@app.websocket("/ws/voice-call/{call_id}")
async def websocket_voice_call(websocket: WebSocket, call_id: str):
    """WebSocket endpoint for real-time voice calls with OpenAI Realtime API"""
    import asyncio
    import base64
    import json

    # Authenticate the user
    try:
        current_user = await get_current_user_websocket(websocket)
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=4001, reason="Authentication failed")
        return

    await voice_call_manager.connect(websocket, call_id)

    # Get mode from query params
    mode = "general"

    # Get the AI config based on mode
    ai_config = ai_service.AI_CONFIGS.get(mode, ai_service.AI_CONFIGS["general"])
    system_prompt = ai_config["system_prompt"]

    # Create OpenAI client for this call
    from openai import AsyncOpenAI

    openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
    voice_call_manager.openai_clients[call_id] = openai_client

    try:
        # Start the OpenAI Realtime session - use correct API
        # For gpt-4o-realtime, we need to use the beta client
        try:
            session = await openai_client.beta.realtime.connect(
                model="gpt-4o-realtime-preview-2025-06-03",
                modalities=["audio", "text"],
                instructions=system_prompt,
                voice="verse",
                audio_format="pcm16",
            )
        except AttributeError as ae:
            # Fallback: try with older API format
            logger.warning(f"Realtime API not available, using fallback: {ae}")
            # Send error message to client and close
            await voice_call_manager.send_message(
                call_id,
                {
                    "type": "error",
                    "message": "Voice chat is temporarily unavailable. Please try again later.",
                },
            )
            await websocket.close()
            return
            # Send initial greeting
            await voice_call_manager.send_message(
                call_id,
                {
                    "type": "conversation_started",
                    "message": "Hello! I'm here to talk with you about your faith. How are you feeling today?",
                },
            )

            # Create task for receiving client messages
            receive_task = None

            async def receive_client_audio():
                """Receive audio from client and send to OpenAI"""
                try:
                    while True:
                        data = await websocket.receive_json()

                        if data.get("type") == "audio_input":
                            # Decode base64 audio and send to OpenAI
                            audio_data = data.get("audio")
                            if audio_data:
                                try:
                                    audio_bytes = base64.b64decode(audio_data)
                                    await session.audio.append(audio_bytes)
                                    await session.audio.commit()
                                except Exception as e:
                                    logger.error(f"Error processing audio: {e}")
                        elif data.get("type") == "ping":
                            # Keepalive ping
                            await voice_call_manager.send_message(
                                call_id, {"type": "pong"}
                            )
                        elif data.get("type") == "stop":
                            # Client stopped the call
                            break
                except WebSocketDisconnect:
                    pass
                except Exception as e:
                    logger.error(f"Error in receive loop: {e}")

            receive_task = asyncio.create_task(receive_client_audio())

            # Listen for responses from OpenAI
            async for event in session:
                if event.type == "response.audio.delta":
                    # Send audio back to client
                    audio_base64 = base64.b64encode(event.data).decode("utf-8")
                    await voice_call_manager.send_message(
                        call_id, {"type": "audio_output", "audio": audio_base64}
                    )
                elif event.type == "response.text.delta":
                    # Send text transcript
                    await voice_call_manager.send_message(
                        call_id,
                        {
                            "type": "transcript",
                            "text": event.delta,
                            "role": "assistant",
                        },
                    )
                elif event.type == "response.audio.transcript":
                    # Full transcript
                    await voice_call_manager.send_message(
                        call_id,
                        {
                            "type": "transcript_complete",
                            "text": event.transcript,
                            "role": "assistant",
                        },
                    )
                elif event.type == "input_audio_buffer.speech_started":
                    # User started speaking
                    await voice_call_manager.send_message(
                        call_id, {"type": "user_speaking", "speaking": True}
                    )
                elif event.type == "input_audio_buffer.speech_stopped":
                    # User stopped speaking
                    await voice_call_manager.send_message(
                        call_id, {"type": "user_speaking", "speaking": False}
                    )
                elif event.type == "error":
                    logger.error(f"OpenAI Realtime error: {event}")
                    await voice_call_manager.send_message(
                        call_id, {"type": "error", "message": str(event)}
                    )

            # Cancel receive task
            if receive_task:
                receive_task.cancel()
                try:
                    await receive_task
                except asyncio.CancelledError:
                    pass

    except Exception as e:
        logger.error(f"Error in voice call: {e}")
        await voice_call_manager.send_message(
            call_id, {"type": "error", "message": f"Call error: {str(e)}"}
        )

    finally:
        # Close the session if it exists
        try:
            if "session" in dir() and session:
                await session.close()
        except Exception as e:
            logger.error(f"Error closing session: {e}")
        voice_call_manager.disconnect(call_id)
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


@app.websocket("/ws/bible-study/{session_id}")
async def websocket_bible_study(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time Bible study chat with authentication"""
    # Authenticate the user
    try:
        current_user = await get_current_user_websocket(websocket)
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        return

    # Verify session ownership
    session = await db.get_bible_study_session(session_id)
    if not session or session.get("user_id") != current_user.get("id"):
        await websocket.close(
            code=4003, reason="Access denied: Session not found or not owned by user"
        )
        return

    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()

            # Process message
            if data.get("type") == "message":
                # Save message to database
                message_data = {
                    "session_id": session_id,
                    "role": data.get("role", "user"),
                    "content": data.get("content", ""),
                }
                message = await db.create_bible_study_message(message_data)

                # Generate AI response if user message
                if data.get("role") == "user":
                    try:
                        # Get conversation history
                        messages = await db.get_bible_study_messages(session_id)
                        conversation_history = [
                            {"role": m["role"], "content": m["content"]}
                            for m in reversed(messages)
                        ]

                        # Get session info
                        session = await db.get_bible_study_session(session_id)
                        if session:
                            response = ai_service.explain_bible_verse(
                                book=session["book"],
                                chapter=session["chapter"],
                                verses=session["verses"],
                                selected_text=session["selected_text"],
                                conversation_history=conversation_history,
                            )

                            # Save AI response
                            ai_message_data = {
                                "session_id": session_id,
                                "role": "assistant",
                                "content": response,
                            }
                            await db.create_bible_study_message(ai_message_data)

                            # Send response back
                            await manager.send_message(
                                session_id,
                                {
                                    "type": "message",
                                    "role": "assistant",
                                    "content": response,
                                },
                            )
                    except Exception as e:
                        logger.error(f"Error in WebSocket: {e}")
                        await manager.send_message(
                            session_id,
                            {"type": "error", "message": "Failed to generate response"},
                        )

    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logger.info(f"Client disconnected from session {session_id}")


@app.websocket("/ws/emotional-support/{session_id}")
async def websocket_emotional_support(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time emotional support chat with authentication"""
    # Authenticate the user
    try:
        current_user = await get_current_user_websocket(websocket)
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        return

    # Verify session ownership
    sessions = await db.get_emotional_support_sessions(current_user.get("id"))
    session = next((s for s in sessions if s.get("id") == session_id), None)
    if not session:
        await websocket.close(
            code=4003, reason="Access denied: Session not found or not owned by user"
        )
        return

    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "message":
                # Save message to database
                message_data = {
                    "session_id": session_id,
                    "role": data.get("role", "user"),
                    "content": data.get("content", ""),
                }
                message = await db.create_emotional_support_message(message_data)

                # Generate AI response if user message
                if data.get("role") == "user":
                    try:
                        # Get conversation history
                        messages = await db.get_emotional_support_messages(session_id)
                        conversation_history = [
                            {"role": m["role"], "content": m["content"]}
                            for m in reversed(messages)
                        ]

                        # Get session info
                        sessions = await db.get_emotional_support_sessions(
                            current_user.get("id")
                        )
                        session_data = next(
                            (s for s in sessions if s.get("id") == session_id), None
                        )
                        if session_data:
                            response = ai_service.provide_emotional_support(
                                mood=session_data["mood"],
                                situation=session_data.get("situation_description", ""),
                                conversation_history=conversation_history,
                            )

                            # Save AI response
                            ai_message_data = {
                                "session_id": session_id,
                                "role": "assistant",
                                "content": response,
                            }
                            await db.create_emotional_support_message(ai_message_data)

                            # Send response back
                            await manager.send_message(
                                session_id,
                                {
                                    "type": "message",
                                    "role": "assistant",
                                    "content": response,
                                },
                            )
                    except Exception as e:
                        logger.error(f"Error in WebSocket: {e}")
                        await manager.send_message(
                            session_id,
                            {"type": "error", "message": "Failed to generate response"},
                        )

    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logger.info(f"Client disconnected from session {session_id}")


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
    profile = await db.get_profile(user_id)
    user_name = profile.get("full_name", "Believer") if profile else "Believer"

    # Get recent activity
    activity = await db.get_user_activity(user_id, limit=3)

    # Get user stats
    stats = await db.get_user_stats(user_id)

    # Get recent prayers
    prayers = await db.get_prayers(user_id)
    recent_prayers = prayers[:3] if prayers else []

    # Get personalized verse - try to get cached first (Redis), only regenerate once per day
    try:
        verse = None
        today = datetime.now().strftime("%Y-%m-%d")
        cache_key = f"verse:{user_id}:{today}"

        # Try Redis cache first
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                verse = json.loads(cached)

        # If no cached verse, generate new one
        if not verse:
            # Get user's recent topics from activity
            recent_moods = []
            if activity:
                for a in activity[:3]:
                    if a.get("type") == "support":
                        recent_moods.append(a.get("title", ""))

            # Generate personalized verse
            verse = ai_service.get_personalized_verse(recent_moods)

            # Cache in Redis for 24 hours (86400 seconds)
            if redis_client:
                try:
                    redis_client.setex(cache_key, 86400, json.dumps(verse))
                except Exception as e:
                    logger.error(f"Error caching verse in Redis: {e}")
    except Exception as e:
        logger.error(f"Error getting personalized verse: {e}")
        # Fallback verse
        verse = {
            "verse": "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
            "reference": "Jeremiah 29:11",
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
    """Get AI-generated personalized verse based on user's recent activity"""
    try:
        user_id = current_user.get("id")
        today = datetime.now().strftime("%Y-%m-%d")
        cache_key = f"verse:{user_id}:{today}"

        # Try Redis cache first
        verse = None
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                verse = json.loads(cached)

        # If no cached verse, generate new one
        if not verse:
            # Get recent activity to determine user's current state
            activity = await db.get_user_activity(current_user["id"], limit=5)
            recent_moods = []
            for a in activity:
                if a.get("type") == "support":
                    recent_moods.append(a.get("title", ""))

            verse = ai_service.get_personalized_verse(recent_moods)

            # Cache in Redis for 24 hours
            if redis_client:
                try:
                    redis_client.setex(cache_key, 86400, json.dumps(verse))
                except Exception as e:
                    logger.error(f"Error caching verse in Redis: {e}")

        return {"success": True, "verse": verse}
    except Exception as e:
        logger.error(f"Error getting personalized verse: {e}")
        # Fallback verse
        return {
            "success": True,
            "verse": {
                "verse": "The LORD is my shepherd; I shall not want.",
                "reference": "Psalm 23:1",
            },
        }


@app.get("/api/v1/home/activity")
async def get_home_activity(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user's recent activity for the home page"""
    try:
        activity = await db.get_user_activity(current_user["id"], limit=5)
        return {"success": True, "activity": activity}
    except Exception as e:
        logger.error(f"Error getting activity: {e}")
        return {"success": False, "activity": [], "error": str(e)}


@app.get("/api/v1/home/stats")
async def get_home_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user's stats for the home page"""
    try:
        stats = await db.get_user_stats(current_user["id"])
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {
            "success": True,
            "stats": {"streak": 0, "time_today_minutes": 0, "verses_saved": 0},
        }


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

    prayer = await db.create_prayer(prayer_dict)
    if not prayer:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create prayer",
        )

    return prayer


@app.get("/api/v1/prayers", response_model=List[Prayer])
async def get_prayers(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get all prayers for current user"""
    prayers = await db.get_prayers(current_user["id"])
    return prayers


@app.delete("/api/v1/prayers/{prayer_id}")
async def delete_prayer(
    prayer_id: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a prayer"""
    success = await db.delete_prayer(prayer_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete prayer",
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

    uvicorn.run(app, host="0.0.0.0", port=8002)
