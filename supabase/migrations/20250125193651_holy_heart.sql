/*
  # Fix Group Policies V3

  1. Changes
    - Drop all existing policies
    - Recreate policies with v3 suffix
    - Maintain same security model
    
  2. Security
    - Preserve access control
    - Ensure proper user isolation
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "groups_delete_policy" ON groups;
DROP POLICY IF EXISTS "group_members_insert_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_select_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_update_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON group_members;
DROP POLICY IF EXISTS "groups_insert_policy_v2" ON groups;
DROP POLICY IF EXISTS "groups_select_policy_v2" ON groups;
DROP POLICY IF EXISTS "groups_update_policy_v2" ON groups;
DROP POLICY IF EXISTS "groups_delete_policy_v2" ON groups;
DROP POLICY IF EXISTS "group_members_insert_policy_v2" ON group_members;
DROP POLICY IF EXISTS "group_members_select_policy_v2" ON group_members;
DROP POLICY IF EXISTS "group_members_update_policy_v2" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy_v2" ON group_members;

-- Create new group policies with v3 suffix
CREATE POLICY "groups_insert_policy_v3"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_select_policy_v3"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email() AND status = 'active'
    )
  );

CREATE POLICY "groups_update_policy_v3"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_delete_policy_v3"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create new group members policies with v3 suffix
CREATE POLICY "group_members_insert_policy_v3"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_select_policy_v3"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update_policy_v3"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete_policy_v3"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

-- Drop and recreate indices
DROP INDEX IF EXISTS idx_group_members_email_status;
DROP INDEX IF EXISTS idx_groups_created_by;

CREATE INDEX idx_group_members_email_status ON group_members(email, status);
CREATE INDEX idx_groups_created_by ON groups(created_by);