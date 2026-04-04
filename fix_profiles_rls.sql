-- Fix RLS policies for profiles table
-- Run this in your Supabase SQL Editor

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = id);

-- Allow authenticated users to update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE TO authenticated USING (auth.uid () = id);

-- Allow authenticated users to read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles FOR
SELECT TO authenticated USING (auth.uid () = id);