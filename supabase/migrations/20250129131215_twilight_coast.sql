-- Create email templates table in public schema
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  template text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for email templates
CREATE POLICY "Enable read access for authenticated users"
  ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default templates
INSERT INTO public.email_templates (name, subject, template)
VALUES 
  ('signup', 'Welcome to Moodlytic - Verify Your Email',
   '<h2>Welcome to Moodlytic!</h2>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
    <p>If you did not sign up for Moodlytic, you can safely ignore this email.</p>'),
  ('invite', 'Invitation to join Moodlytic',
   '<h2>You''ve been invited to join Moodlytic!</h2>
    <p>Please click the link below to accept your invitation:</p>
    <p><a href="{{ .ConfirmationURL }}">Accept Invitation</a></p>
    <p>If you did not expect this invitation, you can safely ignore this email.</p>');