-- Update scores table to allow for anonymous submissions in the beta
ALTER TABLE scores 
    ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS (Row Level Security) policies to allow anonymous inserts for the daily challenge beta
-- First, remove existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow users to insert their own scores" ON scores;

-- Create a new policy that allows both authenticated and anonymous score submissions
CREATE POLICY "Allow anyone to submit scores" ON scores 
    FOR INSERT 
    WITH CHECK (
        (auth.uid() IS NULL) OR  -- Allow anonymous submissions
        (auth.uid() = user_id)   -- Or authenticated users can only insert their own scores
    );

-- Update the read policy to allow reading anonymous submissions for leaderboards
DROP POLICY IF EXISTS "Allow users to read their own scores" ON scores;

CREATE POLICY "Allow users to read scores" ON scores 
    FOR SELECT
    USING (
        true  -- Anyone can read scores for leaderboards
    );

-- Optional: Add comments to clarify the schema changes
COMMENT ON TABLE scores IS 'Stores game scores from users, supports both authenticated and anonymous submissions for the daily challenge beta';
COMMENT ON COLUMN scores.user_id IS 'User ID from auth.users if authenticated, NULL for anonymous submissions';
COMMENT ON COLUMN scores.metadata IS 'Stores additional information like playerName for anonymous users'; 