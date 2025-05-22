/*
  # Add Email Invitation Support for Groups

  1. Changes
    - Add invitation_sent_at timestamp to track when invites were sent
    - Add invitation_expires_at timestamp for invite expiration
    - Add invitation_metadata jsonb for additional invite data
    - Add function to handle invitation status updates
    - Add function to clean up expired invitations

  2. Security
    - Maintain existing RLS policies
    - Add check constraints for invitation dates
*/

-- Add invitation fields to group_members
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS invitation_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS invitation_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS invitation_metadata jsonb,
ADD CONSTRAINT invitation_dates_check 
  CHECK (invitation_expires_at IS NULL OR invitation_expires_at > invitation_sent_at);

-- Create function to handle invitation status
CREATE OR REPLACE FUNCTION handle_group_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- Set invitation timestamps for new pending invitations
  IF NEW.status = 'pending' AND OLD IS NULL THEN
    NEW.invitation_sent_at = CURRENT_TIMESTAMP;
    NEW.invitation_expires_at = CURRENT_TIMESTAMP + INTERVAL '7 days';
    NEW.invitation_metadata = jsonb_build_object(
      'invited_by', auth.uid(),
      'invited_at', CURRENT_TIMESTAMP
    );
  END IF;

  -- Clear invitation data when status becomes active
  IF NEW.status = 'active' AND OLD.status = 'pending' THEN
    NEW.invitation_token = NULL;
    NEW.invitation_expires_at = NULL;
    NEW.invitation_metadata = NEW.invitation_metadata || 
      jsonb_build_object(
        'activated_at', CURRENT_TIMESTAMP,
        'activation_method', 'user_accepted'
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invitation handling
DROP TRIGGER IF EXISTS handle_group_invitation_trigger ON group_members;
CREATE TRIGGER handle_group_invitation_trigger
  BEFORE INSERT OR UPDATE OF status ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_group_invitation();

-- Create function to clean expired invitations
CREATE OR REPLACE FUNCTION clean_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE group_members
  SET invitation_token = NULL,
      invitation_metadata = invitation_metadata || 
        jsonb_build_object(
          'expired_at', CURRENT_TIMESTAMP,
          'status', 'expired'
        )
  WHERE status = 'pending'
    AND invitation_expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indices for invitation queries
CREATE INDEX IF NOT EXISTS idx_group_members_invitation_status 
  ON group_members(status, invitation_expires_at) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_group_members_invitation_token 
  ON group_members(invitation_token) 
  WHERE invitation_token IS NOT NULL;

COMMENT ON FUNCTION handle_group_invitation() IS 
  'Handles group invitation lifecycle including setting expiration and tracking metadata';

COMMENT ON FUNCTION clean_expired_invitations() IS 
  'Cleans up expired group invitations by nullifying tokens and updating metadata';