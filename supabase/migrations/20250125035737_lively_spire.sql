-- Drop existing policies
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_delete" ON groups;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

-- Create single policy for groups
CREATE POLICY "groups_policy"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.email = auth.email()
      AND group_members.status = 'active'
    )
  )
  WITH CHECK (auth.uid() = created_by);

-- Create single policy for group members
CREATE POLICY "group_members_policy"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_members.group_id 
      AND (
        groups.created_by = auth.uid() OR
        (group_members.email = auth.email() AND group_members.status = 'active')
      )
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