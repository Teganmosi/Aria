import sqlite3
import os
import uuid
from datetime import datetime

DB_NAME = "aria.db"

def init_db():
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
        print(f"🗑️ Previous database {DB_NAME} removed.")

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Users table (to replace Supabase auth.users)
    cursor.execute("""
    CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        hashed_password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Profiles Table
    cursor.execute("""
    CREATE TABLE profiles (
        id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        preferred_bible_version TEXT DEFAULT 'NIV',
        notification_preferences TEXT DEFAULT '{"email": true, "push": true}',
        spiritual_journey_notes TEXT,
        aria_custom_prompt TEXT,
        aria_personal_context TEXT,
        aria_voice TEXT DEFAULT 'verse',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Bible Study Sessions
    cursor.execute("""
    CREATE TABLE bible_study_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verses TEXT NOT NULL, -- Stored as comma-separated: '1,2,3'
        selected_text TEXT NOT NULL,
        is_realtime BOOLEAN DEFAULT 0,
        ai_explanation TEXT,
        ai_context TEXT,
        conversation_summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Bible Study Messages
    cursor.execute("""
    CREATE TABLE bible_study_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES bible_study_sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. Emotional Support Sessions
    cursor.execute("""
    CREATE TABLE emotional_support_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        mood TEXT NOT NULL,
        situation_description TEXT,
        is_realtime BOOLEAN DEFAULT 0,
        ai_response TEXT,
        provided_scriptures TEXT, -- JSON string
        prayer_suggestion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. Emotional Support Messages
    cursor.execute("""
    CREATE TABLE emotional_support_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES emotional_support_sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Devotion Settings
    cursor.execute("""
    CREATE TABLE devotion_settings (
        user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
        preferred_time TEXT NOT NULL,
        timezone TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 15,
        topics TEXT DEFAULT '[]', -- JSON string of topics
        auto_prayer BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 8. Devotions
    cursor.execute("""
    CREATE TABLE devotions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        scheduled_for DATETIME NOT NULL,
        day_plan_summary TEXT,
        scripture_reading TEXT, -- JSON string
        reflection_prompt TEXT,
        user_reflection TEXT,
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped')),
        completed_at DATETIME,
        ai_prayer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 9. Bible Verses
    cursor.execute("""
    CREATE TABLE bible_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        version TEXT DEFAULT 'NIV',
        UNIQUE (book, chapter, verse, version)
    );
    """)

    # 10. Scripture References
    cursor.execute("""
    CREATE TABLE scripture_references (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER NOT NULL REFERENCES bible_verses(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        tags TEXT NOT NULL, -- JSON string
        context_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 11. User Favorites
    cursor.execute("""
    CREATE TABLE user_favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL CHECK (item_type IN ('verse', 'prayer', 'devotion')),
        item_id TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, item_type, item_id)
    );
    """)

    # 12. Journal Entries
    cursor.execute("""
    CREATE TABLE journal_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT,
        content TEXT NOT NULL,
        mood TEXT,
        related_scriptures TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 13. Cached Verses
    cursor.execute("""
    CREATE TABLE cached_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        verse_text TEXT NOT NULL,
        verse_reference TEXT NOT NULL,
        cached_date TEXT NOT NULL
    );
    """)

    # 14. Notes
    cursor.execute("""
    CREATE TABLE notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT,
        content TEXT NOT NULL,
        source_type TEXT DEFAULT 'general',
        source_reference TEXT,
        tags TEXT DEFAULT '[]', -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Create Indexes
    cursor.execute("CREATE INDEX idx_bible_study_sessions_user_id ON bible_study_sessions (user_id);")
    cursor.execute("CREATE INDEX idx_bible_study_messages_session_id ON bible_study_messages (session_id);")
    cursor.execute("CREATE INDEX idx_emotional_support_sessions_user_id ON emotional_support_sessions (user_id);")
    cursor.execute("CREATE INDEX idx_devotions_user_id ON devotions (user_id);")

    # 15. AI Chat Sessions
    cursor.execute("""
    CREATE TABLE ai_chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 16. AI Chat Messages
    cursor.execute("""
    CREATE TABLE ai_chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print(f"✅ Database {DB_NAME} initialized with tables and migration ready.")

if __name__ == "__main__":
    init_db()
