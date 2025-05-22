-- Drop existing policies
DROP POLICY IF EXISTS "Groups access policy" ON groups;
DROP POLICY IF EXISTS "Group members access policy" ON group_members;

-- Create separate policies for different operations on groups
CREATE POLICY "Groups insert policy"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Groups select policy"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = (
        SELECT email 
        FROM user_profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Groups update policy"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Groups delete policy"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create separate policies for different operations on group members
CREATE POLICY "Group members insert policy"
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

CREATE POLICY "Group members select policy"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND (
        created_by = auth.uid() OR
        id IN (
          SELECT group_id 
          FROM group_members 
          WHERE email = (
            SELECT email 
            FROM user_profiles 
            WHERE id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Group members update policy"
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

CREATE POLICY "Group members delete policy"
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