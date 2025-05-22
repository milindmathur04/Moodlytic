/*
  # Add user interactions tracking

  1. New Tables
    - `user_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `type` (text, constrained to 'click' or 'view')
      - `category` (text, constrained to 'food', 'activity', 'entertainment', 'event')
      - `item_name` (text)
      - `url` (text, optional)
      - `mood` (text, optional)
      - `metadata` (jsonb, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to insert and view their own interactions
*/

CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  category text NOT NULL,
  item_name text NOT NULL,
  url text,
  mood text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_type CHECK (type IN ('click', 'view')),
  CONSTRAINT valid_category CHECK (category IN ('food', 'activity', 'entertainment', 'event'))
);

-- Create index for faster lookups
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_type_category ON user_interactions(type, category);

-- Enable RLS
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own interactions"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"
  ON user_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);