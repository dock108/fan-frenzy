# Changelog

All notable changes to this project will be documented in this file.

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

### Changed
- Refactored Daily Challenge to a reactive 'fill-in-the-blanks' format: answers lock automatically on exact match, partial matches get debounced feedback.
- Removed login requirement for accessing the Daily Challenge (/daily).
- Updated homepage CTA to always link to /daily.

### Fixed
- Fixed build errors related to Geist font installation and middleware environment variable loading. 