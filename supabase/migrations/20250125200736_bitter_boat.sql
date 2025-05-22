-- First drop all existing policies and tables to start fresh
DROP POLICY IF EXISTS "groups_insert_v4" ON groups;
DROP POLICY IF EXISTS "groups_select_v4" ON groups;
DROP POLICY IF EXISTS "groups_update_v4" ON groups;
DROP POLICY IF EXISTS "groups_delete_v4" ON groups;
DROP POLICY IF EXISTS "group_members_insert_v4" ON group_members;
DROP POLICY IF EXISTS "group_members_select_v4" ON group_members;
DROP POLICY IF EXISTS "group_members_update_v4" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_v4" ON group_members;

-- Drop existing tables
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Recreate tables with proper structure
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active')),
  created_at timestamptz DEFAULT now(),
  invitation_sent_at timestamptz,
  invitation_expires_at timestamptz,
  invitation_metadata jsonb,
  UNIQUE(group_id, email)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for groups
CREATE POLICY "groups_insert_final"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_select_final"
  ON groups
  FOR SELECT
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
  );

CREATE POLICY "groups_update_final"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "groups_delete_final"
  ON groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create simplified policies for group members
CREATE POLICY "group_members_insert_final"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_select_final"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update_final"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete_final"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
      AND groups.created_by = auth.uid()
    )
  );

-- Create optimized indices
CREATE INDEX idx_groups_created_by_final ON groups(created_by);
CREATE INDEX idx_group_members_email_status_final ON group_members(email, status);
CREATE INDEX idx_group_members_group_id_final ON group_members(group_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_groups_timestamp
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();