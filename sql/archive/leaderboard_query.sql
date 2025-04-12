-- Save as sql/leaderboard_query.sql

-- Fetches top scores for each game mode (daily, rewind, shuffle)
-- joining with user emails for display.
-- Limits to the top 20 scores per mode.

WITH RankedScores AS (
  SELECT
    s.id,         -- Score ID
    s.user_id,    -- User ID
    s.game_id,    -- Game ID
    s.score,      -- Score value
    s.mode,       -- Game mode (daily, rewind, shuffle)
    s.metadata,   -- Additional score metadata (JSONB)
    s.created_at, -- Timestamp of score submission
    u.email,      -- User\'s email from auth.users
    ROW_NUMBER() OVER(PARTITION BY s.mode ORDER BY s.score DESC, s.created_at DESC) as rn -- Rank within each mode
  FROM
    scores s
  LEFT JOIN
    auth.users u ON s.user_id = u.id
)
SELECT
  id,
  user_id,
  email, -- Or handle null emails if users can be deleted
  game_id,
  score,
  mode,
  metadata,
  created_at,
  rn as score_position -- Changed alias to score_position
FROM
  RankedScores
WHERE
  rn <= 20 -- Limit to top 20 per mode
ORDER BY
  mode ASC, -- Group modes together
  score_position ASC; -- Changed ORDER BY alias 