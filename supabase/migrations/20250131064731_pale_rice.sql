-- Update group_members table to track who sent the invitation
ALTER TABLE group_members 
ADD COLUMN IF NOT EXISTS invited_by_user_id uuid REFERENCES auth.users(id);

-- Create materialized view for pending invitations with group details
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
    FROM group_members m
    WHERE m.group_id = g.id
    AND m.status = 'active'
    LIMIT 5
  ) as recent_members,
  (
    SELECT up.email 
    FROM user_profiles up 
    WHERE up.id = g.created_by
  ) as invited_by
FROM group_members gm
JOIN groups g ON g.id = gm.group_id
WHERE gm.status = 'pending';

-- Create index to optimize the view performance
CREATE INDEX IF NOT EXISTS idx_group_members_pending 
  ON group_members(email, status) 
  WHERE status = 'pending';

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_pending_invitations()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY pending_invitations;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh view
CREATE TRIGGER refresh_pending_invitations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON group_members
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_pending_invitations();

-- Update the handle_member_status function to include invited_by_user_id
CREATE OR REPLACE FUNCTION handle_member_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Set invited_by_user_id on insert
    NEW.invited_by_user_id = auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only allow pending members to become active
    IF NEW.status = 'active' AND OLD.status != 'pending' THEN
      RAISE EXCEPTION 'Invalid status transition';
    END IF;

    -- Only allow the member themselves to accept invitations
    IF NEW.status = 'active' AND OLD.status = 'pending' AND 
       auth.email() != OLD.email THEN
      RAISE EXCEPTION 'Only the invited user can accept invitations';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member status
DROP TRIGGER IF EXISTS member_status_trigger ON group_members;
CREATE TRIGGER member_status_trigger
  BEFORE INSERT OR UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_member_status();