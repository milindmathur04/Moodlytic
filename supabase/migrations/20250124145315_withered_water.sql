/*
  # Fix Group Policies

  1. Changes
    - Simplify group member policies to prevent recursion
    - Fix query syntax for group member selection
    - Optimize policy performance

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access
*/

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
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can view members of their groups"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
      UNION
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );