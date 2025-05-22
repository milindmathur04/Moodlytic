-- Drop existing policies
DROP POLICY IF EXISTS "groups_select_v3" ON groups;
DROP POLICY IF EXISTS "groups_insert_v3" ON groups;
DROP POLICY IF EXISTS "groups_update_v3" ON groups;
DROP POLICY IF EXISTS "groups_delete_v3" ON groups;
DROP POLICY IF EXISTS "group_members_select_v3" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_v3" ON group_members;
DROP POLICY IF EXISTS "group_members_update_v3" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_v3" ON group_members;

-- Create base view for group access
CREATE VIEW group_access AS
SELECT DISTINCT g.id
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
WHERE g.created_by = auth.uid()
   OR (gm.email = auth.email() AND gm.status = 'active');

-- Create simplified policies for groups
CREATE POLICY "groups_select_final"
  ON groups
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT id FROM group_access));

CREATE POLICY "groups_insert_final"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_update_final"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_delete_final"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create simplified policies for group members
CREATE POLICY "group_members_select_final"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

CREATE POLICY "group_members_insert_final"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

CREATE POLICY "group_members_update_final"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.email() OR
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  )
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

CREATE POLICY "group_members_delete_final"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- Optimize indices
DROP INDEX IF EXISTS idx_groups_creator_v3;
DROP INDEX IF EXISTS idx_members_email_status_v3;
DROP INDEX IF EXISTS idx_members_group_creator_v3;

CREATE INDEX idx_groups_creator_final ON groups(created_by);
CREATE INDEX idx_members_email_status_final ON group_members(email, status);
CREATE INDEX idx_members_group_final ON group_members(group_id);