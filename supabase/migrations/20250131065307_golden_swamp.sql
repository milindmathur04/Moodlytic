-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS refresh_pending_invitations_trigger ON group_members;
DROP FUNCTION IF EXISTS refresh_pending_invitations();
DROP MATERIALIZED VIEW IF EXISTS pending_invitations;

-- Create materialized view for pending invitations
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

-- Create index to optimize the view performance
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email 
  ON pending_invitations(email);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_pending_invitations()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY pending_invitations;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to refresh view
CREATE TRIGGER refresh_pending_invitations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON group_members
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_pending_invitations();

-- Initial refresh of the materialized view
REFRESH MATERIALIZED VIEW pending_invitations;