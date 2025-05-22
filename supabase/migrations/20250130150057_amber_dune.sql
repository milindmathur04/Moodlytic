-- First drop existing policies
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "groups_delete_policy" ON groups;
DROP POLICY IF EXISTS "group_members_select_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_update_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON group_members;

-- Drop existing indices
DROP INDEX IF EXISTS idx_groups_auth;
DROP INDEX IF EXISTS idx_members_auth;
DROP INDEX IF EXISTS idx_members_group;

-- Create optimized indices
CREATE INDEX idx_groups_creator ON groups(created_by);
CREATE INDEX idx_members_lookup ON group_members(email, status, group_id);
CREATE INDEX idx_members_group ON group_members(group_id);

-- Create function to check group membership
CREATE OR REPLACE FUNCTION check_group_access(group_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM groups g
    LEFT JOIN group_members gm ON g.id = gm.group_id
    WHERE g.id = group_id
    AND (
      g.created_by = auth.uid() OR
      (gm.email = auth.email() AND gm.status = 'active')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check group creator
CREATE OR REPLACE FUNCTION is_group_creator(group_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM groups
    WHERE id = group_id 
    AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create groups policies
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

-- Create group members policies
CREATE POLICY "group_members_select"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email() OR
    check_group_access(group_id)
  );

CREATE POLICY "group_members_insert"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (is_group_creator(group_id));

CREATE POLICY "group_members_update"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    (email = auth.email() AND status = 'pending') OR
    is_group_creator(group_id)
  );

CREATE POLICY "group_members_delete"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (is_group_creator(group_id));

-- Create trigger function for group member changes
CREATE OR REPLACE FUNCTION handle_group_member_changes()
RETURNS TRIGGER AS $$
DECLARE
  existing_member RECORD;
BEGIN
  -- Prevent duplicate active memberships
  IF (TG_OP = 'INSERT' OR NEW.status = 'active') THEN
    SELECT * INTO existing_member
    FROM group_members 
    WHERE group_id = NEW.group_id 
    AND email = NEW.email 
    AND status = 'active'
    AND id != COALESCE(NEW.id, -1);
    
    IF FOUND THEN
      RAISE EXCEPTION 'User is already an active member of this group';
    END IF;
  END IF;

  -- Set user_id if email matches an auth user
  IF NEW.user_id IS NULL THEN
    NEW.user_id := (
      SELECT id 
      FROM auth.users 
      WHERE email = NEW.email 
      LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for group member changes
DROP TRIGGER IF EXISTS group_member_changes ON group_members;
CREATE TRIGGER group_member_changes
  BEFORE INSERT OR UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_group_member_changes();