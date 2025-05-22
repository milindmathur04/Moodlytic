-- First drop existing policies
DROP POLICY IF EXISTS "groups_select_v4" ON groups;
DROP POLICY IF EXISTS "groups_insert_v4" ON groups;
DROP POLICY IF EXISTS "groups_update_v4" ON groups;
DROP POLICY IF EXISTS "groups_delete_v4" ON groups;
DROP POLICY IF EXISTS "group_members_select_final" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_final" ON group_members;
DROP POLICY IF EXISTS "group_members_update_final" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_final" ON group_members;

-- Drop existing indices
DROP INDEX IF EXISTS idx_groups_creator_v4;
DROP INDEX IF EXISTS idx_members_email_status_final;
DROP INDEX IF EXISTS idx_members_group_final;

-- Recreate tables with proper structure
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT groups_name_check CHECK (char_length(trim(name)) > 0)
);

CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active')),
  created_at timestamptz DEFAULT now(),
  invitation_sent_at timestamptz DEFAULT now(),
  invitation_expires_at timestamptz DEFAULT (now() + interval '7 days'),
  invitation_metadata jsonb DEFAULT jsonb_build_object('invited_at', now()),
  CONSTRAINT group_members_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create partial unique index for active memberships
CREATE UNIQUE INDEX group_members_active_membership 
ON group_members(group_id, email) 
WHERE status = 'active';

-- Create optimized indices
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_group_members_composite ON group_members(group_id, email, status);
CREATE INDEX idx_group_members_user ON group_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_group_members_email ON group_members(email, status);

-- Create groups policies
CREATE POLICY "groups_select"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email() 
      AND status = 'active'
    )
  );

CREATE POLICY "groups_insert"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "groups_update"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "groups_delete"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create group members policies
CREATE POLICY "group_members_select"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_insert"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    (email = auth.email() AND status = 'pending') OR
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    )
  );

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();