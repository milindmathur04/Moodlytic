-- First drop ALL existing policies
DO $$ 
BEGIN
  -- Drop policies on groups table
  DROP POLICY IF EXISTS "groups_select_v2" ON groups;
  DROP POLICY IF EXISTS "groups_insert_v2" ON groups;
  DROP POLICY IF EXISTS "groups_update_v2" ON groups;
  DROP POLICY IF EXISTS "groups_delete_v2" ON groups;
  
  -- Drop policies on group_members table
  DROP POLICY IF EXISTS "group_members_select_v2" ON group_members;
  DROP POLICY IF EXISTS "group_members_insert_v2" ON group_members;
  DROP POLICY IF EXISTS "group_members_update_v2" ON group_members;
  DROP POLICY IF EXISTS "group_members_delete_v2" ON group_members;
END $$;

-- Create simplified policy for groups
CREATE POLICY "groups_access_v3"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT DISTINCT group_id 
      FROM group_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create simplified policy for group members
CREATE POLICY "group_members_access_v3"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    -- User can access if they are a member or the group creator
    user_id = auth.uid() OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    -- Only group creator can modify members
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

-- Optimize indices for the new policies
DROP INDEX IF EXISTS idx_group_members_user_id_status;
DROP INDEX IF EXISTS idx_groups_created_by;

CREATE INDEX idx_group_members_user_id_status_v3 ON group_members(user_id, status);
CREATE INDEX idx_groups_created_by_v3 ON groups(created_by);