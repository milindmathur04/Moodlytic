-- Drop all existing policies
DROP POLICY IF EXISTS "groups_all_access_policy_v2" ON groups;
DROP POLICY IF EXISTS "group_members_all_access_policy_v2" ON group_members;

-- Create simplified group policies
CREATE POLICY "groups_insert_policy"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_select_policy"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE email = auth.email()
    )
  );

CREATE POLICY "groups_update_delete_policy"
  ON groups
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Create simplified group members policies
CREATE POLICY "group_members_insert_policy"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_select_policy"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE created_by = auth.uid()
    ) OR
    email = auth.email()
  );

CREATE POLICY "group_members_update_delete_policy"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
  );

-- Refresh the indices safely
DROP INDEX IF EXISTS idx_group_members_email_status_v2;
DROP INDEX IF EXISTS idx_groups_created_by_v2;

DO $$ 
BEGIN
  -- Create indices if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_groups_created_by_id'
  ) THEN
    CREATE INDEX idx_groups_created_by_id ON groups(created_by, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_group_members_email_group'
  ) THEN
    CREATE INDEX idx_group_members_email_group ON group_members(email, group_id);
  END IF;
END $$;