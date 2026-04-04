-- Initial Schema for Faith AI Assistant
-- This migration creates all necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== Profiles Table ====================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferred_bible_version TEXT DEFAULT 'NIV',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true}',
    spiritual_journey_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== Bible Study Tables ====================

CREATE TABLE IF NOT EXISTS bible_study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verses INTEGER[] NOT NULL,
    selected_text TEXT NOT NULL,
    is_realtime BOOLEAN DEFAULT FALSE,
    ai_explanation TEXT,
    ai_context TEXT,
    conversation_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bible_study_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    session_id UUID NOT NULL REFERENCES bible_study_sessions (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== Emotional Support Tables ====================

CREATE TABLE IF NOT EXISTS emotional_support_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    situation_description TEXT,
    is_realtime BOOLEAN DEFAULT FALSE,
    ai_response TEXT,
    provided_scriptures JSONB,
    prayer_suggestion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emotional_support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    session_id UUID NOT NULL REFERENCES emotional_support_sessions (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== Devotion Tables ====================

CREATE TABLE IF NOT EXISTS devotion_settings (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_time TEXT NOT NULL,
    timezone TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    auto_prayer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    day_plan_summary TEXT,
    scripture_reading JSONB,
    reflection_prompt TEXT,
    user_reflection TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled',
            'completed',
            'skipped'
        )
    ),
    completed_at TIMESTAMPTZ,
    ai_prayer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== Bible Tables ====================

CREATE TABLE IF NOT EXISTS bible_verses (
    id SERIAL PRIMARY KEY,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    version TEXT DEFAULT 'NIV',
    UNIQUE (book, chapter, verse, version)
);

CREATE TABLE IF NOT EXISTS scripture_references (
    id SERIAL PRIMARY KEY,
    verse_id INTEGER NOT NULL REFERENCES bible_verses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    context_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== Favorites Table ====================

CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (
        item_type IN ('verse', 'prayer', 'devotion')
    ),
    item_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, item_type, item_id)
);

-- ==================== Journal Entries Table ====================

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT,
    related_scriptures JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== Triggers ====================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables that need it
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bible_study_sessions_updated_at BEFORE UPDATE ON bible_study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emotional_support_sessions_updated_at BEFORE UPDATE ON emotional_support_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devotion_settings_updated_at BEFORE UPDATE ON devotion_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== Indexes ====================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bible_study_sessions_user_id ON bible_study_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_bible_study_messages_session_id ON bible_study_messages (session_id);

CREATE INDEX IF NOT EXISTS idx_emotional_support_sessions_user_id ON emotional_support_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_emotional_support_messages_session_id ON emotional_support_messages (session_id);

CREATE INDEX IF NOT EXISTS idx_devotions_user_id ON devotions (user_id);

CREATE INDEX IF NOT EXISTS idx_devotions_scheduled_for ON devotions (scheduled_for);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites (user_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries (user_id);

CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter_verse ON bible_verses (book, chapter, verse);

CREATE INDEX IF NOT EXISTS idx_bible_verses_text ON bible_verses USING gin (to_tsvector ('english', text));

CREATE INDEX IF NOT EXISTS idx_scripture_references_verse_id ON scripture_references (verse_id);

CREATE INDEX IF NOT EXISTS idx_scripture_references_category ON scripture_references (category);

-- ==================== Row Level Security (RLS) ====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE bible_study_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE bible_study_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE emotional_support_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE emotional_support_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE devotion_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE devotions ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

-- RLS Policies for bible_study_sessions
CREATE POLICY "Users can view own bible study sessions" ON bible_study_sessions FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create own bible study sessions" ON bible_study_sessions FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own bible study sessions" ON bible_study_sessions FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own bible study sessions" ON bible_study_sessions FOR DELETE USING (auth.uid () = user_id);

-- RLS Policies for bible_study_messages
CREATE POLICY "Users can view messages from own sessions" ON bible_study_messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM bible_study_sessions
            WHERE
                bible_study_sessions.id = bible_study_messages.session_id
                AND bible_study_sessions.user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can create messages in own sessions" ON bible_study_messages FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM bible_study_sessions
            WHERE
                bible_study_sessions.id = bible_study_messages.session_id
                AND bible_study_sessions.user_id = auth.uid ()
        )
    );

-- RLS Policies for emotional_support_sessions
CREATE POLICY "Users can view own emotional support sessions" ON emotional_support_sessions FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create own emotional support sessions" ON emotional_support_sessions FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own emotional support sessions" ON emotional_support_sessions FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own emotional support sessions" ON emotional_support_sessions FOR DELETE USING (auth.uid () = user_id);

-- RLS Policies for emotional_support_messages
CREATE POLICY "Users can view messages from own sessions" ON emotional_support_messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM emotional_support_sessions
            WHERE
                emotional_support_sessions.id = emotional_support_messages.session_id
                AND emotional_support_sessions.user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can create messages in own sessions" ON emotional_support_messages FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM emotional_support_sessions
            WHERE
                emotional_support_sessions.id = emotional_support_messages.session_id
                AND emotional_support_sessions.user_id = auth.uid ()
        )
    );

-- RLS Policies for devotion_settings
CREATE POLICY "Users can view own devotion settings" ON devotion_settings FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create own devotion settings" ON devotion_settings FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own devotion settings" ON devotion_settings FOR
UPDATE USING (auth.uid () = user_id);

-- RLS Policies for devotions
CREATE POLICY "Users can view own devotions" ON devotions FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create own devotions" ON devotions FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own devotions" ON devotions FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own devotions" ON devotions FOR DELETE USING (auth.uid () = user_id);

-- RLS Policies for user_favorites
CREATE POLICY "Users can view own favorites" ON user_favorites FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create own favorites" ON user_favorites FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites FOR DELETE USING (auth.uid () = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view own journal entries" ON journal_entries FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create own journal entries" ON journal_entries FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE USING (auth.uid () = user_id);

-- Public access for bible_verses and scripture_references (read-only)
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;

ALTER TABLE scripture_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view bible verses" ON bible_verses FOR
SELECT USING (true);

CREATE POLICY "Public can view scripture references" ON scripture_references FOR
SELECT USING (true);