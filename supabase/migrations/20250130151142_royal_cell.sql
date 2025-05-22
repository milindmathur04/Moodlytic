-- First drop existing policies
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_delete" ON groups;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

-- Drop existing indices
DROP INDEX IF EXISTS idx_groups_creator_v5;
DROP INDEX IF EXISTS idx_members_email_v5;
DROP INDEX IF EXISTS idx_members_group_v5;

-- Create new optimized indices
CREATE INDEX idx_groups_creator_v6 ON groups(created_by);
CREATE INDEX idx_members_email_v6 ON group_members(email);
CREATE INDEX idx_members_group_v6 ON group_members(group_id);
CREATE INDEX idx_members_status_v6 ON group_members(status) WHERE status = 'active';

-- Create simplified policy for groups
CREATE POLICY "groups_all_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid()
  )
  WITH CHECK (
    created_by = auth.uid()
  );

-- Create separate select policy for group members
CREATE POLICY "groups_member_access"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email() 
      AND status = 'active'
    )
  );

-- Create simplified policies for group members
CREATE POLICY "members_creator_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
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

CREATE POLICY "members_self_access"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email()
  );

CREATE POLICY "members_self_update"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.email() 
    AND status = 'pending'
  )
  WITH CHECK (
    email = auth.email() 
    AND status = 'active'
  );