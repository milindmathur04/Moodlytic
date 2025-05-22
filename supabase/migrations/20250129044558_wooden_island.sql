-- First drop existing tables and dependencies
DROP TRIGGER IF EXISTS update_groups_timestamp ON groups;
DROP TRIGGER IF EXISTS handle_invitation_trigger ON group_members;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_invitation_expiry();
DROP FUNCTION IF EXISTS clean_expired_invitations();

-- Drop existing policies
DO $$ 
BEGIN
  -- Drop policies on groups table
  DROP POLICY IF EXISTS "groups_select" ON groups;
  DROP POLICY IF EXISTS "groups_insert" ON groups;
  DROP POLICY IF EXISTS "groups_update" ON groups;
  DROP POLICY IF EXISTS "groups_delete" ON groups;
  
  -- Drop policies on group_members table
  DROP POLICY IF EXISTS "group_members_select" ON group_members;
  DROP POLICY IF EXISTS "group_members_insert" ON group_members;
  DROP POLICY IF EXISTS "group_members_update" ON group_members;
  DROP POLICY IF EXISTS "group_members_delete" ON group_members;
END $$;

-- Drop existing tables
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Now recreate everything fresh
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
  invitation_sent_at timestamptz DEFAULT now(),
  invitation_expires_at timestamptz DEFAULT (now() + interval '7 days'),
  invitation_metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(group_id, email)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create optimized indices
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_group_members_email_status ON group_members(email, status);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_invitation ON group_members(invitation_expires_at) 
  WHERE status = 'pending';

-- Create function to handle invitation expiry
CREATE OR REPLACE FUNCTION handle_invitation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    NEW.invitation_sent_at = CURRENT_TIMESTAMP;
    NEW.invitation_expires_at = CURRENT_TIMESTAMP + interval '7 days';
    NEW.invitation_metadata = jsonb_build_object(
      'invited_by', auth.uid(),
      'invited_at', CURRENT_TIMESTAMP
    );
  ELSIF NEW.status = 'active' AND OLD.status = 'pending' THEN
    NEW.invitation_metadata = NEW.invitation_metadata || jsonb_build_object(
      'activated_at', CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invitation handling
CREATE TRIGGER handle_invitation_trigger
  BEFORE INSERT OR UPDATE OF status ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_invitation_expiry();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_groups_timestamp
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for groups
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
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_update"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_delete"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create RLS policies for group members
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
    email = auth.email() OR
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