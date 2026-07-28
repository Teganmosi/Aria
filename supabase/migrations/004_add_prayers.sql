-- Create prayers table for storing user prayers
-- This table is used by the backend prayer endpoints

CREATE TABLE IF NOT EXISTS prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers (user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers (created_at DESC);

-- Enable RLS
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only manage their own prayers
CREATE POLICY "Users can view own prayers" ON prayers FOR
    SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prayers" ON prayers FOR
    INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers" ON prayers FOR
    DELETE USING (auth.uid() = user_id);
