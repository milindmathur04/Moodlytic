/*
  # Groups Schema Redesign

  1. Tables
    - `groups`: Stores group information
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `group_members`: Stores group membership
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `user_id` (uuid, references auth.users, nullable)
      - `email` (text)
      - `status` (text: pending/active)
      - `created_at` (timestamptz)
      - `invitation_token` (uuid, for email invites)

  2. Security
    - Enable RLS on both tables
    - Policies to ensure proper access control
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop policies on groups table
  DROP POLICY IF EXISTS "groups_policy" ON groups;
  DROP POLICY IF EXISTS "groups_insert" ON groups;
  DROP POLICY IF EXISTS "groups_select" ON groups;
  DROP POLICY IF EXISTS "groups_update" ON groups;
  DROP POLICY IF EXISTS "groups_delete" ON groups;
  
  -- Drop policies on group_members table
  DROP POLICY IF EXISTS "group_members_policy" ON group_members;
  DROP POLICY IF EXISTS "group_members_insert" ON group_members;
  DROP POLICY IF EXISTS "group_members_select" ON group_members;
  DROP POLICY IF EXISTS "group_members_update" ON group_members;
  DROP POLICY IF EXISTS "group_members_delete" ON group_members;
END $$;

-- Drop existing tables
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Create groups table
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active')),
  created_at timestamptz DEFAULT now(),
  invitation_token uuid DEFAULT gen_random_uuid(),
  UNIQUE(group_id, email)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

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

-- Create indices for better performance
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_email_status ON group_members(email, status);
CREATE INDEX idx_group_members_user_id ON group_members(user_id) WHERE user_id IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();