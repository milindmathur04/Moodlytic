-- Drop existing policies
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_delete" ON groups;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

-- Create simplified group policies
CREATE POLICY "groups_insert"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_select"
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

CREATE POLICY "groups_update"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups_delete"
  ON groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create simplified group members policies
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

CREATE POLICY "group_members_select"
  ON group_members
  FOR SELECT
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
  );

CREATE POLICY "group_members_update"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM groups 
      WHERE groups.id = group_id 
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

-- Ensure indices exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_groups_created_by'
  ) THEN
    CREATE INDEX idx_groups_created_by ON groups(created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_group_members_email_status'
  ) THEN
    CREATE INDEX idx_group_members_email_status ON group_members(email, status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_group_members_group_id'
  ) THEN
    CREATE INDEX idx_group_members_group_id ON group_members(group_id);
  END IF;
END $$;