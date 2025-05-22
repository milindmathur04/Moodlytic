-- Add invitation tracking columns
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS invited_by_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invitation_metadata jsonb DEFAULT jsonb_build_object(
  'invited_at', CURRENT_TIMESTAMP,
  'platform', 'web'
);

-- Create function to handle member status changes
CREATE OR REPLACE FUNCTION handle_member_status()
RETURNS TRIGGER AS $$
BEGIN
  -- For new invitations
  IF TG_OP = 'INSERT' THEN
    NEW.invited_by_user_id = auth.uid();
    NEW.invitation_sent_at = CURRENT_TIMESTAMP;
    NEW.invitation_expires_at = CURRENT_TIMESTAMP + interval '7 days';
    NEW.invitation_metadata = NEW.invitation_metadata || jsonb_build_object(
      'invited_by', auth.uid(),
      'invited_at', CURRENT_TIMESTAMP
    );
  END IF;

  -- For status updates
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    -- Only allow pending to active transition
    IF NEW.status = 'active' AND OLD.status != 'pending' THEN
      RAISE EXCEPTION 'Invalid status transition';
    END IF;

    -- Only allow the invited user to accept their own invitation
    IF NEW.status = 'active' AND OLD.status = 'pending' AND 
       auth.email() != OLD.email THEN
      RAISE EXCEPTION 'Only the invited user can accept invitations';
    END IF;

    -- Update metadata for accepted invitations
    IF NEW.status = 'active' AND OLD.status = 'pending' THEN
      NEW.invitation_metadata = NEW.invitation_metadata || jsonb_build_object(
        'accepted_at', CURRENT_TIMESTAMP,
        'accepted_by', auth.uid()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member status changes
DROP TRIGGER IF EXISTS member_status_trigger ON group_members;
CREATE TRIGGER member_status_trigger
  BEFORE INSERT OR UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_member_status();

-- Create materialized view for pending invitations
DROP MATERIALIZED VIEW IF EXISTS pending_invitations;
CREATE MATERIALIZED VIEW pending_invitations AS
SELECT 
  gm.id as invitation_id,
  gm.email,
  gm.status,
  gm.created_at as invited_at,
  gm.invitation_expires_at,
  g.id as group_id,
  g.name as group_name,
  (
    SELECT count(*)::int 
    FROM group_members 
    WHERE group_id = g.id 
    AND status = 'active'
  ) as member_count,
  (
    SELECT json_agg(json_build_object(
      'email', m.email,
      'status', m.status
    ))
    FROM (
      SELECT email, status
      FROM group_members
      WHERE group_id = g.id
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 5
    ) m
  ) as recent_members,
  (
    SELECT up.email 
    FROM user_profiles up 
    WHERE up.id = g.created_by
  ) as invited_by
FROM group_members gm
JOIN groups g ON g.id = gm.group_id
WHERE gm.status = 'pending';

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_pending_invitations()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY pending_invitations;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to refresh view
DROP TRIGGER IF EXISTS refresh_pending_invitations_trigger ON group_members;
CREATE TRIGGER refresh_pending_invitations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON group_members
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_pending_invitations();

-- Initial refresh of the materialized view
REFRESH MATERIALIZED VIEW pending_invitations;