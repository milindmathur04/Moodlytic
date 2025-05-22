-- First drop existing policies
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_delete" ON groups;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

-- Create simplified policies for groups
CREATE POLICY "groups_select"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = id 
      AND group_members.email = auth.email()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "groups_insert"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_update"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "groups_delete"
  ON groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create simplified policies for group members
CREATE POLICY "group_members_select"
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

CREATE POLICY "group_members_insert"
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

CREATE POLICY "group_members_update"
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

CREATE POLICY "group_members_delete"
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

-- Create function to handle member status changes
CREATE OR REPLACE FUNCTION handle_member_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow pending members to become active
  IF NEW.status = 'active' AND OLD.status != 'pending' THEN
    RAISE EXCEPTION 'Invalid status transition';
  END IF;

  -- Only allow the member themselves to accept invitations
  IF NEW.status = 'active' AND OLD.status = 'pending' AND 
     auth.email() != OLD.email THEN
    RAISE EXCEPTION 'Only the invited user can accept invitations';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member status changes
DROP TRIGGER IF EXISTS member_status_changes ON group_members;
CREATE TRIGGER member_status_changes
  BEFORE UPDATE OF status ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_member_status_changes();

-- Optimize indices
DROP INDEX IF EXISTS idx_groups_creator;
DROP INDEX IF EXISTS idx_members_lookup;
DROP INDEX IF EXISTS idx_members_group;

CREATE INDEX idx_groups_auth ON groups(created_by);
CREATE INDEX idx_members_auth ON group_members(email, status);
CREATE INDEX idx_members_group ON group_members(group_id);