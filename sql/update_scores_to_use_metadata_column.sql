-- Save as sql/update_scores_to_use_metadata_column.sql

-- Add the new metadata column if it doesn\'t exist
ALTER TABLE public.scores
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Optional: Attempt to migrate data from old columns to the new metadata column
-- This is a best-effort migration and might need adjustment based on actual data.
-- It only runs if the old columns still exist.
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scores' AND column_name='total_moments') THEN
      UPDATE public.scores
      SET metadata = jsonb_build_object(
          'total_moments', COALESCE(total_moments, 0),
          'correct_moments', COALESCE(correct_moments, 0),
          'skipped_moments', COALESCE(skipped_moments, 0)
      )
      WHERE mode = 'rewind' AND metadata IS NULL; -- Only update rewind scores that haven\'t been migrated
   END IF;
END $$;

-- Drop the old individual columns if they exist
ALTER TABLE public.scores
DROP COLUMN IF EXISTS total_moments,
DROP COLUMN IF EXISTS correct_moments,
DROP COLUMN IF EXISTS skipped_moments;

-- Add an index to the metadata column if desired (optional)
-- CREATE INDEX IF NOT EXISTS idx_scores_metadata ON public.scores USING gin (metadata); 