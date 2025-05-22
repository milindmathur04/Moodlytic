-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_email_confirmation ON auth.users;
DROP FUNCTION IF EXISTS auth.handle_email_confirmation();

-- Modify user_profiles table to allow null values for optional fields
ALTER TABLE user_profiles
ALTER COLUMN email_verified SET DEFAULT false,
ALTER COLUMN email_verified DROP NOT NULL;

-- Create improved email confirmation handler
CREATE OR REPLACE FUNCTION auth.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if email is being confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Update user_profiles, handling case where profile might not exist
    INSERT INTO public.user_profiles (id, email, email_verified)
    VALUES (
      NEW.id,
      NEW.email,
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET email_verified = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate email confirmation trigger
CREATE TRIGGER on_email_confirmation
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION auth.handle_email_confirmation();

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

-- Create new simplified policies
CREATE POLICY "users_manage_own_profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy to allow profile creation during signup
CREATE POLICY "allow_profile_creation"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);