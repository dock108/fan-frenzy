-- Add metadata columns to scores table for detailed results

ALTER TABLE public.scores
ADD COLUMN IF NOT EXISTS total_moments INTEGER,
ADD COLUMN IF NOT EXISTS correct_moments INTEGER,
ADD COLUMN IF NOT EXISTS skipped_moments INTEGER;

-- Add comments for the new columns
COMMENT ON COLUMN public.scores.total_moments IS 'Total number of moments presented in the game/challenge.';
COMMENT ON COLUMN public.scores.correct_moments IS 'Number of moments answered correctly.';
COMMENT ON COLUMN public.scores.skipped_moments IS 'Number of moments skipped by the user.'; 