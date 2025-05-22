-- Drop existing policies
DROP POLICY IF EXISTS "groups_access" ON groups;
DROP POLICY IF EXISTS "group_members_access" ON groups;
DROP POLICY IF EXISTS "groups_policy" ON groups;
DROP POLICY IF EXISTS "group_members_policy" ON group_members;

-- Modify group_members table to ensure user_id is properly set
ALTER TABLE group_members
ADD COLUMN temp_user_id uuid;

-- Update temp_user_id from auth.users based on email
UPDATE group_members
SET temp_user_id = auth.users.id
FROM auth.users
WHERE group_members.email = auth.users.email;

-- Now safely update user_id
UPDATE group_members
SET user_id = temp_user_id
WHERE temp_user_id IS NOT NULL;

-- Drop temporary column
ALTER TABLE group_members
DROP COLUMN temp_user_id;

-- Create new optimized indices
DROP INDEX IF EXISTS idx_group_members_email_status;
DROP INDEX IF EXISTS idx_group_members_user_id;
CREATE INDEX idx_group_members_user_id_status ON group_members(user_id, status);
CREATE INDEX idx_group_members_email_user_id ON group_members(email, user_id);

-- Create new simplified policies for groups
CREATE POLICY "groups_policy_new"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  )
  WITH CHECK (created_by = auth.uid());

-- Create new simplified policy for group members
CREATE POLICY "group_members_policy_new"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.created_by = auth.uid()
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