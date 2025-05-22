-- Enable email confirmations
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recovery_token TEXT;

-- Create email templates
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  authentication_method TEXT NOT NULL,
  provider TEXT NOT NULL,
  CONSTRAINT amr_claims_pkey PRIMARY KEY (id)
);

-- Create function to handle email confirmations
CREATE OR REPLACE FUNCTION auth.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Update user_profiles when email is confirmed
    UPDATE auth.users 
    SET raw_app_meta_data = 
      raw_app_meta_data || 
      jsonb_build_object('email_confirmed', true)
    WHERE id = NEW.id;
    
    -- Update profile email_verified status
    UPDATE user_profiles
    SET email_verified = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_email_confirmation ON auth.users;
CREATE TRIGGER on_email_confirmation
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION auth.handle_email_confirmation();