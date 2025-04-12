# FanFrenzy

A Next.js application to test your memory of legendary sports moments.

Built with Next.js, Supabase, Tailwind CSS, and OpenAI.

This is a Next.js project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Core Features

*   **Multiple Game Modes:** Daily Challenge, Team Rewind, Shuffle Mode.
*   **AI-Powered Content:** Leverages OpenAI (GPT-4o) to generate key moments and multiple-choice questions for games.
*   **Supabase Integration:** Uses Supabase for PostgreSQL database, user authentication, and secure data storage.
*   **Interactive Gameplay:** Features include multiple-choice questions and drag-and-drop moment ordering.
*   **Score Tracking:** Saves user scores for Daily Challenge, Team Rewind, and Shuffle Mode.
*   **Leaderboards:** Displays top scores for each game mode on the `/leaderboard` page.
*   **Reusable Components:** Uses a modular `MomentCard` component to display moments consistently across game modes.
*   **Challenge Feature:** Allows users to submit feedback on specific AI-generated moments to help improve the model.

## Gameplay Modes

### Daily Challenge
*   Fetches a unique game based on the current date.
*   Presents key moments using the `MomentCard` component.
*   Scores are saved to the user's profile.
*   Includes a "Challenge This Moment" button for feedback.

### Team Rewind
*   Users select a team, year, and specific game.
*   Key moments are fetched and presented using the `MomentCard` component.
*   Scores are saved to the user's profile.
*   Includes a "Challenge This Moment" button for feedback.

### Shuffle Mode
*   Fetches key moments from a predefined game.
*   Users drag and drop `MomentCard` components to arrange them chronologically.
*   Detailed scoring with visual feedback integrated into the `MomentCard`.
*   Scores are saved to the user's profile.
*   Includes a "Challenge This Moment" button (available after results are shown).

## Key Components

*   **`MomentCard` (`src/components/MomentCard.tsx`):**
    *   Displays individual game moments (context, question, options if applicable).
    *   Handles different states: active question, revealed answer, shuffle item.
    *   Shows importance score with color-coded feedback (Low/Medium/High) and tooltip explanation when revealed.
    *   Shows challenge button when appropriate.
    *   Styling adapts based on props (e.g., `isRevealed`, `isDraggable`, `resultStatus`).
*   **`ChallengeModal` (`src/components/ChallengeModal.tsx`):**
    *   Provides a modal interface for users to submit feedback on moments.
    *   Uses Headless UI for accessibility and transitions.

## AI Importance Score

*   Displayed on `MomentCard` components after a moment is revealed (in Daily Challenge and Rewind modes).
*   Provides a score (0.0-10.0) indicating the AI's assessment of the moment's significance.
*   Uses color-coding (Gray=Low, Yellow=Medium, Red=High) for quick visual assessment.
*   Includes a tooltip explaining the score is based on factors like win probability swing, game context, and momentum.
*   This score is primarily for user insight and does not currently affect gameplay scoring (except potentially as a bonus in Shuffle mode).

## Challenge Feature

*   Users can click "Challenge This Moment" on any `MomentCard` (if logged in).
*   The `ChallengeModal` appears, allowing selection of a reason and an optional comment.
*   Submissions are sent via the `/api/submitChallenge` endpoint.
*   Challenge data is stored in the `challenges` table in Supabase.
*   Feedback does not affect the current game score.

## Leaderboard (/leaderboard)
*   Fetches top scores (currently top 20) for each game mode (Daily, Rewind, Shuffle) via the `/api/getLeaderboard` endpoint.
*   Uses tabs to switch between modes.
*   Displays rank, user (anonymized email or partial user ID), score, game/date context, and time of submission.
*   Accessible to all users (public route).

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth
*   **Styling:** Tailwind CSS, Headless UI
*   **AI Integration:** OpenAI API (GPT-4o)
*   **Drag & Drop:** @hello-pangea/dnd
*   **Notifications:** react-hot-toast
*   **Date Formatting:** date-fns

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm
- Supabase account and project credentials

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Dock108/spoil-sports.git
   cd spoil-sports
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
   Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project URL and anon key.

4. Set up Supabase: Create a project, get API URL and anon key. Run the SQL scripts in `/sql` (e.g., `create_scores_table.sql`, `create_challenges_table.sql`) via the Supabase SQL Editor.

5. Set up OpenAI: Get an API key.

6. Create a `.env.local` file (copy from `.env.example`) and add your Supabase/OpenAI credentials.

7. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Homepage

The homepage (`/`) serves as the main entry point:
- Displays a welcome message and tagline.
- Features a primary Call to Action (CTA) for the "Daily Challenge".
- Includes placeholder cards for future "Team Rewind" and "Shuffle Mode" game modes.
- **Authentication Flow:**
  - If the user is logged out, clicking the Daily Challenge CTA redirects to the `/login` page.
  - If the user is logged in, the CTA links directly to the `/daily` challenge page.
- **Authentication Flow:** The Daily Challenge CTA always links to `/daily`. This page is accessible without login, but users need to log in to save scores.

### Daily Challenge (/daily)

- **Static Data:** The current version uses static data from `src/data/daily-challenge.json` to simulate the game.
- **Data Fetching:** The `/daily` page fetches the challenge data from the `/api/getDailyChallenge` API route.
- **Gameplay Format:** Reactive Fill-in-the-Blanks
    - Users are shown the context of a starting moment and an ending moment from a specific game.
    - Between these, a series of prompts are displayed, asking for key details (player name, play type, result, etc.) that occurred between the start and end points.
    - Users type their answers into input fields for each prompt.
    - **Reactive Feedback:** Input fields automatically lock with a green style upon an exact, case-insensitive match.
    - If a user types a partial match (contains the answer but isn't exact) and pauses, a feedback message appears below the field prompting for more specificity.
    - The game finishes automatically when all fields are locked.
- **Grading & Summary:**
  - User inputs are compared against the correct answers (case-insensitive).
  - The summary screen shows which answers were correct/incorrect and displays the correct answer for any misses.
- **Scoring:** Points are awarded incrementally as each field is correctly locked, based on the moment's importance score.
- **Summary:** The summary screen displays the final score and a recap of the correct answers for each prompt.

### Team Rewind

- **Selection (`/rewind`):** Allows users to select a team and year.
    - Uses static lists for teams (e.g., `NE`, `PHI`) and years (e.g., `2023`, `2022`).
    - Fetches a list of games for the selected team/year from `/api/getRewindGames`.
    - Currently uses static game lists (e.g., `src/data/games/NE_2023.json`).
    - Displays the list of available games.
- **Gameplay (`/rewind/play?team=...&year=...&gameId=...`):**
    - Navigated to when a user selects a game from the list.
    - Fetches detailed game data (event summary, key moments) via `/api/fetchGame`.
    - **Gameplay:** Presents a series of multiple-choice questions based on the fetched `key_moments`.
      - Users select an answer, reveal the correct one + explanation, and see the importance score.
      - Includes a "Skip" option with partial scoring.
    - **Summary:** Shows final score, correct/skipped count, and missed high-importance moments.
    - **Score Saving:** If logged in, the final score and game breakdown are saved via `/api/saveRewindScore` upon completion.

### Shuffle Mode (/shuffle)

- **Data Fetching:** Fetches game data (currently hardcoded to Rutgers vs. Louisville 2006) via `/api/fetchGame`.
- **Gameplay:**
  - Extracts key moments (specifically the `context`) from the fetched data.
  - Randomizes the order of these moments.
  - Presents the moments in a list allowing drag-and-drop reordering (using `@hello-pangea/dnd`).
- **Submission:**
  - A "Submit Order" button becomes active after the user has reordered items.
  - Clicking submit compares the user's order to the original chronological order (based on moment `index`).
  - Displays the results locally (how many were placed correctly) and calculates a score.
  - *Note: Score saving for Shuffle Mode is not yet implemented.*

### API Routes

- **`/api/getDailyChallenge` (GET):**
  - Returns the current daily challenge data.
  - Currently serves the static content from `src/data/daily-challenge.json`.
  - Includes basic error handling for file loading/parsing issues.
- **`/api/saveScore` (POST):**
  - Accepts `{ gameId: string, score: number }` in the request body.
  - Requires user to be authenticated (checks Supabase session).
  - Validates input and inserts the score into the `scores` table associated with the logged-in user.
  - Called automatically by the Daily Challenge page upon completion if the user is logged in.
- **`/api/getRewindGames` (GET):**
  - Accepts `team` and `year` query parameters.
  - Attempts to read and return the contents of the corresponding static game list file (e.g., `src/data/games/[TEAM]_[YEAR].json`).
  - Includes error handling for missing files or invalid parameters.
- **`/api/fetchGame` (GET):**
  - Accepts `team`, `year`, `gameId` query parameters.
  - Checks `game_cache` table in Supabase for existing data.
  - If cached data exists, returns `event_data` and `key_moments`.
  - If not cached:
    - **AI Generation:** Calls OpenAI (GPT-4o) twice:
        1.  To generate a play-by-play summary for the specified game.
        2.  To extract multiple-choice `key_moments` from the generated PBP.
    - Inserts the generated data (`event_data` including PBP, `key_moments`) into `game_cache` (requires `SUPABASE_SERVICE_ROLE_KEY`).
    - Returns the generated data.
- **`/api/saveRewindScore` (POST):**
  - Accepts `{ gameId: string, score: number, totalMoments: number, skipped: number, correct: number }` in the request body.
  - Requires user to be authenticated.
  - Validates input and inserts the score and metadata into the `scores` table with `mode = 'rewind'`.
- **`/api/saveShuffleScore` (POST):**
  - Accepts `{ gameId: string, score: number, totalMoments: number, correctPositions: number[], bonusEarned: number }` in the request body.
  - Requires user to be authenticated.
  - Validates input and inserts the score and metadata into the `scores` table with `mode = 'shuffle'`.
- **`/api/submitChallenge` (POST):**
  - Accepts `