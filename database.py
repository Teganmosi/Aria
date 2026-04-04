from supabase import create_client, Client
from config import settings
from typing import Optional, Dict, Any, List
import logging
import httpx
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API.Bible configuration
API_BIBLE_BASE_URL = "https://api.scripture.api.bible/v1"
# KJV Bible ID (free, public domain)
KJV_BIBLE_ID = "de4e12af7f28f599-02"


class Database:
    _instance: Optional["Database"] = None
    _client: Optional[Client] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            # Use the anon key (supabase_key) for database operations
            self._client = create_client(settings.supabase_url, settings.supabase_key)
            logger.info("Supabase client initialized with anon key")

    @property
    def client(self) -> Client:
        return self._client

    # ==================== Profile Operations ====================

    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("profiles").select("*").eq("id", user_id).execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            return None

    async def create_profile(
        self, profile_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = self._client.table("profiles").insert(profile_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating profile: {e}")
            return None

    async def update_profile(
        self, user_id: str, profile_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("profiles")
                .update(profile_data)
                .eq("id", user_id)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            return None

    # ==================== Bible Study Operations ====================

    async def create_bible_study_session(
        self, session_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("bible_study_sessions")
                .insert(session_data)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating bible study session: {e}")
            return None

    async def get_bible_study_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            response = (
                self._client.table("bible_study_sessions")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting bible study sessions: {e}")
            return []

    async def get_bible_study_session(
        self, session_id: str
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("bible_study_sessions")
                .select("*")
                .eq("id", session_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting bible study session: {e}")
            return None

    async def update_bible_study_session(
        self, session_id: str, session_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("bible_study_sessions")
                .update(session_data)
                .eq("id", session_id)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating bible study session: {e}")
            return None

    async def create_bible_study_message(
        self, message_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("bible_study_messages")
                .insert(message_data)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating bible study message: {e}")
            return None

    async def get_bible_study_messages(self, session_id: str) -> List[Dict[str, Any]]:
        try:
            response = (
                self._client.table("bible_study_messages")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting bible study messages: {e}")
            return []

    # ==================== Emotional Support Operations ====================

    async def create_emotional_support_session(
        self, session_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("emotional_support_sessions")
                .insert(session_data)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating emotional support session: {e}")
            return None

    async def get_emotional_support_sessions(
        self, user_id: str
    ) -> List[Dict[str, Any]]:
        try:
            response = (
                self._client.table("emotional_support_sessions")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting emotional support sessions: {e}")
            return []

    async def get_emotional_support_session(
        self, session_id: str
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("emotional_support_sessions")
                .select("*")
                .eq("id", session_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting emotional support session: {e}")
            return None

    async def update_emotional_support_session(
        self, session_id: str, session_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("emotional_support_sessions")
                .update(session_data)
                .eq("id", session_id)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating emotional support session: {e}")
            return None

    async def create_emotional_support_message(
        self, message_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("emotional_support_messages")
                .insert(message_data)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating emotional support message: {e}")
            return None

    async def get_emotional_support_messages(
        self, session_id: str
    ) -> List[Dict[str, Any]]:
        try:
            response = (
                self._client.table("emotional_support_messages")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting emotional support messages: {e}")
            return []

    # ==================== Devotion Operations ====================

    async def get_devotion_settings(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("devotion_settings")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting devotion settings: {e}")
            return None

    async def create_devotion_settings(
        self, settings_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("devotion_settings").insert(settings_data).execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating devotion settings: {e}")
            return None

    async def update_devotion_settings(
        self, user_id: str, settings_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("devotion_settings")
                .update(settings_data)
                .eq("user_id", user_id)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating devotion settings: {e}")
            return None

    async def create_devotion(
        self, devotion_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = self._client.table("devotions").insert(devotion_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating devotion: {e}")
            return None

    async def get_devotions(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            response = (
                self._client.table("devotions")
                .select("*")
                .eq("user_id", user_id)
                .order("scheduled_for", desc=True)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting devotions: {e}")
            return []

    async def update_devotion(
        self, devotion_id: str, devotion_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("devotions")
                .update(devotion_data)
                .eq("id", devotion_id)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating devotion: {e}")
            return None

    # ==================== Bible Operations ====================

    async def fetch_bible_chapter_from_api(
        self, book: str, chapter: int
    ) -> List[Dict[str, Any]]:
        """Fetch Bible chapter from API.Bible"""
        try:
            # Map book names to API.Bible format (USFM codes)
            book_mapping = {
                "Genesis": "GEN",
                "Exodus": "EXO",
                "Leviticus": "LEV",
                "Numbers": "NUM",
                "Deuteronomy": "DEU",
                "Joshua": "JOS",
                "Judges": "JDG",
                "Ruth": "RUT",
                "1 Samuel": "1SA",
                "2 Samuel": "2SA",
                "1 Kings": "1KI",
                "2 Kings": "2KI",
                "1 Chronicles": "1CH",
                "2 Chronicles": "2CH",
                "Ezra": "EZR",
                "Nehemiah": "NEH",
                "Esther": "EST",
                "Job": "JOB",
                "Psalms": "PSA",
                "Proverbs": "PRO",
                "Ecclesiastes": "ECC",
                "Song of Solomon": "SNG",
                "Isaiah": "ISA",
                "Jeremiah": "JER",
                "Lamentations": "LAM",
                "Ezekiel": "EZE",
                "Daniel": "DAN",
                "Hosea": "HOS",
                "Joel": "JOL",
                "Amos": "AMO",
                "Obadiah": "OBA",
                "Jonah": "JON",
                "Micah": "MIC",
                "Nahum": "NAM",
                "Habakkuk": "HAB",
                "Zephaniah": "ZEP",
                "Haggai": "HAG",
                "Zechariah": "ZEC",
                "Malachi": "MAL",
                "Matthew": "MAT",
                "Mark": "MRK",
                "Luke": "LUK",
                "John": "JHN",
                "Acts": "ACT",
                "Romans": "ROM",
                "1 Corinthians": "1CO",
                "2 Corinthians": "2CO",
                "Galatians": "GAL",
                "Ephesians": "EPH",
                "Philippians": "PHP",
                "Colossians": "COL",
                "1 Thessalonians": "1TH",
                "2 Thessalonians": "2TH",
                "1 Timothy": "1TI",
                "2 Timothy": "2TI",
                "Titus": "TIT",
                "Philemon": "PHM",
                "Hebrews": "HEB",
                "James": "JAS",
                "1 Peter": "1PE",
                "2 Peter": "2PE",
                "1 John": "1JN",
                "2 John": "2JN",
                "3 John": "3JN",
                "Jude": "JUD",
                "Revelation": "REV",
            }

            api_book = book_mapping.get(book, book.upper()[:3])
            chapter_id = f"{api_book}.{chapter}"

            # API.Bible endpoint
            url = f"{API_BIBLE_BASE_URL}/bibles/{KJV_BIBLE_ID}/chapters/{chapter_id}"

            headers = {"api-key": settings.api_bible_key}

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    verses = []
                    # API.Bible returns verses in the 'content' as HTML, need to parse
                    for verse_data in data.get("data", {}).get("verses", []):
                        verses.append(
                            {
                                "book": book,
                                "chapter": chapter,
                                "verse": verse_data.get("verseId", 0),
                                "text": verse_data.get("text", ""),
                                "version": "KJV",
                            }
                        )
                    return verses
                else:
                    logger.error(
                        f"API.Bible error: {response.status_code} - {response.text}"
                    )
                    return []
        except Exception as e:
            logger.error(f"Error fetching Bible chapter: {e}")
            return []

    async def search_bible_verses(self, query: str) -> List[Dict[str, Any]]:
        # First try local database
        try:
            response = (
                self._client.table("bible_verses")
                .select("*")
                .ilike("text", f"%{query}%")
                .limit(20)
                .execute()
            )
            if response.data:
                return response.data
        except Exception as e:
            logger.error(f"Error searching bible verses in DB: {e}")

        # If no results, return empty list (could integrate search API)
        return []

    async def get_bible_verse(
        self, book: str, chapter: int, verse: int
    ) -> Optional[Dict[str, Any]]:
        try:
            response = (
                self._client.table("bible_verses")
                .select("*")
                .eq("book", book)
                .eq("chapter", chapter)
                .eq("verse", verse)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting bible verse: {e}")
            return None

    async def get_scripture_references(self, category: str) -> List[Dict[str, Any]]:
        try:
            response = (
                self._client.table("scripture_references")
                .select("*, bible_verses(*)")
                .eq("category", category)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting scripture references: {e}")
            return []

    # ==================== Prayer Operations ====================

    async def create_prayer(
        self, prayer_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            response = self._client.table("prayers").insert(prayer_data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating prayer: {e}")
            return None

    async def get_prayers(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            response = (
                self._client.table("prayers")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting prayers: {e}")
            return []

    async def delete_prayer(self, prayer_id: str) -> bool:
        try:
            response = (
                self._client.table("prayers").delete().eq("id", prayer_id).execute()
            )
            return True
        except Exception as e:
            logger.error(f"Error deleting prayer: {e}")
            return False

    # ==================== User Activity Operations ====================

    async def get_user_activity(
        self, user_id: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get recent activity from all sources"""
        activities = []

        # Get recent Bible study sessions
        try:
            bible_sessions = (
                self._client.table("bible_study_sessions")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            for session in bible_sessions.data or []:
                activities.append(
                    {
                        "type": "bible_study",
                        "title": f"{session['book']} {session['chapter']}",
                        "subtitle": "Bible Study",
                        "created_at": session["created_at"],
                        "path": "/app/bible-study",
                    }
                )
        except Exception as e:
            logger.error(f"Error getting bible study sessions: {e}")

        # Get recent emotional support sessions
        try:
            support_sessions = (
                self._client.table("emotional_support_sessions")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            for session in support_sessions.data or []:
                activities.append(
                    {
                        "type": "support",
                        "title": session.get("mood", "Support Session"),
                        "subtitle": "Emotional Support",
                        "created_at": session["created_at"],
                        "path": "/app/emotional-support",
                    }
                )
        except Exception as e:
            logger.error(f"Error getting support sessions: {e}")

        # Get recent devotions
        try:
            devotions = (
                self._client.table("devotions")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            for devotion in devotions.data or []:
                activities.append(
                    {
                        "type": "devotion",
                        "title": devotion.get("day_plan_summary", "Daily Devotion")[:30]
                        or "Daily Devotion",
                        "subtitle": "Devotion",
                        "created_at": devotion["created_at"],
                        "path": "/app/devotion",
                    }
                )
        except Exception as e:
            logger.error(f"Error getting devotions: {e}")

        # Sort by date and return top results
        activities.sort(key=lambda x: x["created_at"], reverse=True)
        return activities[:limit]

    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        stats = {"streak": 0, "time_today_minutes": 0, "verses_saved": 0}

        try:
            # Get count of favorites (verses saved)
            favorites = (
                self._client.table("user_favorites")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .eq("item_type", "verse")
                .execute()
            )
            stats["verses_saved"] = favorites.count or 0
            logger.info(f"User {user_id} has {stats['verses_saved']} saved verses")
        except Exception as e:
            logger.error(f"Error getting verse count: {e}")

        try:
            # Get total sessions count
            bible_count = len(
                self._client.table("bible_study_sessions")
                .select("id")
                .eq("user_id", user_id)
                .execute()
                .data
                or []
            )
            support_count = len(
                self._client.table("emotional_support_sessions")
                .select("id")
                .eq("user_id", user_id)
                .execute()
                .data
                or []
            )
            devotion_count = len(
                self._client.table("devotions")
                .select("id")
                .eq("user_id", user_id)
                .execute()
                .data
                or []
            )

            logger.info(
                f"User {user_id} stats - bible: {bible_count}, support: {support_count}, devotion: {devotion_count}"
            )

            # Calculate streak based on activity
            total_activities = bible_count + support_count + devotion_count
            stats["streak"] = min(total_activities, 30)  # Simple streak calculation
        except Exception as e:
            logger.error(f"Error getting stats: {e}")

        return stats

    # ==================== Verse Caching Operations ====================

    async def get_cached_verse(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get cached verse for today if available"""
        from datetime import datetime

        try:
            today = datetime.utcnow().date().isoformat()
            response = (
                self._client.table("cached_verses")
                .select("*")
                .eq("user_id", user_id)
                .eq("cached_date", today)
                .execute()
            )
            if response.data and len(response.data) > 0:
                cached = response.data[0]
                return {
                    "verse": cached.get("verse_text", ""),
                    "reference": cached.get("verse_reference", ""),
                }
            return None
        except Exception as e:
            logger.error(f"Error getting cached verse: {e}")
            return None

    async def cache_verse(self, user_id: str, verse: Dict[str, Any]) -> bool:
        """Cache verse for today"""
        from datetime import datetime

        try:
            today = datetime.utcnow().date().isoformat()
            # First delete any existing cached verse for today
            self._client.table("cached_verses").delete().eq("user_id", user_id).eq(
                "cached_date", today
            ).execute()
            # Insert new cached verse
            self._client.table("cached_verses").insert(
                {
                    "user_id": user_id,
                    "verse_text": verse.get("verse", ""),
                    "verse_reference": verse.get("reference", ""),
                    "cached_date": today,
                }
            ).execute()
            return True
        except Exception as e:
            logger.error(f"Error caching verse: {e}")
            return False

    # ==================== Notes Operations ====================

    async def create_note(
        self, user_id: str, note_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Create a new note for a user"""
        try:
            note = {
                "user_id": user_id,
                "title": note_data.get("title", ""),
                "content": note_data.get("content", ""),
                "source_type": note_data.get("source_type", "general"),
                "source_reference": note_data.get("source_reference"),
                "tags": note_data.get("tags", []),
            }
            response = self._client.table("notes").insert(note).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating note: {e}")
            return None

    async def get_notes(
        self, user_id: str, source_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get all notes for a user, optionally filtered by source_type"""
        try:
            query = (
                self._client.table("notes")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
            )
            if source_type:
                query = query.eq("source_type", source_type)
            response = query.execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting notes: {e}")
            return []

    async def get_note(self, note_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific note by ID"""
        try:
            response = (
                self._client.table("notes")
                .select("*")
                .eq("id", note_id)
                .eq("user_id", user_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting note: {e}")
            return None

    async def update_note(
        self, note_id: str, user_id: str, note_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update a note"""
        try:
            update_data = {k: v for k, v in note_data.items() if v is not None}
            update_data["updated_at"] = "now()"
            response = (
                self._client.table("notes")
                .update(update_data)
                .eq("id", note_id)
                .eq("user_id", user_id)
                .execute()
            )
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating note: {e}")
            return None

    async def delete_note(self, note_id: str, user_id: str) -> bool:
        """Delete a note"""
        try:
            self._client.table("notes").delete().eq("id", note_id).eq(
                "user_id", user_id
            ).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting note: {e}")
            return False


# Singleton instance
db = Database()
