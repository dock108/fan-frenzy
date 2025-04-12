# Changelog

All notable changes to the FanFrenzy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initialized project with Next.js (TypeScript, Tailwind, App Router) and Supabase setup.
- Added email/password authentication using Supabase Auth (login, signup, logout).
- Implemented protected routes (/dashboard) using middleware.
- Added basic session management with AuthContext.
- Included react-hot-toast for notifications.
- Created initial Supabase schema (scores, challenges, game_cache) with RLS policies in `sql/init-schema.sql`.
- Added homepage (/) with Daily Challenge CTA, placeholders for other modes, and auth-aware navigation to /daily or /login.
- Created placeholder /daily page.
- Implemented Daily Challenge game flow (/daily) using static JSON data (`src/data/daily-challenge.json`).
- Added game state management, question/answer/reveal logic, and summary screen.
- Implemented score saving to Supabase for logged-in users.
- Created API route `/api/getDailyChallenge` to serve static challenge data.
- Added API route `/api/saveScore` to save Daily Challenge results.
- Added Team Rewind selection page (`/rewind`) with team/year/game pickers.
- Created API route `/api/getRewindGames` to serve static game list data.
- Added placeholder page for Team Rewind gameplay (`/rewind/play`).
- Added API route `/api/fetchGame` with Supabase caching logic (using mock data for misses).
- Integrated OpenAI API (GPT-4o) into `/api/fetchGame` to generate key moments from placeholder PBP on cache miss.
- Implemented Team Rewind gameplay UI (`/rewind/play`) with multiple-choice format using data from `/api/fetchGame`.
- Added API endpoint `/api/saveRewindScore` and integrated score saving into Team Rewind flow.
- Added metadata columns (total_moments, correct_moments, skipped_moments) to `scores` table (`sql/update-scores-schema.sql`).
- Added Shuffle Mode page (`/shuffle`) with drag-and-drop moment ordering using `@hello-pangea/dnd`.
- Implemented context sanitization for Shuffle Mode to hide clues (score, time, field position).
- Implemented grading logic and scoring for Shuffle Mode.
- Added API route `/api/saveShuffleScore` to log Shuffle Mode results to Supabase.
- Integrated Shuffle Mode score saving into the frontend UI.
- Added `challenges` table schema (`sql/create_challenges_table.sql`).
- Created API route `/api/submitChallenge` to save moment feedback.
- Added reusable `ChallengeModal` component (`src/components/ChallengeModal.tsx`) using Headless UI.
- Integrated challenge feature into Daily Challenge UI (`/daily`).
- Created reusable `MomentCard` component (`src/components/MomentCard.tsx`).
- Integrated `MomentCard` into Daily Challenge, Team Rewind, and Shuffle Mode pages.
- Added AI Importance Score visualization (badge, color-coding, tooltip) to `MomentCard`.
- Added `date-fns` library for date formatting.
- Created API route `/api/getLeaderboard` to fetch ranked scores.
- Created Leaderboard page (`/leaderboard`) with tabs for different modes.
- Added Leaderboard link to header.

### Changed
- Refactored `/api/fetchGame` to potentially use OpenAI for moment generation and ensure multiple-choice format (Step 11).
- Updated Daily Challenge page to use reactive format based on API response (Step 8) -> Refactored again to use MomentCard (Step 17).
- Updated Team Rewind gameplay page (`/rewind/play`) to use MomentCard (Step 17).
- Updated Shuffle Mode page (`/shuffle`) to use MomentCard (Step 17).
- Updated middleware (`src/middleware.ts`) to handle environment variables correctly and define public/private routes, including `/shuffle` and `/leaderboard`.
- Made Shuffle Mode card on homepage active (Step 13+).
- Updated Shuffle Mode UI to display game info (Step 13+).
- Standardized `scores` table to use a `metadata` JSONB column instead of individual columns (`total_moments`, etc.) (Step 19 Fix).
- Updated `saveRewindScore` API to use the new `metadata` column (Step 19 Fix).

### Fixed
- Resolved build errors related to `@next/font` usage.
- Fixed middleware issue with environment variable loading.
- Corrected invalid regex errors in Shuffle Mode context sanitization (Step 13+).
- Fixed build errors related to React rendering / syntax errors (Multiple Steps).
- Fixed SQL syntax errors in `create_challenges_table.sql` (Step 16+).
- Fixed dependency issue (`@headlessui/react`, `date-fns` not installed) (Step 17+, Step 19+).
- Fixed component structure/syntax error in `rewind/play/page.tsx` (Step 17+).
- Fixed Supabase RPC call error in `getLeaderboard` API by creating a proper SQL function (`get_leaderboard`) (Step 19+).
- Fixed `get_leaderboard` function error due to missing `metadata` column by altering `scores` table schema (Step 19+).
- Fixed `get_leaderboard` function error `WITHIN GROUP is required` by changing `rank` alias to `position` (Step 19+).
- Fixed `get_leaderboard` function syntax error by changing alias `position` to `score_position` (Step 19+).

### Removed
- Mock game data fetching logic replaced by API calls.
- Hardcoded moment rendering logic in `/daily`, `/rewind/play`, `/shuffle` replaced by `MomentCard`.
- Removed individual `total_moments`, `correct_moments`, `skipped_moments` columns from `scores` table (Step 19 Fix).