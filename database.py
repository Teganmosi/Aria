import sqlite3
import json
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_NAME = "aria.db"

class Database:
    _instance: Optional["Database"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # Ensure latest tables exist
        self._ensure_tables()

    def _ensure_tables(self):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                # Create prayers table if it doesn't exist (since it was missing in init_sqlite.py)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS prayers (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    title TEXT,
                    content TEXT NOT NULL,
                    isanswered BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                """)
                conn.commit()
                # Add aria_insight to cached_verses if missing
                try:
                    cursor.execute("ALTER TABLE cached_verses ADD COLUMN aria_insight TEXT")
                except sqlite3.Error:
                    pass
                
                # Add custom prompt and personal context to profiles if missing
                try:
                    cursor.execute("ALTER TABLE profiles ADD COLUMN aria_custom_prompt TEXT")
                except sqlite3.Error:
                    pass
                try:
                    cursor.execute("ALTER TABLE profiles ADD COLUMN aria_personal_context TEXT")
                except sqlite3.Error:
                    pass
                try:
                    cursor.execute("ALTER TABLE profiles ADD COLUMN aria_voice TEXT DEFAULT 'verse'")
                except sqlite3.Error:
                    pass
                
                # New tables for AI chat
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_chat_sessions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    title TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                """)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_chat_messages (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                """)
                # Add is_locked and password_hash to notes if missing
                try:
                    cursor.execute("ALTER TABLE notes ADD COLUMN is_locked BOOLEAN DEFAULT 0")
                except sqlite3.Error:
                    pass
                try:
                    cursor.execute("ALTER TABLE notes ADD COLUMN password_hash TEXT")
                except sqlite3.Error:
                    pass
                
                conn.commit()
        except Exception as e:
            logger.error(f"Error ensuring tables: {e}")

    def get_connection(self):
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        return conn

    def to_dict(self, row):
        if row is None: return None
        d = dict(row)
        # Handle JSON fields
        json_fields = ['notification_preferences', 'provided_scriptures', 'scripture_reading', 'related_scriptures', 'topics', 'tags']
        for field in json_fields:
            if field in d and d[field]:
                try:
                    d[field] = json.loads(d[field])
                except json.JSONDecodeError:
                    pass
        return d

    # ==================== Auth & Profile Operations ====================

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            return self.to_dict(cursor.fetchone())

    def create_user(self, user_id: str, email: str, hashed_password: str) -> bool:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO users (id, email, hashed_password) VALUES (?, ?, ?)",
                    (user_id, email, hashed_password)
                )
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return False

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM profiles WHERE id = ?", (user_id,))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            return None

    def create_profile(self, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            # Handle JSON serialization
            data = profile_data.copy()
            if 'notification_preferences' in data:
                data['notification_preferences'] = json.dumps(data['notification_preferences'])
            
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO profiles ({columns}) VALUES ({placeholders})"
            
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                return self.get_profile(data['id'])
        except Exception as e:
            logger.error(f"Error creating profile: {e}")
            return None

    def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = profile_data.copy()
            if 'notification_preferences' in data:
                data['notification_preferences'] = json.dumps(data['notification_preferences'])
            
            set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
            query = f"UPDATE profiles SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()) + [user_id])
                conn.commit()
                return self.get_profile(user_id)
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            return None

    # ==================== Bible Study Operations ====================

    def create_bible_study_session(self, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            # SQLite doesn't have arrays, convert to string
            if isinstance(data.get('verses'), list):
                data['verses'] = ','.join(map(str, data['verses']))
            
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO bible_study_sessions ({columns}) VALUES ({placeholders})"
            
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                return self.get_bible_study_session(data['id'])
        except Exception as e:
            logger.error(f"Error creating bible study session: {e}")
            return None

    def get_bible_study_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM bible_study_sessions WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(row) for row in cursor.fetchall()]

    def get_bible_study_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM bible_study_sessions WHERE id = ?", (session_id,))
            return self.to_dict(cursor.fetchone())

    def update_bible_study_session(self, session_id: str, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
            query = f"UPDATE bible_study_sessions SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()) + [session_id])
                conn.commit()
                return self.get_bible_study_session(session_id)
        except Exception as e:
            logger.error(f"Error updating session: {e}")
            return None

    def create_bible_study_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO bible_study_messages ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                # Return the created message
                cursor.execute("SELECT * FROM bible_study_messages WHERE id = ?", (data['id'],))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            return None

    def get_bible_study_messages(self, session_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM bible_study_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
            return [self.to_dict(row) for row in cursor.fetchall()]

    # ==================== Emotional Support Operations ====================

    def create_emotional_support_session(self, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            if 'provided_scriptures' in data: data['provided_scriptures'] = json.dumps(data['provided_scriptures'])
            
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO emotional_support_sessions ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                return self.get_emotional_support_session(data['id'])
        except Exception as e:
            logger.error(f"Error creating emotional session: {e}")
            return None

    def get_emotional_support_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM emotional_support_sessions WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(row) for row in cursor.fetchall()]

    def get_emotional_support_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM emotional_support_sessions WHERE id = ?", (session_id,))
            return self.to_dict(cursor.fetchone())

    def update_emotional_support_session(self, session_id: str, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            if 'provided_scriptures' in data: data['provided_scriptures'] = json.dumps(data['provided_scriptures'])
            set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
            query = f"UPDATE emotional_support_sessions SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()) + [session_id])
                conn.commit()
                return self.get_emotional_support_session(session_id)
        except Exception as e:
            logger.error(f"Error updating emotional session: {e}")
            return None

    def create_emotional_support_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO emotional_support_messages ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                cursor.execute("SELECT * FROM emotional_support_messages WHERE id = ?", (data['id'],))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error creating support message: {e}")
            return None

    def get_emotional_support_messages(self, session_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM emotional_support_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
            return [self.to_dict(row) for row in cursor.fetchall()]

    # ==================== Devotion Operations ====================

    def get_devotion_settings(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM devotion_settings WHERE user_id = ?", (user_id,))
            return self.to_dict(cursor.fetchone())

    def create_devotion_settings(self, settings_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = settings_data.copy()
            if 'topics' in data: data['topics'] = json.dumps(data['topics'])
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO devotion_settings ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                return self.get_devotion_settings(data['user_id'])
        except Exception as e:
            logger.error(f"Error creating devotion settings: {e}")
            return None

    def update_devotion_settings(self, user_id: str, settings_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = settings_data.copy()
            if 'topics' in data: data['topics'] = json.dumps(data['topics'])
            set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
            query = f"UPDATE devotion_settings SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()) + [user_id])
                conn.commit()
                return self.get_devotion_settings(user_id)
        except Exception as e:
            logger.error(f"Error updating devotion settings: {e}")
            return None

    def create_devotion(self, devotion_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = devotion_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            if 'scripture_reading' in data: data['scripture_reading'] = json.dumps(data['scripture_reading'])
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO devotions ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                cursor.execute("SELECT * FROM devotions WHERE id = ?", (data['id'],))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error creating devotion: {e}")
            return None

    def get_devotions(self, user_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM devotions WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(row) for row in cursor.fetchall()]

    def update_devotion(self, devotion_id: str, devotion_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = devotion_data.copy()
            if 'scripture_reading' in data: data['scripture_reading'] = json.dumps(data['scripture_reading'])
            set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
            query = f"UPDATE devotions SET {set_clause} WHERE id = ?"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()) + [devotion_id])
                conn.commit()
                cursor.execute("SELECT * FROM devotions WHERE id = ?", (devotion_id,))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error updating devotion: {e}")
            return None

    # ==================== Bible Operations ====================

    async def fetch_bible_chapter_from_api(self, book: str, chapter: int) -> List[Dict[str, Any]]:
        """Fetch Bible chapter from API.Bible or bible-api.com"""
        # Try bible-api.com first (it's free and no-key required)
        try:
            import httpx
            # Format book name for bible-api.com
            formatted_book = book.replace(" ", "+")
            url = f"https://bible-api.com/{formatted_book}+{chapter}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    verses = []
                    for v in data.get("verses", []):
                        verses.append({
                            "id": f"{book}.{chapter}.{v.get('verse')}",
                            "number": v.get("verse"),
                            "text": v.get("text", "").strip(),
                            "book": book,
                            "chapter": chapter,
                            "verse": v.get("verse")
                        })
                    return verses
        except Exception as e:
            logger.error(f"Error fetching from bible-api.com: {e}")

        # Fallback to API.Bible if key is provided and not placeholder
        if settings.api_bible_key and settings.api_bible_key != "your_api_bible_key_here":
            try:
                book_mapping = {
                    "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM", "Deuteronomy": "DEU",
                    "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
                    "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH",
                    "Ezra": "EZR", "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB", "Psalms": "PSA",
                    "Proverbs": "PRO", "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA",
                    "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Romans": "ROM",
                    "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL", "Ephesians": "EPH",
                    "Philippians": "PHP", "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
                    "1 Timothy": "1TI", "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
                    "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
                    "3 John": "3JN", "Jude": "JUD", "Revelation": "REV"
                }
                api_book = book_mapping.get(book, book.upper()[:3])
                chapter_id = f"{api_book}.{chapter}"
                url = f"https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/chapters/{chapter_id}?content-type=json"
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.get(url, headers={"api-key": settings.api_bible_key})
                    if response.status_code == 200:
                        data = response.json()
                        content = data.get("data", {}).get("content", [])
                        return self._parse_bible_json(book, chapter, content)
            except Exception as e:
                logger.error(f"Error fetching from API.Bible: {e}")
        
        return []

    def _parse_bible_json(self, book, chapter, content):
        """Helper to parse API.Bible complex JSON output"""
        verses = []
        for item in content:
            if not (isinstance(item, dict) and item.get("type") == "tag" and item.get("name") == "p"):
                continue
            for content_item in item.get("items", []):
                if isinstance(content_item, dict) and content_item.get("type") == "tag" and content_item.get("name") == "verse":
                    verse_num = content_item.get("attrs", {}).get("number")
                    verse_id = content_item.get("attrs", {}).get("id")
                    verses.append({
                        "id": verse_id, "number": verse_num, "text": "Fetching detailed text...",
                        "book": book, "chapter": chapter
                    })
        return verses

    def get_bible_verse(self, book: str, chapter: int, verse: int) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM bible_verses WHERE book = ? AND chapter = ? AND verse = ?", (book, chapter, verse))
            return self.to_dict(cursor.fetchone())

    def search_bible_verses(self, query: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM bible_verses WHERE text LIKE ?", (f"%{query}%",))
            return [self.to_dict(row) for row in cursor.fetchall()]

    def get_scripture_references(self, category: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM scripture_references WHERE category = ?", (category,))
            return [self.to_dict(row) for row in cursor.fetchall()]

    # ==================== User Activity Operations ====================

    def get_user_activity(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        activities = []
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Bible sessions
            cursor.execute("SELECT id, book, chapter, created_at FROM bible_study_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
            for row in cursor.fetchall():
                activities.append({
                    "type": "bible_study", "title": f"{row['book']} {row['chapter']}", 
                    "subtitle": "Bible Study", "created_at": row['created_at'], "path": "/app/bible-study"
                })
            
            # Support sessions
            cursor.execute("SELECT id, mood, created_at FROM emotional_support_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
            for row in cursor.fetchall():
                 activities.append({
                    "type": "support", "title": row['mood'], 
                    "subtitle": "Emotional Support", "created_at": row['created_at'], "path": "/app/emotional-support"
                })
            
            # Devotions
            cursor.execute("SELECT id, day_plan_summary, created_at FROM devotions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
            for row in cursor.fetchall():
                 activities.append({
                    "type": "devotion", "title": (row['day_plan_summary'] or "Daily Devotion")[:30], 
                    "subtitle": "Devotion", "created_at": row['created_at'], "path": "/app/devotion"
                })
            # AI Chat sessions
            cursor.execute("SELECT id, title, created_at FROM ai_chat_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
            for row in cursor.fetchall():
                 activities.append({
                    "type": "chat", "title": row['title'] or "Conversation", 
                    "subtitle": "AI Chat", "created_at": row['created_at'], "path": "/app/ai-chat"
                })
        
        activities.sort(key=lambda x: x["created_at"], reverse=True)
        return activities[:limit]

    # ==================== Notes Operations ====================

    def create_note(self, user_id: str, note_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = note_data.copy()
            import uuid
            data['id'] = str(uuid.uuid4())
            data['user_id'] = user_id
            if 'tags' in data: data['tags'] = json.dumps(data['tags'])
            
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO notes ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                cursor.execute("SELECT * FROM notes WHERE id = ?", (data['id'],))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error creating note: {e}")
            return None

    def get_note(self, note_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notes WHERE id = ? AND user_id = ?", (note_id, user_id))
            return self.to_dict(cursor.fetchone())

    def get_notes(self, user_id: str, source_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if source_type:
                cursor.execute("SELECT * FROM notes WHERE user_id = ? AND source_type = ? ORDER BY created_at DESC", (user_id, source_type))
            else:
                cursor.execute("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(row) for row in cursor.fetchall()]

    def delete_note(self, note_id: str, user_id: str) -> bool:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM notes WHERE id = ? AND user_id = ?", (note_id, user_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting note: {e}")
            return False

    def verify_note_password(self, note_id: str, user_id: str, password: str) -> bool:
        from auth import verify_password
        note = self.get_note(note_id, user_id)
        if not note or not note.get('password_hash'):
            return False
        return verify_password(password, note['password_hash'])

    def update_note(self, note_id: str, user_id: str, note_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = note_data.copy()
            if 'tags' in data: data['tags'] = json.dumps(data['tags'])
            set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
            query = f"UPDATE notes SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()) + [note_id, user_id])
                conn.commit()
                cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error updating note: {e}")
            return None

    # ==================== Prayer Operations ====================

    def create_prayer(self, prayer_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = prayer_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO prayers ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                cursor.execute("SELECT * FROM prayers WHERE id = ?", (data['id'],))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error creating prayer: {e}")
            return None

    def delete_prayer(self, prayer_id: str) -> bool:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM prayers WHERE id = ?", (prayer_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting prayer: {e}")
            return False

    # ==================== Dashboard Stats ====================

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        stats = {
            "streak_days": 1, 
            "time_today_minutes": 15, 
            "total_reflections": 0,
            "streak_history": [False] * 7
        }
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Total reflections (from notes)
                cursor.execute("SELECT COUNT(*) as count FROM notes WHERE user_id = ?", (user_id,))
                stats["total_reflections"] = cursor.fetchone()["count"]
                
                # Calculate streak history (last 7 days starting from Sunday)
                # We'll get all devotions from exactly the last 7 days inclusive of today
                today = datetime.now()
                # Find the most recent Sunday
                days_since_sunday = (today.weekday() + 1) % 7
                sunday = today - timedelta(days=days_since_sunday)
                
                history = []
                for i in range(7):
                    day_check = sunday + timedelta(days=i)
                    day_str = day_check.strftime("%Y-%m-%d")
                    # Check for any meaningful activity
                    cursor.execute("""
                        SELECT EXISTS(SELECT 1 FROM devotions WHERE user_id = ? AND date(created_at) = ?) OR
                        EXISTS(SELECT 1 FROM bible_study_sessions WHERE user_id = ? AND date(created_at) = ?) OR
                        EXISTS(SELECT 1 FROM emotional_support_sessions WHERE user_id = ? AND date(created_at) = ?) OR
                        EXISTS(SELECT 1 FROM notes WHERE user_id = ? AND date(created_at) = ?)
                    """, (user_id, day_str, user_id, day_str, user_id, day_str, user_id, day_str))
                    history.append(bool(cursor.fetchone()[0]))
                
                stats["streak_history"] = history
                # Current streak is consecutive completed days backwards from today
                streak = 0
                today_idx = (today.weekday() + 1) % 7
                for i in range(today_idx, -1, -1):
                    if history[i]: streak += 1
                    else: break
                stats["streak_days"] = streak
                    
            return stats
        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            return stats

    def get_prayers(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                # Get emotional sessions that resulted in a prayer suggestion
                cursor.execute(
                    "SELECT id, prayer_suggestion as content, created_at FROM emotional_support_sessions WHERE user_id = ? AND prayer_suggestion IS NOT NULL ORDER BY created_at DESC", 
                    (user_id,)
                )
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Error getting prayers: {e}")
            return []

    def get_cached_verse(self, user_id: str, date_str: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT verse_text as verse, verse_reference as reference, aria_insight as insight FROM cached_verses WHERE user_id = ? AND cached_date = ?",
                    (user_id, date_str)
                )
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception as e:
            logger.error(f"Error getting cached verse: {e}")
            return None

    def save_cached_verse(self, user_id: str, date_str: str, verse_data: Dict[str, Any]) -> bool:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                # Delete old caches for this user
                cursor.execute("DELETE FROM cached_verses WHERE user_id = ?", (user_id,))
                cursor.execute(
                    "INSERT INTO cached_verses (user_id, verse_text, verse_reference, aria_insight, cached_date) VALUES (?, ?, ?, ?, ?)",
                    (user_id, verse_data["verse"], verse_data["reference"], verse_data.get("insight"), date_str)
                )
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error saving cached verse: {e}")
            return False

    # ==================== AI Chat Operations ====================

    def create_chat_session(self, user_id: str, title: str = "New Conversation") -> Optional[Dict[str, Any]]:
        try:
            import uuid
            session_id = str(uuid.uuid4())
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO ai_chat_sessions (id, user_id, title) VALUES (?, ?, ?)",
                    (session_id, user_id, title)
                )
                conn.commit()
                return {"id": session_id, "user_id": user_id, "title": title}
        except Exception as e:
            logger.error(f"Error creating chat session: {e}")
            return None

    def get_chat_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT * FROM ai_chat_sessions WHERE user_id = ? ORDER BY updated_at DESC", 
                    (user_id,)
                )
                return [self.to_dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Error getting chat sessions: {e}")
            return []

    def get_chat_session_messages(self, session_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC", 
                    (session_id,)
                )
                return [self.to_dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Error getting chat messages: {e}")
            return []

    def create_chat_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO ai_chat_messages ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                cursor.execute(
                    "UPDATE ai_chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
                    (data['session_id'],)
                )
                conn.commit()
                cursor.execute("SELECT * FROM ai_chat_messages WHERE id = ?", (data['id'],))
                return self.to_dict(cursor.fetchone())
        except Exception as e:
            logger.error(f"Error creating chat message: {e}")
            return None

    def update_chat_session_title(self, session_id: str, title: str) -> bool:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE ai_chat_sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
                    (title, session_id)
                )
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error updating chat session title: {e}")
            return False

db = Database()
