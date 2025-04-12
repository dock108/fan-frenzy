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

### Changed
- (No significant changes in this version yet)

### Fixed
- Fixed build errors related to Geist font installation and middleware environment variable loading. 