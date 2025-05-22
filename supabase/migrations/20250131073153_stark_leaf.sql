-- First drop existing policies
DROP POLICY IF EXISTS "groups_access_simple" ON groups;
DROP POLICY IF EXISTS "group_members_access_simple" ON group_members;

-- Create policy for groups
CREATE POLICY "groups_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email()
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create separate policies for group members
CREATE POLICY "group_members_select"
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

CREATE POLICY "group_members_insert"
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

CREATE POLICY "group_members_update_owner"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update_self"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.email() AND
    status = 'pending'
  )
  WITH CHECK (
    email = auth.email() AND
    status = 'active'
  );

CREATE POLICY "group_members_delete"
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

-- Create optimized indices
DROP INDEX IF EXISTS idx_groups_creator_simple;
DROP INDEX IF EXISTS idx_members_lookup_simple;

CREATE INDEX idx_groups_creator_final ON groups(created_by);
CREATE INDEX idx_members_lookup_final ON group_members(group_id, email, status);