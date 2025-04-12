-- Save as sql/create_challenges_table.sql

-- Create the challenges table IF IT DOES NOT EXIST
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Keep challenge even if user is deleted
  game_id TEXT NOT NULL, -- ID of the game the moment belongs to
  moment_index INTEGER NOT NULL, -- Index of the moment within the game\'s key_moments array
  reason TEXT NOT NULL, -- Reason selected from dropdown (e.g., \"Wrong Focus\")
  comment TEXT, -- Optional user comment
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Optional: Add indexes for querying IF THEY DO NOT EXIST
CREATE INDEX IF NOT EXISTS idx_challenges_game_id ON challenges(game_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);

-- Optional: Enable Row Level Security (RLS)
-- This command is typically safe to run multiple times
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Create the policy IF IT DOES NOT EXIST
-- Note: Creating policies idempotently often requires DROP IF EXISTS first,
-- but for this specific case, let's assume it hasn't been created yet 
-- or handle potential policy existence errors separately if they arise.
CREATE POLICY Users_can_insert_their_own_challenges 
ON challenges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Example: Allow authenticated users to read all challenges (or restrict further)
-- CREATE POLICY IF NOT EXISTS Authenticated_users_can_read_challenges -- Example 
-- ON challenges FOR SELECT 
-- USING (auth.role() = \'authenticated\');

-- Note: You might want more restrictive read policies depending on how/if you plan to display challenges. 