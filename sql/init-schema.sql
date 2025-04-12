-- SpoilSports Initial Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCORES Table
-- Stores scores for different game modes
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL, -- Identifier for the game/challenge (e.g., YYYY-MM-DD for daily, team_YYYY_gamenum for rewind)
  mode TEXT NOT NULL CHECK (mode IN ('daily', 'rewind', 'shuffle')), -- Game mode type
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Policies for SCORES table
-- Users can insert their own scores
CREATE POLICY "Allow users to insert their own scores" ON public.scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own scores
CREATE POLICY "Allow users to view their own scores" ON public.scores
  FOR SELECT USING (auth.uid() = user_id);

-- Optional: Allow users to update their own scores (if needed, e.g., for corrections)
-- CREATE POLICY "Allow users to update their own scores" ON public.scores
--   FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for SCORES table
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_scores_game_id ON public.scores(game_id);
CREATE INDEX idx_scores_mode ON public.scores(mode);

-- Add comments to SCORES table and columns
COMMENT ON TABLE public.scores IS 'Stores user scores for different game modes.';
COMMENT ON COLUMN public.scores.game_id IS 'Identifier for the game/challenge (e.g., YYYY-MM-DD for daily, team_YYYY_gamenum for rewind)';
COMMENT ON COLUMN public.scores.mode IS 'Game mode type: daily, rewind, or shuffle.';

-- 2. CHALLENGES Table
-- Stores user challenges/corrections for specific game moments
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL, -- Identifier for the game the moment belongs to
  moment_identifier TEXT NOT NULL, -- A unique way to identify the moment within the game (e.g., play ID, timestamp, sequence number)
  reason TEXT NOT NULL, -- Reason for the challenge (e.g., "Wrong Focus", "Better Moment", "Incorrect Info", "Other")
  comment TEXT, -- Optional user comment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Policies for CHALLENGES table
-- Users can insert their own challenges
CREATE POLICY "Allow users to insert their own challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own challenges
CREATE POLICY "Allow users to view their own challenges" ON public.challenges
  FOR SELECT USING (auth.uid() = user_id);

-- Optional: Allow admins/mods to view all challenges (Requires a custom role or different logic)
-- CREATE POLICY "Allow admins to view all challenges" ON public.challenges
--   FOR SELECT USING (is_admin(auth.uid())); -- Example: is_admin is a custom function

-- Indexes for CHALLENGES table
CREATE INDEX idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX idx_challenges_game_id ON public.challenges(game_id);
CREATE INDEX idx_challenges_moment_identifier ON public.challenges(moment_identifier);

-- Add comments to CHALLENGES table and columns
COMMENT ON TABLE public.challenges IS 'Stores user challenges/corrections for specific game moments.';
COMMENT ON COLUMN public.challenges.game_id IS 'Identifier for the game the moment belongs to.';
COMMENT ON COLUMN public.challenges.moment_identifier IS 'A unique way to identify the moment within the game (e.g., play ID, timestamp, sequence number)';
COMMENT ON COLUMN public.challenges.reason IS 'Reason for the challenge (e.g., "Wrong Focus", "Better Moment", "Incorrect Info", "Other").';


-- 3. GAME_CACHE Table (Optional)
-- Caches data fetched from third-party sports APIs
CREATE TABLE public.game_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_api TEXT NOT NULL, -- Identifier for the source API (e.g., 'sportsdata.io', 'thesportsdb')
  source_game_id TEXT NOT NULL, -- The game ID from the source API
  league TEXT NOT NULL, -- e.g., NFL, NBA, MLB, NHL
  game_details JSONB, -- Basic game details (teams, date, final score etc.)
  event_data JSONB, -- Detailed play-by-play or key moments data
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ -- Optional: Set an expiry time for the cache
);

-- Enable Row Level Security (RLS) - Typically you might restrict access more tightly
ALTER TABLE public.game_cache ENABLE ROW LEVEL SECURITY;

-- Policies for GAME_CACHE table
-- By default, deny all access. Access should likely be handled by service roles or specific user policies if needed.
-- Allow authenticated users to read cache data (Adjust as needed)
CREATE POLICY "Allow authenticated users to read game cache" ON public.game_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role (e.g., from backend API routes) to insert/update cache data
-- Note: Service roles bypass RLS by default, but explicit policies can be clearer.
CREATE POLICY "Allow service role to manage cache" ON public.game_cache
  FOR ALL USING (auth.role() = 'service_role'); -- Check if service_role has necessary privileges

-- Indexes for GAME_CACHE table
CREATE UNIQUE INDEX idx_game_cache_source_game ON public.game_cache(source_api, source_game_id, league);
CREATE INDEX idx_game_cache_fetched_at ON public.game_cache(fetched_at);
CREATE INDEX idx_game_cache_expires_at ON public.game_cache(expires_at);

-- Add comments to GAME_CACHE table and columns
COMMENT ON TABLE public.game_cache IS 'Caches data fetched from third-party sports APIs to reduce load and costs.';
COMMENT ON COLUMN public.game_cache.source_api IS 'Identifier for the source API (e.g., ''sportsdata.io'', ''thesportsdb'').';
COMMENT ON COLUMN public.game_cache.source_game_id IS 'The game ID from the source API.';
COMMENT ON COLUMN public.game_cache.league IS 'e.g., NFL, NBA, MLB, NHL';
COMMENT ON COLUMN public.game_cache.game_details IS 'Basic game details (teams, date, final score etc.).';
COMMENT ON COLUMN public.game_cache.event_data IS 'Detailed play-by-play or key moments data from the source API.';
COMMENT ON COLUMN public.game_cache.expires_at IS 'Optional: Set an expiry time for the cache.'; 