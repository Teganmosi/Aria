-- Create cached_verses table for storing daily personalized verses
-- This helps improve home page load time by caching AI-generated verses

CREATE TABLE IF NOT EXISTS cached_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL,
    cached_date DATE NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (user_id, cached_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cached_verses_user_date ON cached_verses (user_id, cached_date);

-- Enable RLS
ALTER TABLE cached_verses ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see their own cached verses
CREATE POLICY "Users can manage own cached verses" ON cached_verses FOR ALL USING (auth.uid () = user_id);