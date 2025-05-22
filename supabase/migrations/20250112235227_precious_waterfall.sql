/*
  # Create user preferences table and setup

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `mood` (text) - The mood this preference relates to
      - `category` (text) - food, activity, or entertainment
      - `preference` (text) - The specific choice made
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for authenticated users to manage their preferences
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  mood text NOT NULL,
  category text NOT NULL,
  preference text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_category CHECK (category IN ('food', 'activity', 'entertainment'))
);

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_mood ON user_preferences(mood, category);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);