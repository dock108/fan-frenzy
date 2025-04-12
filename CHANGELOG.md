# Changelog

All notable changes to the FanFrenzy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js, TypeScript, Tailwind CSS.
- Basic layout components (Navbar, Footer).
- Authentication context (`AuthContext`) using dummy data.
- Placeholder pages for game modes (Daily, Rewind, Shuffle).
- Demo pages for Theme and Transitions.
- Initial Daily Challenge API endpoint (`/api/getDailyChallenge`).
- Score saving API endpoint (`/api/saveScore`).
- Basic leaderboard page and API (`/leaderboard`, `/api/getLeaderboard`).
- Implemented page transitions using `framer-motion`.
- Added `react-hot-toast` for notifications.
- Added Heroicons library.
- Added answer variation dictionary and logic to Daily Challenge.
- Added hint system (Close, Need full name) to Daily Challenge inputs.
- Added "Give Up" button to Daily Challenge.
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
- Created reusable `MomentCard` component (`src/components/MomentCard.tsx`).
- Integrated `MomentCard` into Daily Challenge, Team Rewind, and Shuffle Mode pages.
- Added AI Importance Score visualization (badge, color-coding, tooltip) to `MomentCard`.
- Added `date-fns` library for date formatting.
- Created API route `/api/getLeaderboard` to fetch ranked scores.
- Created Leaderboard page (`/leaderboard`) with tabs for different modes.
- Added Leaderboard link to header.
- Added global light/dark theme support using next-themes and Tailwind CSS.
- Created ThemeProvider context to manage theme state.
- Added ThemeToggle component to toggle between light and dark modes.
- Updated global CSS variables to support team theming via CSS variables (--team-primary, --team-accent, --team-overlay).
- Added color scheme aware styling to all main game cards and components.
- Updated tailwind.config.mjs to support dark mode and team color variables.
- Created AppShell layout component with responsive header and footer.
- Added MobileMenu component for navigation on small screens.
- Created DefaultLayout wrapper for consistent page structure.
- Implemented the layout system in the Daily Challenge page.
- Added support for toggling header and footer visibility.
- Updated README with layout system documentation.
- Added Tailwind design tokens and CSS variable-based team color support.
- Created useTeamTheme hook for dynamic team color management.
- Expanded team color system with support for NFL teams.
- Added TeamThemeDemo component for testing team themes.
- Created team-theme-demo page for showcasing theme capabilities.
- Updated UI components to use new design tokens and team colors.
- Added Framer Motion for page and component transitions.
- Created PageTransition component for animated transitions between UI states.
- Implemented TransitionLayout for page level transitions.
- Added TeamTransition component (placeholder) for future team entry transitions.
- Created transition-demo page with interactive demonstrations.
- Updated Daily Challenge page with smooth transitions.
- Added links to transition demo from homepage and team theme page.
- Updated README with transition system documentation.

### Changed
- Refactored homepage (/) to use new immersive dashboard design.
- Redesigned Daily Challenge (/daily) using immersive layout and mode-specific styling.
- Implemented immersive Team Rewind experience with team-specific visuals.
- Refined Shuffle Mode with immersive background, styled moment cards, and clean scoring interface.
- Updated Daily Challenge page to use reactive format based on API response (Step 8) -> Refactored again to use MomentCard (Step 17).
- Updated Team Rewind gameplay page (`/rewind/play`) to use MomentCard (Step 17).
- Updated Shuffle Mode page (`/shuffle`) to use MomentCard (Step 17).
- Updated middleware (`src/middleware.ts`) to handle environment variables correctly and define public/private routes, including `/shuffle` and `/leaderboard`.
- Made Shuffle Mode card on homepage active (Step 13+).
- Updated Shuffle Mode UI to display game info (Step 13+).
- Standardized `scores` table to use a `metadata` JSONB column instead of individual columns (`total_moments`, etc.) (Step 19 Fix).
- Updated `saveRewindScore` API to use the new `metadata` column (Step 19 Fix).
- Enhanced UI with theme-aware styling for better light/dark mode support.
- Updated the Header component to include a theme toggle button.
- Restructured app layout to use the AppShell component instead of directly inserting Header and content.
- Updated Daily Challenge page with dark mode compatible styling and AppShell layout.
- Reworked layout system to include transition capabilities.
- Enhanced homepage with more prominent links to demo pages.
- Redesigned Leaderboard with rank indicators, mobile responsiveness, and clean styling.
- Completed mobile responsiveness and touch UX polish across all game modes.
- Restored immediate interactive feedback (locking inputs) to Daily Challenge.

### Fixed
- Resolved minor styling issues in Navbar.
- Corrected transition timings.
- Resolved Module Not Found error for `@heroicons/react`.
- Corrected invalid `transitionMode` prop in Daily Challenge.
- Removed unnecessary scroll behavior on homepage.
- Resolved build errors related to `@next/font`