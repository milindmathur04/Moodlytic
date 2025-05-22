-- First drop existing policies
DROP POLICY IF EXISTS "groups_access_simple" ON groups;
DROP POLICY IF EXISTS "group_members_access_simple" ON group_members;

-- Create separate policies for groups
CREATE POLICY "groups_creator_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

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

-- Create separate policies for group members
CREATE POLICY "group_members_creator_access"
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

CREATE POLICY "group_members_self_access"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "group_members_self_update"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (email = auth.email() AND status = 'pending')
  WITH CHECK (status = 'active');

-- Optimize indices
DROP INDEX IF EXISTS idx_groups_creator_simple;
DROP INDEX IF EXISTS idx_members_lookup_simple;

CREATE INDEX idx_groups_creator_v2 ON groups(created_by);
CREATE INDEX idx_members_email_v2 ON group_members(email, status);
CREATE INDEX idx_members_group_v2 ON group_members(group_id);