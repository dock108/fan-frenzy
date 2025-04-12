# Save as sql/submit_challenge_query.sql

-- This file shows an example of the SQL query used by
-- the /api/submitChallenge endpoint to insert a challenge
-- into the Supabase database.

-- Assumes the following variables are provided by the backend:
-- :user_id (uuid, from authenticated session)
-- :game_id (text, from request payload)
-- :moment_index (integer, from request payload)
-- :reason (text, from request payload)
-- :comment (text, optional from request payload, defaults to NULL)

INSERT INTO challenges (user_id, game_id, moment_index, reason, comment)
VALUES (:user_id, :game_id, :moment_index, :reason, :comment); 