-- First drop policies that depend on materialized view
DROP POLICY IF EXISTS "groups_final" ON groups;
DROP POLICY IF EXISTS "group_members_final" ON group_members;

-- Now we can safely drop materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS active_group_memberships;
DROP TRIGGER IF EXISTS refresh_active_memberships_trigger ON group_members;
DROP FUNCTION IF EXISTS refresh_active_memberships();

-- Create simplified policy for groups
CREATE POLICY "groups_access_simple"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.email = auth.email()
      AND group_members.status = 'active'
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create simplified policy for group members
CREATE POLICY "group_members_access_simple"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Optimize indices
DROP INDEX IF EXISTS idx_groups_creator;
DROP INDEX IF EXISTS idx_members_user;
DROP INDEX IF EXISTS idx_members_email;

CREATE INDEX idx_groups_creator_simple ON groups(created_by);
CREATE INDEX idx_members_email_simple ON group_members(email, status);
CREATE INDEX idx_members_group_simple ON group_members(group_id);