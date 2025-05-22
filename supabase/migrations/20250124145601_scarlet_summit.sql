-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can view groups they created or are members of" ON groups;

-- Create new optimized policies
CREATE POLICY "Users can view groups they created or are members of"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid() 
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Users can view members of their groups"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_members.group_id
      AND (
        groups.created_by = auth.uid() OR
        EXISTS (
          SELECT 1
          FROM group_members gm
          WHERE gm.group_id = group_members.group_id
          AND gm.user_id = auth.uid()
          AND gm.status = 'active'
        )
      )
    )
  );