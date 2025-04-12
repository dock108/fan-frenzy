-- Add key_moments and needs_review columns to game_cache table

ALTER TABLE public.game_cache
ADD COLUMN IF NOT EXISTS key_moments JSONB,
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;

-- Add comments for the new columns
COMMENT ON COLUMN public.game_cache.key_moments IS 'Structured array of key moments extracted/generated for the game challenge.';
COMMENT ON COLUMN public.game_cache.needs_review IS 'Flag indicating if the generated key_moments need manual review/editing.';

-- Optional: Add index if querying by needs_review becomes common
-- CREATE INDEX IF NOT EXISTS idx_game_cache_needs_review ON public.game_cache(needs_review); 