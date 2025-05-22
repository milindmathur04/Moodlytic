-- First drop ALL existing policies
DO $$ 
BEGIN
  -- Drop policies on groups table
  DROP POLICY IF EXISTS "groups_access_v3" ON groups;
  DROP POLICY IF EXISTS "groups_policy_new" ON groups;
  DROP POLICY IF EXISTS "groups_select" ON groups;
  DROP POLICY IF EXISTS "groups_insert" ON groups;
  DROP POLICY IF EXISTS "groups_update" ON groups;
  DROP POLICY IF EXISTS "groups_delete" ON groups;
  
  -- Drop policies on group_members table
  DROP POLICY IF EXISTS "group_members_access_v3" ON group_members;
  DROP POLICY IF EXISTS "group_members_policy_new" ON group_members;
  DROP POLICY IF EXISTS "group_members_select" ON group_members;
  DROP POLICY IF EXISTS "group_members_insert" ON group_members;
  DROP POLICY IF EXISTS "group_members_update" ON group_members;
  DROP POLICY IF EXISTS "group_members_delete" ON group_members;
END $$;

-- Create materialized view for active group memberships
CREATE MATERIALIZED VIEW IF NOT EXISTS active_group_memberships AS
SELECT DISTINCT group_id, user_id
FROM group_members
WHERE status = 'active';

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_memberships 
ON active_group_memberships(group_id, user_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_active_memberships()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY active_group_memberships;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh view
DROP TRIGGER IF EXISTS refresh_active_memberships_trigger ON group_members;
CREATE TRIGGER refresh_active_memberships_trigger
AFTER INSERT OR UPDATE OR DELETE ON group_members
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_active_memberships();

-- Create simplified policy for groups
CREATE POLICY "groups_final"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM active_group_memberships 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create simplified policy for group members
CREATE POLICY "group_members_final"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    email = auth.email() OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

-- Optimize indices
DROP INDEX IF EXISTS idx_group_members_user_id_status_v3;
DROP INDEX IF EXISTS idx_groups_created_by_v3;

CREATE INDEX idx_groups_creator ON groups(created_by);
CREATE INDEX idx_members_user ON group_members(user_id) WHERE status = 'active';
CREATE INDEX idx_members_email ON group_members(email);

-- Refresh the materialized view initially
REFRESH MATERIALIZED VIEW active_group_memberships;