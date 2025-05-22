-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can view groups they created or are members of" ON groups;

-- Create simplified policies
CREATE POLICY "Users can view their groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid() OR email = auth.email()
    )
  );

CREATE POLICY "Users can view group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid() OR
      id IN (
        SELECT group_id 
        FROM group_members 
        WHERE user_id = auth.uid() OR email = auth.email()
      )
    )
  );