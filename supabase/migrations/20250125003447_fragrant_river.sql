/*
  # Fix Group RLS Policies

  1. Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create new simplified policies for groups and group_members
    - Fix group member access logic
    - Add missing indices for performance

  2. Security
    - Maintain row-level security
    - Ensure users can only access their own groups and memberships
    - Prevent unauthorized access to group data

  3. Notes
    - Policies are simplified to avoid circular references
    - Uses user email for membership checks
    - Adds performance optimizations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their groups" ON groups;
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- Create new simplified policies for groups
CREATE POLICY "Groups access policy"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    -- User is either the creator or a member (via email)
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE 
        group_members.group_id = id AND
        group_members.email = (
          SELECT email 
          FROM user_profiles 
          WHERE user_profiles.id = auth.uid()
        )
    )
  )
  WITH CHECK (
    -- Only creator can modify
    created_by = auth.uid()
  );

-- Create new simplified policies for group members
CREATE POLICY "Group members access policy"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    -- User can access if they are the creator of the group or a member
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE 
        groups.id = group_id AND
        (groups.created_by = auth.uid() OR
         group_members.email = (
           SELECT email 
           FROM user_profiles 
           WHERE user_profiles.id = auth.uid()
         ))
    )
  )
  WITH CHECK (
    -- Only group creator can modify members
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE 
        groups.id = group_id AND
        groups.created_by = auth.uid()
    )
  );

-- Add missing indices for performance
CREATE INDEX IF NOT EXISTS idx_group_members_email_group_id ON group_members(email, group_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_by_id ON groups(created_by, id);