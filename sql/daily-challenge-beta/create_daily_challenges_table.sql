-- Create the daily_challenges table for storing scheduled challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    gameId TEXT NOT NULL,
    title TEXT NOT NULL,
    moments JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Index for date lookups for today's challenge
    CONSTRAINT date_unique UNIQUE (date)
);

-- Function to get today's challenge
CREATE OR REPLACE FUNCTION get_daily_challenge()
RETURNS TABLE (
    id UUID,
    date DATE,
    gameId TEXT,
    title TEXT,
    moments JSONB
) AS $$
BEGIN
    RETURN QUERY 
    SELECT
        dc.id,
        dc.date,
        dc.gameId,
        dc.title,
        dc.moments
    FROM
        daily_challenges dc
    WHERE
        dc.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Example of inserting a sample challenge for testing
-- INSERT INTO daily_challenges (date, gameId, title, moments)
-- VALUES (
--     CURRENT_DATE, 
--     'daily-001',
--     'The Miracle on Ice',
--     '[
--         {"index": 0, "type": "start", "context": "The 1980 Winter Olympics..."},
--         {"index": 1, "type": "fill-in", "prompt": "Team USA was led by coach ___", "answer": "Herb Brooks", "importance": 5},
--         {"index": 2, "type": "end", "context": "This victory is often ranked as the greatest moment in American sports history."}
--     ]'::jsonb
-- );

-- Comment:
-- This setup allows for scheduling daily challenges in advance.
-- The application will query the daily_challenges table based on the current date.
-- If a challenge exists for today, it will be served to the user.
-- If no challenge exists, the application falls back to a static file. 