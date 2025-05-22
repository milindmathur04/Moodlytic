/*
  # Fix user profiles policies

  1. Changes
    - Drop existing policies
    - Add new policies for insert, select, and update
    - Add policy for authenticated users to create their own profile
    
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure users can only access their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only"
ON user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id"
ON user_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
ON user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);