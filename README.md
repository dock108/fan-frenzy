# FanFrenzy

This branch represents the FanFrenzy public beta focused only on the Daily Challenge mode.

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
*   **Theme Support:** Features a light/dark mode toggle with support for team-based theming.
*   **Consistent Layouts:** Uses a reusable AppShell component with responsive header and footer.
*   **Team Theming:** Dynamic color scheme based on selected sports team.
*   **Page Transitions:** Smooth animations between pages and states for a more immersive experience.

## Gameplay Modes

### Daily Challenge
*   Fetches a unique game based on activation timestamps defined in the game data (`dailyChallenges.json`). The currently active challenge is the one with the latest activation time that is in the past (typically changes daily at 3 AM Eastern Time).
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

## Leaderboard (`/leaderboard`)

*   **Layout:** Clean, responsive design using tabs for different game modes.
*   **Display:** Uses a reusable `LeaderboardRow` component.
    *   **Desktop:** Displays data in a table-like format with columns.
    *   **Mobile:** Adapts to a card-based list view.
*   **Highlights:** 
    *   Top 3 ranks are indicated with 🥇🥈🥉 icons.
    *   The current logged-in user's row is highlighted.
*   **User Info:** Shows rank, user initials in an avatar, anonymized username, score, game/date, and submission time.

### Mobile UX & Responsiveness

*   **Strategy:** Mobile-first approach using Tailwind CSS utility classes.
*   **Layout:** Uses `container mx-auto px-4` for consistent padding. Responsive grids (`grid-cols-*`, `md:grid-cols-*`) are used for layout shifts (e.g., Leaderboard).
*   **Typography:** Relies on Tailwind's responsive font sizes. Text truncation is used where necessary.
*   **Touch Targets:** Buttons and interactive elements generally adhere to minimum touch target sizes (e.g., >44px). CTAs in game modes are positioned at the bottom for easier thumb access.
*   **Navigation:** Uses a responsive `AppShell` with a slide-in `MobileMenu` for small screens.
*   **Performance:** Animations are kept brief (~300ms). Hover-only effects are minimal.

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

### iOS Deployment (via Capacitor)

This project uses [Capacitor](https://capacitorjs.com/) to package the Next.js web application as a native iOS app.

**Prerequisites:**

*   Xcode installed
*   CocoaPods installed (`sudo gem install cocoapods`)

**Setup:**

1.  **Install Capacitor CLI:**
    ```bash
    npm install @capacitor/cli --save-dev
    ```
2.  **Install Core and iOS packages:**
    ```bash
    npm install @capacitor/core @capacitor/ios
    ```
3.  **Initialize Capacitor:** (This might have been done already)
    ```bash
    npx cap init "FanFrenzy" "app.fanfrenzy.challenge" --web-dir=out
    ```
    *Note: Adjust the app name and ID if needed. `web-dir` points to the output of `next export` or `next build` if configured for static output.*
4.  **Configure Capacitor:**
    *   Edit `capacitor.config.ts` (or `.json`). Ensure the `server.url` points to your deployed web app if you are loading it live, or configure `webDir` correctly for a static build. For live loading (as configured previously):
        ```typescript
        import { CapacitorConfig } from '@capacitor/cli';

        const config: CapacitorConfig = {
          appId: 'app.fanfrenzy.challenge',
          appName: 'FanFrenzy',
          webDir: 'out', // Or your build output directory
          bundledWebRuntime: false, // Important for loading remote URL
          server: {
            url: 'https://fanfrenzy.app', // Your deployed web app URL
            cleartext: true // Allow HTTP if necessary, though HTTPS is recommended
          }
        };

        export default config;
        ```
5.  **Add iOS Platform:**
    ```bash
    npx cap add ios
    ```
6.  **Sync Web Assets & Native Project:**
    ```bash
    npm run build # Ensure your web build is up-to-date
    npx cap sync ios
    ```
7.  **Open in Xcode:**
    ```bash
    npx cap open ios
    ```
8.  **Xcode Configuration:**
    *   Select your development team under "Signing & Capabilities".
    *   Ensure the correct device/simulator is selected.
    *   Build and run the app (Cmd+R).

**Notes:**

*   The `.gitignore` file has been updated to exclude generated iOS directories (`/ios/App/Pods`, `DerivedData`, etc.).
*   Viewport and CSS adjustments were made to accommodate the iPhone's Dynamic Island safe areas.

### Homepage

The homepage (`/`) serves as the main entry point:
- Displays a welcome message and tagline.
- Features a primary Call to Action (CTA) for the "Daily Challenge".
- Includes placeholder cards for future "Team Rewind" and "Shuffle Mode" game modes.
- **Authentication Flow:**
  - If the user is logged out, clicking the Daily Challenge CTA redirects to the `/login` page.
  - If the user is logged in, the CTA links directly to the `/daily` challenge page.
- **Authentication Flow:** The Daily Challenge CTA always links to `/daily`. This page is accessible without login, but users need to log in to save scores.

### Daily Challenge (`/daily`)

*   **Layout:** Multi-step immersive flow (Intro -> Playing -> Summary).
*   **Gameplay:** Users fill in blank text inputs based on prompts related to a specific game narrative. 
    *   **Immediate Feedback:** Inputs lock with a green style upon correct answer (case-insensitive, trims whitespace).
    *   **Variations:** Accepts common synonyms for certain answers (e.g., "incompletion" for "incomplete pass", "homer" for "home run") via the `answerVariations` dictionary.
    *   **Hints:** If the user types a partial match (e.g., correct last name but answer needs full name, or a significant substring) and pauses, a subtle hint appears below the input.
    *   **Completion:** Game automatically moves to summary when all inputs are locked.
    *   **Give Up:** A button allows users to skip to the summary screen early.
*   **Intro:** Full-screen welcome with title, icon, description, and start CTA. Uses a subtle texture background.
*   **Playing:** Immersive quiz screen with a blurred stadium/crowd background. Questions are presented in a single card with context. Progress bar and input focus use a consistent accent color (yellow/amber).
*   **Summary:** Full-screen results page with a celebratory gradient background. Features a prominent score banner, detailed answer review (showing user input vs correct answer), and relevant CTAs (Leaderboard, Try Another Mode).

### Team Rewind (`/rewind`, `/rewind/play`)

*   **Layout:** Team selection grid followed by an immersive, team-themed game screen.
*   **Selector:** Grid display of team logos. Selecting a team fetches available games for that team.
*   **Transition:** Full-screen color overlay using team's primary color fades in/out when loading the game.
*   **Playing Screen:** 
    *   **Background:** Blurred team-specific imagery (placeholder currently) with a gradient overlay using `--team-primary` and `--team-secondary`. Team logo watermark in the corner.
    *   **Theming:** UI elements like the progress bar, buttons, and potentially parts of the `MomentCard` use team colors set via CSS variables (`--team-primary`, `--team-secondary`, `--team-accent`) managed by the `useTeamTheme` hook.
*   **Summary:** Results screen maintains the team's immersive background and uses team colors for highlighting score and CTAs.

### Shuffle Mode (`/shuffle`)

*   **Layout:** Immersive view with a subtle blurred background (timeline grid). Uses a sticky header for instructions.
*   **Cards:** Draggable `MomentCard` components with sanitized context (scores, times removed). Visual feedback (shadow, outline) provided during drag.
*   **Styling:** Uses a default accent color (purple) for the submit button and highlights, which can be overridden by team themes if applied.
*   **Feedback:** After submission, cards change background and show a border/icon indicating correct (green check), close (yellow warning), or incorrect (red cross) placement. Importance score is also displayed.
*   **Summary:** Results are shown in a themed box below the cards, including score and action buttons.

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

## Theme System

FanFrenzy includes a comprehensive theme system that supports:

* **Light/Dark Mode:** Toggle between light and dark themes using the icon in the header. The system defaults to your browser/OS preference.
* **Team-Based Theming:** The app includes CSS variables for team colors that can be dynamically changed based on selected teams.

### Design Tokens

The app uses design tokens through CSS variables and Tailwind:

```css
/* Base UI tokens */
--color-bg: #ffffff;      /* Light mode background */
--color-fg: #171717;      /* Light mode text */
--color-accent: #0ea5e9;  /* Accent color for actions */

/* Dark mode overrides */
.dark {
  --color-bg: #0f0f0f;
  --color-fg: #f9f9f9;
  --color-accent: #22d3ee;
}

/* Team colors (NFL examples) */
--team-primary: #002244;    /* Patriots blue */
--team-secondary: #c60c30;  /* Patriots red */
--team-accent: #b0b7bc;     /* Patriots silver */
--team-overlay: rgba(0, 34, 68, 0.1);
```

### Using Team Colors in Components

Access team colors in your components using Tailwind classes:

```jsx
<button className="bg-teamPrimary text-white hover:bg-teamSecondary">
  Team-Colored Button
</button>

<div className="border border-teamPrimary bg-teamOverlay">
  Content with team styling
</div>
```

### Programmatically Change Team Theme

Use the `useTeamTheme` hook to change team colors:

```jsx
import useTeamTheme from '@/hooks/useTeamTheme';

function TeamSelector() {
  const { setTeamTheme, resetTeamTheme, availableTeams } = useTeamTheme();
  
  return (
    <div>
      <button onClick={() => setTeamTheme('patriots')}>
        Patriots Theme
      </button>
      <button onClick={() => setTeamTheme('bills')}>
        Bills Theme
      </button>
      <button onClick={resetTeamTheme}>
        Reset Theme
      </button>
    </div>
  );
}
```

### Available Teams

The system includes themes for NFL teams including:
- AFC East: Bills, Dolphins, Patriots, Jets
- AFC North: Ravens, Bengals, Browns, Steelers
- More teams can be added in `hooks/useTeamTheme.ts`

## Layout System

FanFrenzy includes a flexible layout system centered around the `AppShell` component that provides consistent structure across the application:

### AppShell Component

The `AppShell` component (`components/layout/AppShell.tsx`) serves as the main layout wrapper with:

* **Responsive Header:** Brand/logo, navigation links, theme toggle, and user authentication controls
* **Mobile Support:** Collapsible menu for small screens with fluid touch targets
* **Optional Footer:** Copyright info and site links
* **Props:**
  ```typescript
  {
    children: React.ReactNode,
    showHeader?: boolean, // defaults to true
    showFooter?: boolean  // defaults to true
  }
  ```

### DefaultLayout

For most pages, use the `DefaultLayout` component which is a simple wrapper around `AppShell` with the same props:

```jsx
import DefaultLayout from '@/components/layout/DefaultLayout';

export default function MyPage() {
  return (
    <DefaultLayout>
      {/* Page content */}
    </DefaultLayout>
  );
}
```

### Custom Layouts

For specialized pages (like login screens or fullscreen games), you can:

1. Use `AppShell` directly with custom options:
   ```jsx
   <AppShell showHeader={false}>
     {/* Custom fullscreen content */}
   </AppShell>
   ```

2. Or create custom layout components extending `AppShell` for specific sections of the site.

### Mobile Navigation

The mobile navigation is automatically handled through the `MobileMenu` component, which provides:
- Touch-friendly slide-in drawer
- Responsive design for small screens
- Accessibility features (keyboard navigation, ARIA attributes)

## Transition System

FanFrenzy implements smooth transitions between pages and UI states using Framer Motion:

### Page Transitions

The `TransitionLayout` component wraps content with animated transitions for improved user experience:

```jsx
import TransitionLayout from '@/components/layout/TransitionLayout';

export default function GamePage() {
  return (
    <TransitionLayout transitionMode="slide-up">
      {/* Page content */}
    </TransitionLayout>
  );
}
```

Available transition modes:
- `default`: Fade in while sliding up slightly
- `slide-up`: Slide up from the bottom
- `slide-left`: Slide in from the right
- `fade`: Simple fade in/out
- `none`: No animation

### Component-Level Transitions

For transitions within a page or component (like changing steps in a flow):

```jsx
import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';

function MultiStepFlow() {
  const [step, setStep] = useState(1);
  
  return (
    <div>
      <PageTransition key={step} mode="fade">
        {step === 1 && <StepOne />}
        {step === 2 && <StepTwo />}
      </PageTransition>
      
      <button onClick={() => setStep(prev => prev + 1)}>
        Next Step
      </button>
    </div>
  );
}
```

### TeamTransition (Placeholder)

A component prepared for future enhancements that will show immersive full-screen 
color transitions when moving from team selection to team-specific game pages:

```jsx
import TeamTransition from '@/components/layout/TeamTransition';

function TeamPage({ teamCode }) {
  return (
    <TeamTransition teamCode={teamCode} isActive={true}>
      {/* Team-specific content */}
    </TeamTransition>
  );
}
```

This feature is currently a placeholder scaffold that will be fully implemented
in future updates.

## Design System & Layout

The application utilizes Tailwind CSS for styling and layout. Key design principles include:

*   **Minimalism:** Clean interfaces, focus on content.
*   **Team Theming:** Dynamic color palettes based on selected teams (future enhancement).
*   **Immersive Layout:** Full-screen or near-full-screen layouts for game modes, using subtle backgrounds and smooth transitions.
*   **Theme Awareness:** Support for both light and dark modes.

### Homepage (`/`)

*   **Layout:** Full-height hero section with scroll interaction to reveal game mode selection.
*   **Components:** Gradient title, subtle background effects, large CTA, immersive game mode cards with hover effects.

### Daily Challenge (`/daily`)

*   **Layout:** Multi-step immersive flow (Intro -> Playing -> Summary).
*   **Gameplay:** Users fill in blank text inputs based on prompts related to a specific game narrative. 
    *   **Immediate Feedback:** Inputs lock with a green style upon correct answer (case-insensitive, trims whitespace).
    *   **Variations:** Accepts common synonyms for certain answers (e.g., "incompletion" for "incomplete pass", "homer" for "home run") via the `answerVariations` dictionary.
    *   **Hints:** If the user types a partial match (e.g., correct last name but answer needs full name, or a significant substring) and pauses, a subtle hint appears below the input.
    *   **Completion:** Game automatically moves to summary when all inputs are locked.
    *   **Give Up:** A button allows users to skip to the summary screen early.
*   **Intro:** Full-screen welcome with title, icon, description, and start CTA. Uses a subtle texture background.
*   **Playing:** Immersive quiz screen with a blurred stadium/crowd background. Questions are presented in a single card with context. Progress bar and input focus use a consistent accent color (yellow/amber).
*   **Summary:** Full-screen results page with a celebratory gradient background. Features a prominent score banner, detailed answer review (showing user input vs correct answer), and relevant CTAs (Leaderboard, Try Another Mode).

### Team Rewind (`/rewind`, `/rewind/play`)

*   **Layout:** Team selection grid followed by an immersive, team-themed game screen.
*   **Selector:** Grid display of team logos. Selecting a team fetches available games for that team.
*   **Transition:** Full-screen color overlay using team's primary color fades in/out when loading the game.
*   **Playing Screen:** 
    *   **Background:** Blurred team-specific imagery (placeholder currently) with a gradient overlay using `--team-primary` and `--team-secondary`. Team logo watermark in the corner.
    *   **Theming:** UI elements like the progress bar, buttons, and potentially parts of the `MomentCard` use team colors set via CSS variables (`--team-primary`, `--team-secondary`, `--team-accent`) managed by the `useTeamTheme` hook.
*   **Summary:** Results screen maintains the team's immersive background and uses team colors for highlighting score and CTAs.

# FanFrenzy - Daily Challenge

## Overview

A web application where users participate in daily sports trivia challenges.

## Features

*   **Daily Challenge:** Fetches a new challenge each day.
*   **Multiple Formats:** Supports different challenge types:
    *   `order`: Users sequence historical sports moments chronologically.
    *   `position`: Users place players or items into correct slots (e.g., lineup, rankings).
*   **Static Data:** Currently uses a static JSON dataset for challenges.
*   **Admin Date Override:** Allows overriding the challenge date for testing in development environments.

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

*   Next.js
*   React
*   TypeScript
*   Tailwind CSS

## API Endpoints

*   `GET /api/getDailyChallenge`: Fetches the challenge for the current date.
    *   Query Params:
        *   `date=YYYY-MM-DD` (Optional): Fetch challenge for a specific date.
        *   `adminDate=YYYY-MM-DD` (Optional, Dev Only): Override the date used to fetch the challenge.