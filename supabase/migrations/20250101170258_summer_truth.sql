/*
  # Enhance user profiles table

  1. New Columns
    - `given_name` (text): User's first name from Google
    - `family_name` (text): User's last name from Google
    - `locale` (text): User's preferred locale from Google
    - `email_verified` (boolean): Email verification status
    - `timezone` (text): User's timezone
    - `last_login` (timestamptz): Last login timestamp

  2. Security
    - Maintain existing RLS policies
    - Add index on email for faster lookups
*/

-- Add new columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS given_name text,
ADD COLUMN IF NOT EXISTS family_name text,
ADD COLUMN IF NOT EXISTS locale text,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update the updated_at timestamp when last_login is updated
CREATE OR REPLACE FUNCTION update_last_login_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_login
  BEFORE UPDATE OF last_login ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login_timestamp();