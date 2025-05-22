-- Drop all existing policies
DROP POLICY IF EXISTS "groups_insert_final" ON groups;
DROP POLICY IF EXISTS "groups_select_final" ON groups;
DROP POLICY IF EXISTS "groups_update_final" ON groups;
DROP POLICY IF EXISTS "groups_delete_final" ON groups;
DROP POLICY IF EXISTS "group_members_insert_final" ON group_members;
DROP POLICY IF EXISTS "group_members_select_final" ON group_members;
DROP POLICY IF EXISTS "group_members_update_final" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_final" ON group_members;

-- Create a single policy for groups
CREATE POLICY "groups_policy"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = id 
      AND group_members.email = auth.email()
      AND group_members.status = 'active'
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create a single policy for group members
CREATE POLICY "group_members_policy"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
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

-- Recreate optimized indices
DROP INDEX IF EXISTS idx_groups_created_by_final;
DROP INDEX IF EXISTS idx_group_members_email_status_final;
DROP INDEX IF EXISTS idx_group_members_group_id_final;

CREATE INDEX idx_groups_policy ON groups(created_by);
CREATE INDEX idx_group_members_policy ON group_members(email, group_id, status);