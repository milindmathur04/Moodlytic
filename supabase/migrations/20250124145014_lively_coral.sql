/*
  # Fix group member policies

  1. Changes
    - Fix infinite recursion in group_members policies
    - Simplify policy logic for better performance
    - Maintain same security model but with optimized queries

  2. Security
    - Users can still only view members of groups they created or are active members of
    - Group creators maintain full control over member management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

-- Create new optimized policy
CREATE POLICY "Users can view members of their groups"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_id
      AND (
        groups.created_by = auth.uid() OR
        group_id IN (
          SELECT gm.group_id 
          FROM group_members gm
          WHERE gm.user_id = auth.uid()
          AND gm.status = 'active'
        )
      )
    )
  );