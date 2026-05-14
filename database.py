import sqlite3
import os
import json
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_NAME = os.getenv("DATABASE_PATH", "aria.db")

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
                
                # Add daily_manna to cached_verses if missing
                try:
                    cursor.execute("ALTER TABLE cached_verses ADD COLUMN daily_manna TEXT")
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
                    cursor.execute("ALTER TABLE profiles ADD COLUMN aria_voice TEXT DEFAULT 'sage'")
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
                
                # New table for Devotion Messages
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS devotion_messages (
                    id TEXT PRIMARY KEY,
                    devotion_id TEXT NOT NULL REFERENCES devotions(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                """)
                
                conn.commit()
        except Exception:
            logger.exception("Error ensuring tables")

    def get_connection(self):
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        return conn

    def _parse_json_fields(self, d):
        json_fields = ['notification_preferences', 'provided_scriptures', 'scripture_reading', 'related_scriptures', 'topics', 'tags']
        for field in json_fields:
            if field in d and d[field]:
                try:
                    d[field] = json.loads(d[field])
                except json.JSONDecodeError:
                    pass

    def _parse_verses_field(self, d):
        if 'verses' not in d:
            return
        val = d['verses']
        if isinstance(val, str) and val.strip():
            try:
                d['verses'] = [int(v.strip()) for v in val.split(',') if v.strip()]
            except (ValueError, TypeError):
                d['verses'] = []
        elif not isinstance(val, list):
            d['verses'] = []

    def to_dict(self, row):
        if row is None: return None
        d = dict(row)
        self._parse_json_fields(d)
        self._parse_verses_field(d)
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
        except Exception:
            logger.exception("Error creating user")
            return False

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM profiles WHERE id = ?", (user_id,))
                return self.to_dict(cursor.fetchone())
        except Exception:
            logger.exception("Error getting profile")
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
        except Exception:
            logger.exception("Error creating profile")
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
        except Exception:
            logger.exception("Error updating profile")
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
        except Exception:
            logger.exception("Error creating bible study session")
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
        except Exception:
            logger.exception("Error updating session")
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
        except Exception:
            logger.exception("Error creating message")
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
        except Exception:
            logger.exception("Error creating emotional session")
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
        except Exception:
            logger.exception("Error updating emotional session")
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
        except Exception:
            logger.exception("Error creating support message")
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
        except Exception:
            logger.exception("Error creating devotion settings")
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
        except Exception:
            logger.exception("Error updating devotion settings")
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
        except Exception:
            logger.exception("Error creating devotion")
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
        except Exception:
            logger.exception("Error updating devotion")
            return None

    def create_devotion_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            import uuid
            if 'id' not in data: data['id'] = str(uuid.uuid4())
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO devotion_messages ({columns}) VALUES ({placeholders})"
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, list(data.values()))
                conn.commit()
                cursor.execute("SELECT * FROM devotion_messages WHERE id = ?", (data['id'],))
                return self.to_dict(cursor.fetchone())
        except Exception:
            logger.exception("Error creating devotion message")
            return None

    def get_devotion_messages(self, devotion_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM devotion_messages WHERE devotion_id = ? ORDER BY created_at ASC", (devotion_id,))
                return [self.to_dict(row) for row in cursor.fetchall()]
        except Exception:
            logger.exception("Error getting devotion messages")
            return []

    # ==================== Bible Operations ====================

    async def fetch_bible_chapter_from_api(self, book: str, chapter: int, version: str = "KJV") -> List[Dict[str, Any]]:
        """Fetch Bible chapter from API and cache it locally"""
        # 1. Try local cache first
        local_verses = self.get_bible_chapter_local(book, chapter, version)
        if local_verses:
            logger.info(f"📚 Loaded {book} {chapter} from local cache")
            return local_verses

        # 2. Fetch from API if not found locally
        logger.info(f"🌐 Fetching {book} {chapter} from external API...")
        fetched_verses = []
        try:
            import httpx
            # Format book name for bible-api.com
            formatted_book = book.replace(" ", "+")
            url = f"https://bible-api.com/{formatted_book}+{chapter}?translation={version.lower()}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    for v in data.get("verses", []):
                        fetched_verses.append({
                            "book": book,
                            "chapter": chapter,
                            "verse": v.get("verse"),
                            "text": v.get("text", "").strip(),
                            "version": version.upper()
                        })
                    
                    # 3. Save to local cache for next time
                    if fetched_verses:
                        self.save_bible_verses(fetched_verses)
                        
                    return fetched_verses
        except Exception:
            logger.exception("Error fetching from API")

        return []

    def get_bible_chapter_local(self, book: str, chapter: int, version: str = "KJV") -> List[Dict[str, Any]]:
        """Get all verses in a chapter from local DB"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM bible_verses WHERE LOWER(book) = LOWER(?) AND chapter = ? AND version = ? ORDER BY verse ASC",
                (book, chapter, version.upper())
            )
            return [dict(row) for row in cursor.fetchall()]

    def save_bible_verses(self, verses: List[Dict[str, Any]]):
        """Save multiple verses to local DB"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                for v in verses:
                    cursor.execute(
                        """INSERT OR IGNORE INTO bible_verses 
                           (book, chapter, verse, text, version) 
                           VALUES (?, ?, ?, ?, ?)""",
                        (v['book'], v['chapter'], v['verse'], v['text'], v.get('version', 'KJV').upper())
                    )
                conn.commit()
                logger.info(f"💾 Cached {len(verses)} verses locally")
        except Exception:
            logger.exception("Error saving verses to cache")

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

    def get_bible_verse(self, book: str, chapter: int, verse: int, version: str = "KJV") -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM bible_verses WHERE LOWER(book) = LOWER(?) AND chapter = ? AND verse = ? AND version = ?", 
                (book, chapter, verse, version.upper())
            )
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
        except Exception:
            logger.exception("Error creating note")
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
        except Exception:
            logger.exception("Error deleting note")
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
        except Exception:
            logger.exception("Error updating note")
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
        except Exception:
            logger.exception("Error creating prayer")
            return None

    def delete_prayer(self, prayer_id: str, user_id: str) -> bool:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM prayers WHERE id = ? AND user_id = ?", (prayer_id, user_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception:
            logger.exception("Error deleting prayer")
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
        except Exception:
            logger.exception("Error getting user stats")
            return stats

    def get_prayers(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT * FROM prayers WHERE user_id = ? ORDER BY created_at DESC", 
                    (user_id,)
                )
                return [self.to_dict(row) for row in cursor.fetchall()]
        except Exception:
            logger.exception("Error getting prayers")
            return []

    def get_cached_verse(self, user_id: str, date_str: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT verse_text as verse, verse_reference as reference, aria_insight as insight, daily_manna FROM cached_verses WHERE user_id = ? AND cached_date = ?",
                    (user_id, date_str)
                )
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception:
            logger.exception("Error getting cached verse")
            return None

    def save_cached_verse(self, user_id: str, date_str: str, verse_data: Dict[str, Any]) -> bool:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                # Delete old caches for this user
                cursor.execute("DELETE FROM cached_verses WHERE user_id = ?", (user_id,))
                cursor.execute(
                    "INSERT INTO cached_verses (user_id, verse_text, verse_reference, aria_insight, daily_manna, cached_date) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, verse_data["verse"], verse_data["reference"], verse_data.get("insight"), verse_data.get("daily_manna"), date_str)
                )
                conn.commit()
                return True
        except Exception:
            logger.exception("Error saving cached verse")
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
        except Exception:
            logger.exception("Error creating chat session")
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
        except Exception:
            logger.exception("Error getting chat sessions")
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
        except Exception:
            logger.exception("Error getting chat messages")
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
        except Exception:
            logger.exception("Error creating chat message")
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
        except Exception:
            logger.exception("Error updating chat session title")
            return False

db = Database()
