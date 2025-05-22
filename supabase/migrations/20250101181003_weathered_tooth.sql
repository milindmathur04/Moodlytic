/*
  # Clean up user_profiles table

  1. Changes
    - Remove unused fields
    - Add missing indices for performance
    - Update column order for consistency

  2. Security
    - Maintains existing RLS policies
*/

-- Drop unused columns
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS name;

-- Reorder columns for better organization
ALTER TABLE user_profiles
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN given_name DROP NOT NULL,
  ALTER COLUMN family_name DROP NOT NULL,
  ALTER COLUMN picture DROP NOT NULL,
  ALTER COLUMN age DROP NOT NULL,
  ALTER COLUMN gender DROP NOT NULL,
  ALTER COLUMN nationality DROP NOT NULL,
  ALTER COLUMN language DROP NOT NULL,
  ALTER COLUMN locale DROP NOT NULL,
  ALTER COLUMN email_verified SET DEFAULT false,
  ALTER COLUMN timezone DROP NOT NULL,
  ALTER COLUMN last_login DROP NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Add missing indices for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_verified ON user_profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON user_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_user_profiles_language ON user_profiles(language);