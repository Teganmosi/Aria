from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ==================== User & Profile Models ====================


class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_bible_version: str = "NIV"
    notification_preferences: Dict[str, bool] = {"email": True, "push": True}
    spiritual_journey_notes: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_bible_version: Optional[str] = None
    notification_preferences: Optional[Dict[str, bool]] = None
    spiritual_journey_notes: Optional[str] = None


class Profile(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Notes Models ====================


class NoteBase(BaseModel):
    title: str
    content: str
    source_type: Optional[str] = Field(
        None, pattern="^(bible|companion|devotion|general)$"
    )
    source_reference: Optional[str] = None
    tags: List[str] = []


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source_type: Optional[str] = None
    source_reference: Optional[str] = None
    tags: Optional[List[str]] = None


class Note(NoteBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Bible Study Models ====================


class BibleStudySessionBase(BaseModel):
    book: str
    chapter: int
    verses: List[int]
    selected_text: str
    is_realtime: bool = False


class BibleStudySessionCreate(BibleStudySessionBase):
    pass


class BibleStudySessionUpdate(BaseModel):
    ai_explanation: Optional[str] = None
    ai_context: Optional[str] = None
    conversation_summary: Optional[str] = None
    is_realtime: Optional[bool] = None


class BibleStudySession(BibleStudySessionBase):
    id: str
    user_id: str
    ai_explanation: Optional[str] = None
    ai_context: Optional[str] = None
    conversation_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BibleStudyMessageBase(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class BibleStudyMessageCreate(BibleStudyMessageBase):
    session_id: str


class BibleStudyMessage(BibleStudyMessageBase):
    id: str
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Emotional Support Models ====================


class EmotionalSupportSessionBase(BaseModel):
    mood: str
    situation_description: Optional[str] = None
    is_realtime: bool = False


class EmotionalSupportSessionCreate(EmotionalSupportSessionBase):
    pass


class EmotionalSupportSessionUpdate(BaseModel):
    ai_response: Optional[str] = None
    provided_scriptures: Optional[List[Dict[str, Any]]] = None
    prayer_suggestion: Optional[str] = None


class EmotionalSupportSession(EmotionalSupportSessionBase):
    id: str
    user_id: str
    ai_response: Optional[str] = None
    provided_scriptures: Optional[List[Dict[str, Any]]] = None
    prayer_suggestion: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmotionalSupportMessageBase(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class EmotionalSupportMessageCreate(EmotionalSupportMessageBase):
    session_id: str


class EmotionalSupportMessage(EmotionalSupportMessageBase):
    id: str
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Devotion Models ====================


class DevotionSettingsBase(BaseModel):
    preferred_time: str
    timezone: str
    duration_minutes: int = 15
    topics: List[str] = []
    auto_prayer: bool = True


class DevotionSettingsCreate(DevotionSettingsBase):
    pass


class DevotionSettingsUpdate(BaseModel):
    preferred_time: Optional[str] = None
    timezone: Optional[str] = None
    duration_minutes: Optional[int] = None
    topics: Optional[List[str]] = None
    auto_prayer: Optional[bool] = None


class DevotionSettings(DevotionSettingsBase):
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DevotionStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class DevotionBase(BaseModel):
    scheduled_for: datetime
    day_plan_summary: Optional[str] = None
    scripture_reading: Optional[Dict[str, Any]] = None
    reflection_prompt: Optional[str] = None
    user_reflection: Optional[str] = None
    status: DevotionStatus = DevotionStatus.SCHEDULED


class DevotionCreate(DevotionBase):
    pass


class DevotionUpdate(BaseModel):
    completed_at: Optional[datetime] = None
    day_plan_summary: Optional[str] = None
    ai_prayer: Optional[str] = None
    scripture_reading: Optional[Dict[str, Any]] = None
    reflection_prompt: Optional[str] = None
    user_reflection: Optional[str] = None
    status: Optional[DevotionStatus] = None


class Devotion(DevotionBase):
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    ai_prayer: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DevotionMessageBase(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class DevotionMessageCreate(DevotionMessageBase):
    devotion_id: str


class DevotionMessage(DevotionMessageBase):
    id: str
    devotion_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Bible Models ====================


class BibleVerse(BaseModel):
    id: int
    book: str
    chapter: int
    verse: int
    text: str
    version: str = "NIV"

    class Config:
        from_attributes = True


class ScriptureReference(BaseModel):
    id: int
    verse_id: int
    category: str
    tags: List[str]
    context_description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Favorites Models ====================


class FavoriteType(str, Enum):
    VERSE = "verse"
    PRAYER = "prayer"
    DEVOTION = "devotion"


class UserFavoriteBase(BaseModel):
    item_type: FavoriteType
    item_id: str
    notes: Optional[str] = None


class UserFavoriteCreate(UserFavoriteBase):
    pass


class UserFavorite(UserFavoriteBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Journal Models ====================


class JournalEntryBase(BaseModel):
    title: Optional[str] = None
    content: str
    mood: Optional[str] = None
    related_scriptures: Optional[List[Dict[str, Any]]] = None


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None
    related_scriptures: Optional[List[Dict[str, Any]]] = None


class JournalEntry(JournalEntryBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Prayer Models ====================


class PrayerBase(BaseModel):
    content: str
    title: Optional[str] = None
    isanswered: bool = False


class PrayerCreate(PrayerBase):
    pass


class Prayer(PrayerBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== AI Models ====================


class AIRequest(BaseModel):
    messages: List[Dict[str, str]]
    mode: str = Field(
        default="general", pattern="^(general|bibleStudy|emotionalSupport|devotion)$"
    )


class AIResponse(BaseModel):
    content: str
    role: str
    timestamp: datetime


# ==================== Auth Models ====================


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True
