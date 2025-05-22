-- Clear all user data from tables
TRUNCATE TABLE user_profiles CASCADE;
TRUNCATE TABLE user_preferences CASCADE;
TRUNCATE TABLE user_interactions CASCADE;
TRUNCATE TABLE group_members CASCADE;
TRUNCATE TABLE groups CASCADE;

-- Delete all users from auth.users
DELETE FROM auth.users;

-- Reset all sequences
ALTER SEQUENCE IF EXISTS user_profiles_id_seq RESTART;
ALTER SEQUENCE IF EXISTS user_preferences_id_seq RESTART;
ALTER SEQUENCE IF EXISTS user_interactions_id_seq RESTART;
ALTER SEQUENCE IF EXISTS group_members_id_seq RESTART;
ALTER SEQUENCE IF EXISTS groups_id_seq RESTART;