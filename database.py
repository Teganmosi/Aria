import os
import json
import logging
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool
from supabase import create_client, Client

from config import settings

logger = logging.getLogger(__name__)

# Monkeypatch to fix a bug in supabase-py 2.7.0 client.py where realtime client is hardcoded to None,
# causing AttributeErrors during sign_in_with_password because the library tries to do self.realtime.set_auth().
try:
    from supabase._sync.client import SyncClient
    
    def safe_listen_to_auth_events(self, event, session):
        access_token = self.supabase_key
        if event in ["SIGNED_IN", "TOKEN_REFRESHED", "SIGNED_OUT"]:
            self._postgrest = None
            self._storage = None
            self._functions = None
            access_token = session.access_token if session else self.supabase_key

        self.options.headers["Authorization"] = self._create_auth_header(access_token)

        # Only call set_auth if realtime is initialized and not None
        if self.realtime is not None:
            self.realtime.set_auth(access_token)

    SyncClient._listen_to_auth_events = safe_listen_to_auth_events
    logger.info("Successfully patched Supabase SyncClient._listen_to_auth_events for safety")
except Exception:
    logger.exception("Failed to patch Supabase SyncClient")


class Database:
    _instance: Optional["Database"] = None
    _pool: Optional[ThreadedConnectionPool] = None
    _pool_pid: Optional[int] = None
    _tables_ensured: bool = False
    _ensuring_tables: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    _COLUMN_ALLOWLISTS: Dict[str, frozenset] = {
        "profiles": frozenset({"id", "email", "full_name", "avatar_url", "preferred_bible_version",
                                "notification_preferences", "spiritual_journey_notes",
                                "aria_custom_prompt", "aria_personal_context", "aria_voice",
                                "created_at", "updated_at"}),
        "bible_study_sessions": frozenset({"id", "user_id", "book", "chapter", "verses",
                                            "selected_text", "is_realtime", "ai_explanation",
                                            "ai_context", "conversation_summary", "created_at", "updated_at"}),
        "bible_study_messages": frozenset({"id", "session_id", "role", "content", "created_at"}),
        "emotional_support_sessions": frozenset({"id", "user_id", "mood", "situation_description",
                                                   "is_realtime", "ai_response", "provided_scriptures",
                                                   "prayer_suggestion", "created_at", "updated_at"}),
        "emotional_support_messages": frozenset({"id", "session_id", "role", "content", "created_at"}),
        "devotion_settings": frozenset({"id", "user_id", "topics", "preferred_time", "timezone",
                                         "duration_minutes", "auto_prayer", "created_at", "updated_at"}),
        "devotions": frozenset({"id", "user_id", "scheduled_for", "day_plan_summary", "scripture_reading",
                                 "reflection_prompt", "user_reflection", "status", "completed_at",
                                 "ai_prayer", "created_at"}),
        "devotion_messages": frozenset({"id", "devotion_id", "role", "content", "created_at"}),
        "notes": frozenset({"id", "user_id", "title", "content", "source_type", "source_reference",
                             "tags", "is_locked", "password_hash", "created_at", "updated_at"}),
        "prayers": frozenset({"id", "user_id", "title", "content", "isanswered", "created_at"}),
        "ai_chat_sessions": frozenset({"id", "user_id", "title", "created_at", "updated_at"}),
        "ai_chat_messages": frozenset({"id", "session_id", "role", "content", "created_at"}),
    }

    def _validate_columns(self, table: str, keys) -> None:
        allowed = self._COLUMN_ALLOWLISTS.get(table, frozenset())
        bad = frozenset(keys) - allowed
        if bad:
            raise ValueError(f"Disallowed column(s) for table '{table}': {bad}")

    _client: Optional[Client] = None

    def __init__(self):
        if hasattr(self, '_initialized'):
            return
        self._initialized = True
        
        # Initialize Supabase client if credentials are provided
        if settings.supabase_url and settings.supabase_key:
            try:
                self.__class__._client = create_client(settings.supabase_url, settings.supabase_key)
                logger.info("Supabase client initialized with anon key")
            except Exception:
                logger.exception("⚠️ Failed to initialize Supabase client (possibly invalid key)")

        current_pid = os.getpid()
        if not self.__class__._pool or getattr(self.__class__, "_pool_pid", None) != current_pid:
            try:
                self.__class__._pool = ThreadedConnectionPool(
                    minconn=settings.db_pool_min,
                    maxconn=settings.db_pool_max,
                    dsn=settings.database_url,
                )
                self.__class__._pool_pid = current_pid
                # Ensure tables exist in the database (whether local or remote Supabase)
                self._ensure_tables()
                # Apply any unapplied versioned SQL migrations from supabase/migrations/
                self._apply_pending_migrations()
            except Exception:
                logger.exception("⚠️ Failed to initialize database connection pool on startup")
                logger.warning("Database connection will be retried lazily during request handling.")

    @property
    def client(self) -> Client:
        if not self.__class__._client:
            raise RuntimeError("Supabase client is not initialized. Please check your SUPABASE_URL and SUPABASE_KEY configuration.")
        return self.__class__._client


    @contextmanager
    def get_connection(self):
        current_pid = os.getpid()
        if not self.__class__._pool or getattr(self.__class__, "_pool_pid", None) != current_pid:
            logger.info(f"Attempting lazy database pool initialization for PID {current_pid}...")
            try:
                self.__class__._pool = ThreadedConnectionPool(
                    minconn=settings.db_pool_min,
                    maxconn=settings.db_pool_max,
                    dsn=settings.database_url,
                )
                self.__class__._pool_pid = current_pid
            except Exception as e:
                logger.exception("Lazy pool initialization failed")
                raise RuntimeError(f"Database connection pool not initialized: {e}")

        if not self.__class__._tables_ensured:
            self._ensure_tables()

        conn = self._pool.getconn()
        close_conn = False
        try:
            yield conn
            conn.commit()
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
            logger.warning(f"Database connection error: {e}. Discarding connection from pool.")
            close_conn = True
            raise
        except Exception:
            try:
                if conn and not conn.closed:
                    conn.rollback()
            except Exception as rollback_err:
                logger.warning(f"Failed to rollback connection: {rollback_err}")
                close_conn = True
            raise
        finally:
            try:
                self._pool.putconn(conn, close=close_conn)
            except Exception:
                logger.exception("Error returning connection to pool")

    def _apply_pending_migrations(self):
        """Apply unapplied SQL migrations from supabase/migrations/ in filename order.

        Existing databases are baselined on first run: if the schema already exists
        (users table present) but schema_migrations is new, all current files are
        recorded as applied without being executed — they were either run manually in
        Supabase or are covered by _ensure_tables. New files added later run normally.
        """
        migrations_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "supabase", "migrations"
        )
        if not os.path.isdir(migrations_dir):
            return
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "CREATE TABLE IF NOT EXISTS schema_migrations ("
                    "filename TEXT PRIMARY KEY, applied_at TIMESTAMP DEFAULT NOW())"
                )
                cur.execute("SELECT filename FROM schema_migrations")
                applied = {r["filename"] for r in cur.fetchall()}
                files = sorted(f for f in os.listdir(migrations_dir) if f.endswith(".sql"))
                if not applied and files:
                    cur.execute(
                        "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
                        "WHERE table_schema = 'public' AND table_name = 'users') AS exists_"
                    )
                    if cur.fetchone()["exists_"]:
                        for f in files:
                            cur.execute(
                                "INSERT INTO schema_migrations (filename) VALUES (%s)", (f,)
                            )
                        logger.info(f"Baselined {len(files)} existing SQL migrations")
                        return
                for f in files:
                    if f in applied:
                        continue
                    with open(os.path.join(migrations_dir, f), encoding="utf-8") as fh:
                        sql = fh.read()
                    logger.info(f"Applying migration {f}")
                    cur.execute(sql)
                    cur.execute(
                        "INSERT INTO schema_migrations (filename) VALUES (%s)", (f,)
                    )
        except Exception:
            logger.exception("Failed to apply pending SQL migrations")

    def _ensure_tables(self):
        if self.__class__._tables_ensured or self.__class__._ensuring_tables:
            return
        
        self.__class__._ensuring_tables = True
        try:
            # Fast-path check: if users table already exists, skip rest of schema setup (saves dozens of DB roundtrips)
            try:
                with self.get_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')")
                    users_exists = cur.fetchone()[0]
                    
                    # Ensure the new tts_cache table exists regardless
                    cur.execute("""
                    CREATE TABLE IF NOT EXISTS tts_cache (
                        text_hash VARCHAR(64) PRIMARY KEY,
                        text TEXT NOT NULL,
                        voice VARCHAR(50) NOT NULL,
                        response_format VARCHAR(10) NOT NULL,
                        audio_data BYTEA NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                    """)
                    
                    if users_exists:
                        logger.info("Database tables already exist. Skipping schema setup.")
                        self.__class__._tables_ensured = True
                        return
            except Exception as e:
                logger.warning(f"Failed to check if users/tts_cache table exists: {e}. Performing full schema check.")

            # Dynamically check existing id column types to prevent foreign key datatype mismatches (UUID vs TEXT)
            id_type = None
            try:
                with self.get_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("""
                        SELECT data_type 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
                        UNION ALL
                        SELECT data_type 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'
                    """)
                    rows = cur.fetchall()
                    for r in rows:
                        if r and r[0]:
                            val = r[0].upper()
                            id_type = "UUID" if "UUID" in val else "TEXT"
                            logger.info(f"Detected users/profiles id type from database: {id_type}")
                            break
            except Exception as e:
                logger.warning(f"Failed to auto-detect users/profiles id type: {e}")

            if not id_type:
                is_supabase_db = "supabase.co" in settings.database_url or "supabase.com" in settings.database_url
                id_type = "UUID" if is_supabase_db else "TEXT"
                logger.info(f"Fallback id type determined: {id_type}")
            
            with self.get_connection() as conn:
                cur = conn.cursor()

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS users (
                    id {id_type} PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    hashed_password TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS profiles (
                    id {id_type} PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                    email TEXT NOT NULL UNIQUE,
                    full_name TEXT,
                    avatar_url TEXT,
                    preferred_bible_version TEXT DEFAULT 'NIV',
                    notification_preferences TEXT DEFAULT '{{\"email\": true, \"push\": true}}',
                    spiritual_journey_notes TEXT,
                    aria_custom_prompt TEXT,
                    aria_personal_context TEXT,
                    aria_voice TEXT DEFAULT 'verse',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS prayers (
                    id TEXT PRIMARY KEY,
                    user_id {id_type} NOT NULL,
                    title TEXT,
                    content TEXT NOT NULL,
                    isanswered BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS bible_study_sessions (
                    id {id_type} PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    book TEXT NOT NULL,
                    chapter INTEGER NOT NULL,
                    verses TEXT NOT NULL,
                    selected_text TEXT NOT NULL,
                    is_realtime BOOLEAN DEFAULT FALSE,
                    ai_explanation TEXT,
                    ai_context TEXT,
                    conversation_summary TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS bible_study_messages (
                    id {id_type} PRIMARY KEY,
                    session_id {id_type} NOT NULL REFERENCES bible_study_sessions(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS emotional_support_sessions (
                    id {id_type} PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    mood TEXT NOT NULL,
                    situation_description TEXT,
                    is_realtime BOOLEAN DEFAULT FALSE,
                    ai_response TEXT,
                    provided_scriptures TEXT,
                    prayer_suggestion TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS emotional_support_messages (
                    id {id_type} PRIMARY KEY,
                    session_id {id_type} NOT NULL REFERENCES emotional_support_sessions(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS devotion_settings (
                    user_id {id_type} PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
                    preferred_time TEXT NOT NULL,
                    timezone TEXT NOT NULL,
                    duration_minutes INTEGER DEFAULT 15,
                    topics TEXT DEFAULT '[]',
                    auto_prayer BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS devotions (
                    id {id_type} PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
                    day_plan_summary TEXT,
                    scripture_reading TEXT,
                    reflection_prompt TEXT,
                    user_reflection TEXT,
                    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped')),
                    completed_at TIMESTAMP WITH TIME ZONE,
                    ai_prayer TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute("""
                CREATE TABLE IF NOT EXISTS bible_verses (
                    id SERIAL PRIMARY KEY,
                    book TEXT NOT NULL,
                    chapter INTEGER NOT NULL,
                    verse INTEGER NOT NULL,
                    text TEXT NOT NULL,
                    version TEXT DEFAULT 'NIV',
                    UNIQUE (book, chapter, verse, version)
                )
                """)

                cur.execute("""
                CREATE TABLE IF NOT EXISTS scripture_references (
                    id SERIAL PRIMARY KEY,
                    verse_id INTEGER NOT NULL REFERENCES bible_verses(id) ON DELETE CASCADE,
                    category TEXT NOT NULL,
                    tags TEXT NOT NULL,
                    context_description TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS user_favorites (
                    id TEXT PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    item_type TEXT NOT NULL CHECK (item_type IN ('verse', 'prayer', 'devotion')),
                    item_id TEXT NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE (user_id, item_type, item_id)
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS journal_entries (
                    id TEXT PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    title TEXT,
                    content TEXT NOT NULL,
                    mood TEXT,
                    related_scriptures TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS cached_verses (
                    id SERIAL PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    verse_text TEXT NOT NULL,
                    verse_reference TEXT NOT NULL,
                    aria_insight TEXT,
                    daily_manna TEXT,
                    cached_date TEXT NOT NULL
                )
                """)

                cur.execute("""
                CREATE TABLE IF NOT EXISTS tts_cache (
                    text_hash VARCHAR(64) PRIMARY KEY,
                    text TEXT NOT NULL,
                    voice VARCHAR(50) NOT NULL,
                    response_format VARCHAR(10) NOT NULL,
                    audio_data BYTEA NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    title TEXT,
                    content TEXT NOT NULL,
                    source_type TEXT DEFAULT 'general',
                    source_reference TEXT,
                    tags TEXT DEFAULT '[]',
                    is_locked BOOLEAN DEFAULT FALSE,
                    password_hash TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS devotion_messages (
                    id {id_type} PRIMARY KEY,
                    devotion_id {id_type} NOT NULL REFERENCES devotions(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS ai_chat_sessions (
                    id {id_type} PRIMARY KEY,
                    user_id {id_type} NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    title TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS ai_chat_messages (
                    id {id_type} PRIMARY KEY,
                    session_id {id_type} NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                cur.execute("""
                CREATE TABLE IF NOT EXISTS revoked_tokens (
                    jti TEXT PRIMARY KEY,
                    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
                )
                """)
                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    token TEXT PRIMARY KEY,
                    user_id {id_type} NOT NULL,
                    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    revoked BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)
                cur.execute(f"""
                CREATE TABLE IF NOT EXISTS consents (
                    id SERIAL PRIMARY KEY,
                    user_id {id_type} NOT NULL,
                    document TEXT NOT NULL,
                    version TEXT NOT NULL,
                    source TEXT DEFAULT 'register',
                    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """)

                # Indexes
                cur.execute("CREATE INDEX IF NOT EXISTS idx_bible_study_sessions_user_id ON bible_study_sessions (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_bible_study_messages_session_id ON bible_study_messages (session_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_emotional_support_sessions_user_id ON emotional_support_sessions (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_devotions_user_id ON devotions (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_devotion_messages_devotion_id ON devotion_messages (devotion_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_cached_verses_user_id_date ON cached_verses (user_id, cached_date)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON ai_chat_sessions (user_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON ai_chat_messages (session_id)")
                cur.execute("CREATE INDEX IF NOT EXISTS idx_consents_user_id ON consents (user_id)")
                self.__class__._tables_ensured = True
        except Exception:
            logger.exception("Error ensuring tables")
        finally:
            self.__class__._ensuring_tables = False

    def _cursor(self, conn):
        return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def _parse_json_fields(self, d: Dict) -> None:
        for field in ('notification_preferences', 'provided_scriptures', 'scripture_reading',
                      'related_scriptures', 'topics', 'tags'):
            if field in d and isinstance(d[field], str):
                try:
                    d[field] = json.loads(d[field])
                except json.JSONDecodeError:
                    pass

    def _parse_verses_field(self, d: Dict) -> None:
        val = d.get('verses')
        if isinstance(val, str) and val.strip():
            try:
                d['verses'] = [int(v.strip()) for v in val.split(',') if v.strip()]
            except (ValueError, TypeError):
                d['verses'] = []
        elif not isinstance(val, list) and val is not None:
            d['verses'] = []

    def to_dict(self, row) -> Optional[Dict]:
        if row is None:
            return None
        d = dict(row)
        self._parse_json_fields(d)
        self._parse_verses_field(d)
        return d

    # ==================== Auth & Token Operations ====================

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            return self.to_dict(cur.fetchone())

    def create_user(self, user_id: str, email: str, hashed_password: str) -> bool:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "INSERT INTO users (id, email, hashed_password) VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    (user_id, email, hashed_password),
                )
                return True
        except Exception:
            logger.exception("Error creating user")
            return False

    def revoke_token(self, jti: str, expires_at: str) -> None:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "INSERT INTO revoked_tokens (jti, expires_at) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (jti, expires_at),
                )
        except Exception:
            logger.exception("Error revoking token")

    def is_token_revoked(self, jti: str) -> bool:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT 1 FROM revoked_tokens WHERE jti = %s", (jti,))
                return cur.fetchone() is not None
        except Exception:
            logger.exception("Error checking token revocation")
            return False

    def store_refresh_token(self, token: str, user_id: str, expires_at: str) -> None:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
                    (token, user_id, expires_at),
                )
        except Exception:
            logger.exception("Error storing refresh token")

    def get_refresh_token(self, token: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "SELECT * FROM refresh_tokens WHERE token = %s AND revoked = FALSE AND expires_at > NOW()",
                    (token,),
                )
                row = cur.fetchone()
                return dict(row) if row else None
        except Exception:
            logger.exception("Error getting refresh token")
            return None

    def revoke_refresh_token(self, token: str) -> None:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("UPDATE refresh_tokens SET revoked = TRUE WHERE token = %s", (token,))
        except Exception:
            logger.exception("Error revoking refresh token")

    # ==================== Profile Operations ====================

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT * FROM profiles WHERE id = %s", (user_id,))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error getting profile")
            return None

    def create_profile(self, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = profile_data.copy()
            if 'notification_preferences' in data and not isinstance(data['notification_preferences'], str):
                data['notification_preferences'] = json.dumps(data['notification_preferences'])
            self._validate_columns("profiles", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO profiles ({cols}) VALUES ({placeholders})", list(data.values()))
            return self.get_profile(data['id'])
        except Exception:
            logger.exception("Error creating profile")
            return None

    def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = profile_data.copy()
            if 'notification_preferences' in data and not isinstance(data['notification_preferences'], str):
                data['notification_preferences'] = json.dumps(data['notification_preferences'])
            self._validate_columns("profiles", data.keys())
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    f"UPDATE profiles SET {set_clause}, updated_at = NOW() WHERE id = %s",
                    list(data.values()) + [user_id],
                )
            return self.get_profile(user_id)
        except Exception:
            logger.exception("Error updating profile")
            return None

    # ==================== Bible Study Operations ====================

    def create_bible_study_session(self, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            if isinstance(data.get('verses'), list):
                is_postgres = "postgres" in settings.database_url
                if not is_postgres:
                    data['verses'] = ','.join(map(str, data['verses']))
            self._validate_columns("bible_study_sessions", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO bible_study_sessions ({cols}) VALUES ({placeholders})", list(data.values()))
            return self.get_bible_study_session(data['id'])
        except Exception:
            logger.exception("Error creating bible study session")
            return None

    def get_bible_study_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM bible_study_sessions WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(r) for r in cur.fetchall()]

    def get_bible_study_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM bible_study_sessions WHERE id = %s", (session_id,))
            return self.to_dict(cur.fetchone())

    def update_bible_study_session(self, session_id: str, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            self._validate_columns("bible_study_sessions", data.keys())
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    f"UPDATE bible_study_sessions SET {set_clause}, updated_at = NOW() WHERE id = %s",
                    list(data.values()) + [session_id],
                )
            return self.get_bible_study_session(session_id)
        except Exception:
            logger.exception("Error updating session")
            return None

    def create_bible_study_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            self._validate_columns("bible_study_messages", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO bible_study_messages ({cols}) VALUES ({placeholders})", list(data.values()))
                cur.execute("SELECT * FROM bible_study_messages WHERE id = %s", (data['id'],))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error creating message")
            return None

    def get_bible_study_messages(self, session_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM bible_study_messages WHERE session_id = %s ORDER BY created_at ASC", (session_id,))
            return [self.to_dict(r) for r in cur.fetchall()]

    # ==================== Emotional Support Operations ====================

    def create_emotional_support_session(self, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            if 'provided_scriptures' in data and not isinstance(data['provided_scriptures'], str):
                data['provided_scriptures'] = json.dumps(data['provided_scriptures'])
            self._validate_columns("emotional_support_sessions", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO emotional_support_sessions ({cols}) VALUES ({placeholders})", list(data.values()))
            return self.get_emotional_support_session(data['id'])
        except Exception:
            logger.exception("Error creating emotional session")
            return None

    def get_emotional_support_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM emotional_support_sessions WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(r) for r in cur.fetchall()]

    def get_emotional_support_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM emotional_support_sessions WHERE id = %s", (session_id,))
            return self.to_dict(cur.fetchone())

    def update_emotional_support_session(self, session_id: str, session_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = session_data.copy()
            if 'provided_scriptures' in data and not isinstance(data['provided_scriptures'], str):
                data['provided_scriptures'] = json.dumps(data['provided_scriptures'])
            self._validate_columns("emotional_support_sessions", data.keys())
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    f"UPDATE emotional_support_sessions SET {set_clause}, updated_at = NOW() WHERE id = %s",
                    list(data.values()) + [session_id],
                )
            return self.get_emotional_support_session(session_id)
        except Exception:
            logger.exception("Error updating emotional session")
            return None

    def create_emotional_support_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            self._validate_columns("emotional_support_messages", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO emotional_support_messages ({cols}) VALUES ({placeholders})", list(data.values()))
                cur.execute("SELECT * FROM emotional_support_messages WHERE id = %s", (data['id'],))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error creating support message")
            return None

    def get_emotional_support_messages(self, session_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM emotional_support_messages WHERE session_id = %s ORDER BY created_at ASC", (session_id,))
            return [self.to_dict(r) for r in cur.fetchall()]

    # ==================== Devotion Operations ====================

    def get_devotion_settings(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM devotion_settings WHERE user_id = %s", (user_id,))
            return self.to_dict(cur.fetchone())

    def create_devotion_settings(self, settings_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = settings_data.copy()
            if 'topics' in data and not isinstance(data['topics'], str):
                data['topics'] = json.dumps(data['topics'])
            self._validate_columns("devotion_settings", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO devotion_settings ({cols}) VALUES ({placeholders})", list(data.values()))
            return self.get_devotion_settings(data['user_id'])
        except Exception:
            logger.exception("Error creating devotion settings")
            return None

    def update_devotion_settings(self, user_id: str, settings_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = settings_data.copy()
            if 'topics' in data and not isinstance(data['topics'], str):
                data['topics'] = json.dumps(data['topics'])
            self._validate_columns("devotion_settings", data.keys())
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    f"UPDATE devotion_settings SET {set_clause}, updated_at = NOW() WHERE user_id = %s",
                    list(data.values()) + [user_id],
                )
            return self.get_devotion_settings(user_id)
        except Exception:
            logger.exception("Error updating devotion settings")
            return None

    def create_devotion(self, devotion_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = devotion_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            if 'scripture_reading' in data and not isinstance(data['scripture_reading'], str):
                data['scripture_reading'] = json.dumps(data['scripture_reading'])
            self._validate_columns("devotions", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO devotions ({cols}) VALUES ({placeholders})", list(data.values()))
                cur.execute("SELECT * FROM devotions WHERE id = %s", (data['id'],))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error creating devotion")
            return None

    def get_devotions(self, user_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM devotions WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(r) for r in cur.fetchall()]

    def update_devotion(self, devotion_id: str, devotion_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = devotion_data.copy()
            if 'scripture_reading' in data and not isinstance(data['scripture_reading'], str):
                data['scripture_reading'] = json.dumps(data['scripture_reading'])
            self._validate_columns("devotions", data.keys())
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    f"UPDATE devotions SET {set_clause} WHERE id = %s",
                    list(data.values()) + [devotion_id],
                )
                cur.execute("SELECT * FROM devotions WHERE id = %s", (devotion_id,))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error updating devotion")
            return None

    def create_devotion_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            self._validate_columns("devotion_messages", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO devotion_messages ({cols}) VALUES ({placeholders})", list(data.values()))
                cur.execute("SELECT * FROM devotion_messages WHERE id = %s", (data['id'],))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error creating devotion message")
            return None

    def get_devotion_messages(self, devotion_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT * FROM devotion_messages WHERE devotion_id = %s ORDER BY created_at ASC", (devotion_id,))
                return [self.to_dict(r) for r in cur.fetchall()]
        except Exception:
            logger.exception("Error getting devotion messages")
            return []

    # ==================== Bible Operations ====================

    async def fetch_bible_chapter_from_api(self, book: str, chapter: int, version: str = "KJV") -> List[Dict[str, Any]]:
        # Always check local DB first — after seed_kjv.py runs, KJV is fully seeded
        # and will never reach the external call below.
        local_verses = self.get_bible_chapter_local(book, chapter, version)
        if local_verses:
            logger.info(f"Loaded {book} {chapter} ({version}) from local DB")
            return local_verses

        # Fallback for translations not yet seeded locally
        logger.info(f"Fetching {book} {chapter} ({version}) from bible-api.com...")
        fetched_verses = []
        try:
            import httpx
            formatted_book = book.replace(" ", "+")
            url = f"https://bible-api.com/{formatted_book}+{chapter}?translation={version.lower()}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    for v in data.get("verses", []):
                        fetched_verses.append({
                            "book": book, "chapter": chapter,
                            "verse": v.get("verse"),
                            "text": v.get("text", "").strip(),
                            "version": version.upper(),
                        })
                    if fetched_verses:
                        self.save_bible_verses(fetched_verses)
                    return fetched_verses
        except Exception:
            logger.exception("Error fetching from external Bible API")
        return []

    def get_bible_chapter_local(self, book: str, chapter: int, version: str = "KJV") -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute(
                "SELECT * FROM bible_verses WHERE LOWER(book) = LOWER(%s) AND chapter = %s AND version = %s ORDER BY verse ASC",
                (book, chapter, version.upper()),
            )
            return [dict(r) for r in cur.fetchall()]

    def save_bible_verses(self, verses: List[Dict[str, Any]]):
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                for v in verses:
                    cur.execute(
                        """INSERT INTO bible_verses (book, chapter, verse, text, version)
                           VALUES (%s, %s, %s, %s, %s)
                           ON CONFLICT (book, chapter, verse, version) DO NOTHING""",
                        (v['book'], v['chapter'], v['verse'], v['text'], v.get('version', 'KJV').upper()),
                    )
                logger.info(f"Cached {len(verses)} verses locally")
        except Exception:
            logger.exception("Error saving verses to cache")

    def get_bible_verse(self, book: str, chapter: int, verse: int, version: str = "KJV") -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute(
                "SELECT * FROM bible_verses WHERE LOWER(book) = LOWER(%s) AND chapter = %s AND verse = %s AND version = %s",
                (book, chapter, verse, version.upper()),
            )
            return self.to_dict(cur.fetchone())

    def search_bible_verses(self, query: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM bible_verses WHERE text ILIKE %s", (f"%{query}%",))
            return [self.to_dict(r) for r in cur.fetchall()]

    def get_scripture_references(self, category: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM scripture_references WHERE category = %s", (category,))
            return [self.to_dict(r) for r in cur.fetchall()]

    # ==================== User Activity Operations ====================

    def get_user_activity(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        activities = []
        with self.get_connection() as conn:
            cur = self._cursor(conn)

            cur.execute(
                "SELECT id, book, chapter, created_at FROM bible_study_sessions WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
                (user_id, limit),
            )
            for row in cur.fetchall():
                activities.append({
                    "type": "bible_study", "title": f"{row['book']} {row['chapter']}",
                    "subtitle": "Bible Study", "created_at": row['created_at'], "path": "/app/bible-study",
                })

            cur.execute(
                "SELECT id, mood, created_at FROM emotional_support_sessions WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
                (user_id, limit),
            )
            for row in cur.fetchall():
                activities.append({
                    "type": "support", "title": row['mood'],
                    "subtitle": "Emotional Support", "created_at": row['created_at'], "path": "/app/emotional-support",
                })

            cur.execute(
                "SELECT id, day_plan_summary, created_at FROM devotions WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
                (user_id, limit),
            )
            for row in cur.fetchall():
                activities.append({
                    "type": "devotion", "title": (row['day_plan_summary'] or "Daily Devotion")[:30],
                    "subtitle": "Devotion", "created_at": row['created_at'], "path": "/app/devotion",
                })

            cur.execute(
                "SELECT id, title, created_at FROM ai_chat_sessions WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
                (user_id, limit),
            )
            for row in cur.fetchall():
                activities.append({
                    "type": "chat", "title": row['title'] or "Conversation",
                    "subtitle": "AI Chat", "created_at": row['created_at'], "path": "/app/ai-chat",
                })

        activities.sort(key=lambda x: x["created_at"], reverse=True)
        return activities[:limit]

    # ==================== Notes Operations ====================

    def create_note(self, user_id: str, note_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = note_data.copy()
            data['id'] = str(uuid.uuid4())
            data['user_id'] = user_id
            if 'tags' in data and not isinstance(data['tags'], str):
                data['tags'] = json.dumps(data['tags'])
            self._validate_columns("notes", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO notes ({cols}) VALUES ({placeholders})", list(data.values()))
                cur.execute("SELECT * FROM notes WHERE id = %s", (data['id'],))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error creating note")
            return None

    def get_note(self, note_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            cur.execute("SELECT * FROM notes WHERE id = %s AND user_id = %s", (note_id, user_id))
            return self.to_dict(cur.fetchone())

    def get_notes(self, user_id: str, source_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = self._cursor(conn)
            if source_type:
                cur.execute(
                    "SELECT * FROM notes WHERE user_id = %s AND source_type = %s ORDER BY created_at DESC",
                    (user_id, source_type),
                )
            else:
                cur.execute("SELECT * FROM notes WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
            return [self.to_dict(r) for r in cur.fetchall()]

    def delete_note(self, note_id: str, user_id: str) -> bool:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("DELETE FROM notes WHERE id = %s AND user_id = %s", (note_id, user_id))
                return cur.rowcount > 0
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
            if 'tags' in data and not isinstance(data['tags'], str):
                data['tags'] = json.dumps(data['tags'])
            self._validate_columns("notes", data.keys())
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    f"UPDATE notes SET {set_clause}, updated_at = NOW() WHERE id = %s AND user_id = %s",
                    list(data.values()) + [note_id, user_id],
                )
                cur.execute("SELECT * FROM notes WHERE id = %s", (note_id,))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error updating note")
            return None

    # ==================== Prayer Operations ====================

    def create_prayer(self, prayer_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = prayer_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            self._validate_columns("prayers", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO prayers ({cols}) VALUES ({placeholders})", list(data.values()))
                cur.execute("SELECT * FROM prayers WHERE id = %s", (data['id'],))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error creating prayer")
            return None

    def delete_prayer(self, prayer_id: str, user_id: str) -> bool:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("DELETE FROM prayers WHERE id = %s AND user_id = %s", (prayer_id, user_id))
                return cur.rowcount > 0
        except Exception:
            logger.exception("Error deleting prayer")
            return False

    def get_prayers(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT * FROM prayers WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
                return [self.to_dict(r) for r in cur.fetchall()]
        except Exception:
            logger.exception("Error getting prayers")
            return []

    # ==================== Dashboard Stats ====================

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        stats = {"streak_days": 0, "time_today_minutes": 15, "total_reflections": 0, "streak_history": [False] * 7}
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)

                cur.execute("SELECT COUNT(*) AS count FROM notes WHERE user_id = %s", (user_id,))
                stats["total_reflections"] = cur.fetchone()["count"]

                # 1. Calculate Sunday of current week for weekly history [S, M, T, W, T, F, S]
                today = datetime.now()
                days_since_sunday = (today.weekday() + 1) % 7
                sunday = today - timedelta(days=days_since_sunday)

                history = []
                for i in range(7):
                    day_check = sunday + timedelta(days=i)
                    day_str = day_check.strftime("%Y-%m-%d")
                    cur.execute(
                        """SELECT (
                            EXISTS(SELECT 1 FROM devotions WHERE user_id = %s AND created_at::date = %s) OR
                            EXISTS(SELECT 1 FROM bible_study_sessions WHERE user_id = %s AND created_at::date = %s) OR
                            EXISTS(SELECT 1 FROM emotional_support_sessions WHERE user_id = %s AND created_at::date = %s) OR
                            EXISTS(SELECT 1 FROM notes WHERE user_id = %s AND created_at::date = %s)
                        ) AS has_activity""",
                        (user_id, day_str, user_id, day_str, user_id, day_str, user_id, day_str),
                    )
                    history.append(bool(cur.fetchone()['has_activity']))
                stats["streak_history"] = history

                # 2. Calculate true cumulative streak (going backwards indefinitely)
                streak = 0
                check_date = today
                while True:
                    check_date_str = check_date.strftime("%Y-%m-%d")
                    cur.execute(
                        """SELECT (
                            EXISTS(SELECT 1 FROM devotions WHERE user_id = %s AND created_at::date = %s) OR
                            EXISTS(SELECT 1 FROM bible_study_sessions WHERE user_id = %s AND created_at::date = %s) OR
                            EXISTS(SELECT 1 FROM emotional_support_sessions WHERE user_id = %s AND created_at::date = %s) OR
                            EXISTS(SELECT 1 FROM notes WHERE user_id = %s AND created_at::date = %s)
                        ) AS has_activity""",
                        (user_id, check_date_str, user_id, check_date_str, user_id, check_date_str, user_id, check_date_str),
                    )
                    if cur.fetchone()['has_activity']:
                        streak += 1
                        check_date -= timedelta(days=1)
                    else:
                        # If today has no activity, check yesterday to see if the streak is still active
                        if check_date.date() == today.date():
                            check_date -= timedelta(days=1)
                            cur.execute(
                                """SELECT (
                                    EXISTS(SELECT 1 FROM devotions WHERE user_id = %s AND created_at::date = %s) OR
                                    EXISTS(SELECT 1 FROM bible_study_sessions WHERE user_id = %s AND created_at::date = %s) OR
                                    EXISTS(SELECT 1 FROM emotional_support_sessions WHERE user_id = %s AND created_at::date = %s) OR
                                    EXISTS(SELECT 1 FROM notes WHERE user_id = %s AND created_at::date = %s)
                                ) AS has_activity""",
                                (user_id, check_date.strftime("%Y-%m-%d"), user_id, check_date.strftime("%Y-%m-%d"), user_id, check_date.strftime("%Y-%m-%d"), user_id, check_date.strftime("%Y-%m-%d")),
                            )
                            if cur.fetchone()['has_activity']:
                                continue
                        break
                        
                stats["streak_days"] = streak

            return stats
        except Exception:
            logger.exception("Error getting user stats")
            return stats

    # ==================== Cached Verse Operations ====================

    def get_cached_verse(self, user_id: str, date_str: str) -> Optional[Dict[str, Any]]:
        import json as _json
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "SELECT verse_text AS verse, verse_reference AS reference, aria_insight AS insight, daily_manna FROM cached_verses WHERE user_id = %s AND cached_date = %s",
                    (user_id, date_str),
                )
                row = cur.fetchone()
                if not row:
                    return None
                result = dict(row)
                manna = result.get("daily_manna")
                if manna and isinstance(manna, str):
                    try:
                        result["daily_manna"] = _json.loads(manna)
                    except _json.JSONDecodeError:
                        pass  # leave as plain string (old cache rows)
                return result
        except Exception:
            logger.exception("Error getting cached verse")
            return None

    def save_cached_verse(self, user_id: str, date_str: str, verse_data: Dict[str, Any]) -> bool:
        import json as _json
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("DELETE FROM cached_verses WHERE user_id = %s", (user_id,))
                manna = verse_data.get("daily_manna")
                manna_str = _json.dumps(manna) if isinstance(manna, dict) else manna
                cur.execute(
                    "INSERT INTO cached_verses (user_id, verse_text, verse_reference, aria_insight, daily_manna, cached_date) VALUES (%s, %s, %s, %s, %s, %s)",
                    (user_id, verse_data["verse"], verse_data["reference"], verse_data.get("insight"), manna_str, date_str),
                )
                return True
        except Exception:
            logger.exception("Error saving cached verse")
            return False

    # ==================== AI Chat Operations ====================

    def create_chat_session(self, user_id: str, title: str = "New Conversation") -> Optional[Dict[str, Any]]:
        try:
            session_id = str(uuid.uuid4())
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "INSERT INTO ai_chat_sessions (id, user_id, title) VALUES (%s, %s, %s)",
                    (session_id, user_id, title),
                )
            return {"id": session_id, "user_id": user_id, "title": title}
        except Exception:
            logger.exception("Error creating chat session")
            return None

    def get_chat_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT * FROM ai_chat_sessions WHERE id = %s", (session_id,))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error getting chat session")
            return None

    def get_chat_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT * FROM ai_chat_sessions WHERE user_id = %s ORDER BY updated_at DESC", (user_id,))
                return [self.to_dict(r) for r in cur.fetchall()]
        except Exception:
            logger.exception("Error getting chat sessions")
            return []

    def get_chat_session_messages(self, session_id: str) -> List[Dict[str, Any]]:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT * FROM ai_chat_messages WHERE session_id = %s ORDER BY created_at ASC", (session_id,))
                return [self.to_dict(r) for r in cur.fetchall()]
        except Exception:
            logger.exception("Error getting chat messages")
            return []

    def create_chat_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            data = message_data.copy()
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
            self._validate_columns("ai_chat_messages", data.keys())
            cols = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(f"INSERT INTO ai_chat_messages ({cols}) VALUES ({placeholders})", list(data.values()))
                cur.execute(
                    "UPDATE ai_chat_sessions SET updated_at = NOW() WHERE id = %s",
                    (data['session_id'],),
                )
                cur.execute("SELECT * FROM ai_chat_messages WHERE id = %s", (data['id'],))
                return self.to_dict(cur.fetchone())
        except Exception:
            logger.exception("Error creating chat message")
            return None

    def update_chat_session_title(self, session_id: str, title: str) -> bool:
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    "UPDATE ai_chat_sessions SET title = %s, updated_at = NOW() WHERE id = %s",
                    (title, session_id),
                )
                return cur.rowcount > 0
        except Exception:
            logger.exception("Error updating chat session title")
            return False

    def search_user_memory(self, user_id: str, query: str) -> List[Dict[str, Any]]:
        results = []
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                
                # 1. Search notes
                cur.execute(
                    "SELECT id, title, content, source_type, created_at FROM notes WHERE user_id = %s AND (title ILIKE %s OR content ILIKE %s) ORDER BY created_at DESC LIMIT 10",
                    (user_id, f"%{query}%", f"%{query}%")
                )
                for r in cur.fetchall():
                    results.append({
                        "id": r["id"],
                        "source": f"Note / Journal (type: {r['source_type']})",
                        "title": r["title"] or "Untitled",
                        "content": r["content"],
                        "created_at": r["created_at"]
                    })

                # 2. Search journal_entries
                cur.execute(
                    "SELECT id, title, content, mood, created_at FROM journal_entries WHERE user_id = %s AND (title ILIKE %s OR content ILIKE %s OR mood ILIKE %s) ORDER BY created_at DESC LIMIT 10",
                    (user_id, f"%{query}%", f"%{query}%", f"%{query}%")
                )
                for r in cur.fetchall():
                    results.append({
                        "id": r["id"],
                        "source": f"Journal Entry (mood: {r['mood']})",
                        "title": r["title"] or "Untitled",
                        "content": r["content"],
                        "created_at": r["created_at"]
                    })

                # 3. Search ai_chat_messages
                cur.execute(
                    """SELECT m.id, m.content, s.title as session_title, m.created_at 
                       FROM ai_chat_messages m 
                       JOIN ai_chat_sessions s ON m.session_id = s.id 
                       WHERE s.user_id = %s AND m.content ILIKE %s 
                       ORDER BY m.created_at DESC LIMIT 10""",
                    (user_id, f"%{query}%")
                )
                for r in cur.fetchall():
                    results.append({
                        "id": r["id"],
                        "source": "AI Chat Message",
                        "title": r["session_title"] or "AI Chat Session",
                        "content": r["content"],
                        "created_at": r["created_at"]
                    })

                # 4. Search bible_study_messages
                cur.execute(
                    """SELECT m.id, m.content, s.book, s.chapter, s.verses, m.created_at 
                       FROM bible_study_messages m 
                       JOIN bible_study_sessions s ON m.session_id = s.id 
                       WHERE s.user_id = %s AND m.content ILIKE %s 
                       ORDER BY m.created_at DESC LIMIT 10""",
                    (user_id, f"%{query}%")
                )
                for r in cur.fetchall():
                    results.append({
                        "id": r["id"],
                        "source": "Bible Study Message",
                        "title": f"Study of {r['book']} {r['chapter']}:{r['verses']}",
                        "content": r["content"],
                        "created_at": r["created_at"]
                    })

                # 5. Search emotional_support_messages
                cur.execute(
                    """SELECT m.id, m.content, s.mood, m.created_at 
                       FROM emotional_support_messages m 
                       JOIN emotional_support_sessions s ON m.session_id = s.id 
                       WHERE s.user_id = %s AND m.content ILIKE %s 
                       ORDER BY m.created_at DESC LIMIT 10""",
                    (user_id, f"%{query}%")
                )
                for r in cur.fetchall():
                    results.append({
                        "id": r["id"],
                        "source": f"Emotional Support Message ({r['mood']})",
                        "title": "Emotional Support Session",
                        "content": r["content"],
                        "created_at": r["created_at"]
                    })

        except Exception:
            logger.exception("Error searching user memory")
            return []
        return results

    def record_consent(self, user_id: str, document: str, version: str, source: str = "register") -> None:
        """Record that a user accepted a legal document (terms/privacy) at a given version.

        Idempotent per user+document: later logins/OAuth exchanges don't stack rows.
        A new document version should be recorded as a fresh row (keeps the audit trail).
        """
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute(
                    """
                    INSERT INTO consents (user_id, document, version, source)
                    SELECT %s, %s, %s, %s
                    WHERE NOT EXISTS (
                        SELECT 1 FROM consents WHERE user_id = %s AND document = %s
                    )
                    """,
                    (user_id, document, version, source, user_id, document),
                )
        except Exception:
            logger.exception("Failed to record consent")

    def get_all_profiles(self) -> List[Dict[str, Any]]:
        """Get all profiles from the database"""
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT * FROM profiles")
                return [self.to_dict(r) for r in cur.fetchall()]
        except Exception:
            logger.exception("Error getting all profiles")
            return []

    def get_cached_tts(self, text_hash: str) -> Optional[bytes]:
        """Look up cached TTS bytes by text parameters hash"""
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                cur.execute("SELECT audio_data FROM tts_cache WHERE text_hash = %s", (text_hash,))
                row = cur.fetchone()
                if row:
                    data = row["audio_data"]
                    if isinstance(data, memoryview):
                        return data.tobytes()
                    return data
                return None
        except Exception:
            logger.exception("Error getting cached TTS")
            return None

    def save_cached_tts(self, text_hash: str, text: str, voice: str, response_format: str, audio_data: bytes) -> bool:
        """Store generated TTS bytes in database cache"""
        try:
            with self.get_connection() as conn:
                cur = self._cursor(conn)
                binary_data = psycopg2.Binary(audio_data) if "postgres" in settings.database_url else audio_data
                cur.execute(
                    "INSERT INTO tts_cache (text_hash, text, voice, response_format, audio_data) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (text_hash) DO NOTHING",
                    (text_hash, text, voice, response_format, binary_data),
                )
                return True
        except Exception:
            logger.exception("Error saving cached TTS")
            return False


db = Database()

