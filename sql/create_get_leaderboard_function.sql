-- Save as sql/create_get_leaderboard_function.sql

-- Drop the function if it already exists (optional, for idempotency)
DROP FUNCTION IF EXISTS get_leaderboard();

-- Create the function to fetch and rank leaderboard scores
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  game_id text,
  score integer, -- Match the type in scores table
  mode text,
  metadata jsonb,
  created_at timestamptz,
  score_position bigint -- Changed alias to score_position
)
LANGUAGE sql STABLE -- Indicates the function doesn\'t modify the database
AS $$
  WITH RankedScores AS (
    SELECT
      s.id,         
      s.user_id,    
      s.game_id,    
      s.score,      
      s.mode,       
      s.metadata,   
      s.created_at, 
      u.email,      -- Fetched from auth.users
      ROW_NUMBER() OVER(PARTITION BY s.mode ORDER BY s.score DESC, s.created_at DESC) as rn 
    FROM
      public.scores s -- Use public schema explicitly if needed
    LEFT JOIN
      auth.users u ON s.user_id = u.id
  )
  SELECT
    rs.id,
    rs.user_id,
    rs.email::text, -- Cast email to text to match return type
    rs.game_id,
    rs.score,
    rs.mode,
    rs.metadata,
    rs.created_at,
    rs.rn as score_position 
  FROM
    RankedScores rs
  WHERE
    rs.rn <= 20 -- Limit to top 20 per mode
  ORDER BY
    rs.mode ASC, 
    score_position ASC;
$$;

-- Note: Ensure the user/role executing this function via the API
-- has SELECT permissions on public.scores and auth.users.
-- Supabase\'s default authenticated role usually has this for scores,
-- but might need explicit permission for auth.users depending on setup. 