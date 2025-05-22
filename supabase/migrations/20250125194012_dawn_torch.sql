/*
  # Fix Group Policies V4
  
  1. Changes
    - Simplify policy logic
    - Fix syntax issues in policy conditions
    - Ensure proper email comparison
    
  2. Security
    - Maintain same security model
    - Fix policy parsing errors
*/

-- Drop existing v3 policies
DROP POLICY IF EXISTS "groups_insert_policy_v3" ON groups;
DROP POLICY IF EXISTS "groups_select_policy_v3" ON groups;
DROP POLICY IF EXISTS "groups_update_policy_v3" ON groups;
DROP POLICY IF EXISTS "groups_delete_policy_v3" ON groups;
DROP POLICY IF EXISTS "group_members_insert_policy_v3" ON group_members;
DROP POLICY IF EXISTS "group_members_select_policy_v3" ON group_members;
DROP POLICY IF EXISTS "group_members_update_policy_v3" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy_v3" ON group_members;

-- Create simplified group policies
CREATE POLICY "groups_insert_v4"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_select_v4"
  ON groups
  FOR SELECT
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
  );

CREATE POLICY "groups_update_v4"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "groups_delete_v4"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create simplified group members policies
CREATE POLICY "group_members_insert_v4"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_select_v4"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update_v4"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete_v4"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Ensure indices exist
CREATE INDEX IF NOT EXISTS idx_group_members_email_status_v4 ON group_members(email, status);
CREATE INDEX IF NOT EXISTS idx_groups_created_by_v4 ON groups(created_by);