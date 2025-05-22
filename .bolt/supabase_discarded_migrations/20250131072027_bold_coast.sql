-- Drop existing policies
DROP POLICY IF EXISTS "groups_access_simple" ON groups;
DROP POLICY IF EXISTS "group_members_access_simple" ON group_members;

-- Add invitation tracking columns
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS invited_by_user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invitation_metadata jsonb DEFAULT jsonb_build_object(
  'invited_at', CURRENT_TIMESTAMP,
  'platform', 'web'
);

-- Create function to handle member status changes
CREATE OR REPLACE FUNCTION handle_member_status()
RETURNS TRIGGER AS $$
BEGIN
  -- For new invitations
  IF TG_OP = 'INSERT' THEN
    NEW.invited_by_user_id = auth.uid();
    NEW.invitation_sent_at = CURRENT_TIMESTAMP;
    NEW.invitation_expires_at = CURRENT_TIMESTAMP + interval '7 days';
    NEW.invitation_metadata = NEW.invitation_metadata || jsonb_build_object(
      'invited_by', auth.uid(),
      'invited_at', CURRENT_TIMESTAMP
    );
  END IF;

  -- For status updates
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    -- Only allow pending to active transition
    IF NEW.status = 'active' AND OLD.status != 'pending' THEN
      RAISE EXCEPTION 'Invalid status transition';
    END IF;

    -- Only allow the invited user to accept their own invitation
    IF NEW.status = 'active' AND OLD.status = 'pending' AND 
       auth.email() != OLD.email THEN
      RAISE EXCEPTION 'Only the invited user can accept invitations';
    END IF;

    -- Update metadata for accepted invitations
    IF NEW.status = 'active' AND OLD.status = 'pending' THEN
      NEW.invitation_metadata = NEW.invitation_metadata || jsonb_build_object(
        'accepted_at', CURRENT_TIMESTAMP,
        'accepted_by', auth.uid()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member status changes
DROP TRIGGER IF EXISTS member_status_trigger ON group_members;
CREATE TRIGGER member_status_trigger
  BEFORE INSERT OR UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_member_status();

-- Create policies for groups
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
  USING (created_by = auth.uid());

CREATE POLICY "groups_delete"
  ON groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create policies for group members
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

-- Create optimized indices
DROP INDEX IF EXISTS idx_groups_creator_simple;
DROP INDEX IF EXISTS idx_members_lookup_simple;

CREATE INDEX idx_groups_creator ON groups(created_by);
CREATE INDEX idx_members_email_status ON group_members(email, status);
CREATE INDEX idx_members_group_id ON group_members(group_id);
CREATE INDEX idx_members_pending ON group_members(email, invitation_expires_at) 
  WHERE status = 'pending';