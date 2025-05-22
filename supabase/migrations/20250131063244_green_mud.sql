-- First drop all existing policies
DROP POLICY IF EXISTS "groups_creator_access" ON groups;
DROP POLICY IF EXISTS "groups_member_access" ON groups;
DROP POLICY IF EXISTS "group_members_creator_access" ON group_members;
DROP POLICY IF EXISTS "group_members_self_access" ON group_members;
DROP POLICY IF EXISTS "group_members_self_update" ON group_members;

-- Drop indices
DROP INDEX IF EXISTS idx_groups_creator_v2;
DROP INDEX IF EXISTS idx_members_email_v2;
DROP INDEX IF EXISTS idx_members_group_v2;

-- Create simple working policies
CREATE POLICY "groups_access"
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

CREATE POLICY "group_members_access"
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

-- Create optimized indices
CREATE INDEX idx_groups_creator ON groups(created_by);
CREATE INDEX idx_members_email_status ON group_members(email, status);
CREATE INDEX idx_members_group_id ON group_members(group_id);