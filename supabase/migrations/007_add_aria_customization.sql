-- Add Aria Customization columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aria_custom_prompt TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aria_personal_context TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aria_voice TEXT DEFAULT 'sage';
