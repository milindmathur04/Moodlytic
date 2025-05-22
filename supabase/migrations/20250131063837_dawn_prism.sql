-- First drop existing policies
DROP POLICY IF EXISTS "groups_access" ON groups;
DROP POLICY IF EXISTS "group_members_access" ON group_members;

-- Drop existing indices
DROP INDEX IF EXISTS idx_groups_creator;
DROP INDEX IF EXISTS idx_members_email_status;
DROP INDEX IF EXISTS idx_members_group_id;

-- Create non-recursive policy for groups
CREATE POLICY "groups_select"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email() 
      AND status = 'active'
    )
  );

CREATE POLICY "groups_insert"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_update"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "groups_delete"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create non-recursive policy for group members
CREATE POLICY "group_members_select"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_insert"
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

CREATE POLICY "group_members_update"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    (email = auth.email() AND status = 'pending') OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete"
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

-- Create optimized indices
CREATE INDEX idx_groups_creator_new ON groups(created_by);
CREATE INDEX idx_members_email_new ON group_members(email, status);
CREATE INDEX idx_members_group_new ON group_members(group_id);