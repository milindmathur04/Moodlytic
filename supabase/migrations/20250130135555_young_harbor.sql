-- First drop ALL existing policies
DO $$ 
BEGIN
  -- Drop policies on groups table
  DROP POLICY IF EXISTS "groups_select" ON groups;
  DROP POLICY IF EXISTS "groups_insert" ON groups;
  DROP POLICY IF EXISTS "groups_update" ON groups;
  DROP POLICY IF EXISTS "groups_delete" ON groups;
  DROP POLICY IF EXISTS "groups_policy" ON groups;
  DROP POLICY IF EXISTS "groups_policy_new" ON groups;
  DROP POLICY IF EXISTS "groups_access" ON groups;
  
  -- Drop policies on group_members table
  DROP POLICY IF EXISTS "group_members_select" ON group_members;
  DROP POLICY IF EXISTS "group_members_insert" ON group_members;
  DROP POLICY IF EXISTS "group_members_update" ON group_members;
  DROP POLICY IF EXISTS "group_members_delete" ON group_members;
  DROP POLICY IF EXISTS "group_members_policy" ON group_members;
  DROP POLICY IF EXISTS "group_members_policy_new" ON group_members;
  DROP POLICY IF EXISTS "group_members_access" ON group_members;
END $$;

-- Create new policies with unique names for groups
CREATE POLICY "groups_select_v2"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "groups_insert_v2"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_update_v2"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_delete_v2"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create new policies with unique names for group members
CREATE POLICY "group_members_select_v2"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_insert_v2"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update_v2"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete_v2"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

-- Recreate optimized indices
DROP INDEX IF EXISTS idx_group_members_user_id_status;
DROP INDEX IF EXISTS idx_group_members_email_user_id;
DROP INDEX IF EXISTS idx_groups_created_by;

CREATE INDEX idx_group_members_user_id_status ON group_members(user_id, status);
CREATE INDEX idx_groups_created_by ON groups(created_by);