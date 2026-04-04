-- Run this SQL in your Supabase SQL Editor to fix RLS policies

-- Create insert policy if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Drop and recreate select/update policies
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;

CREATE POLICY "Users can select own profile" ON profiles FOR
SELECT TO authenticated USING (auth.uid () = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE TO authenticated USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);