# SpoilSports

This is a Next.js project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

4. Run the development server:
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
- **Gameplay Format:** Fill-in-the-Blanks
  - Users are shown the context of a starting moment and an ending moment from a specific game.
  - Between these, a series of prompts are displayed, asking for key details (player name, play type, result, etc.) that occurred between the start and end points.
  - Users type their answers into input fields for each prompt.
  - After filling in the blanks, users click "Submit Guesses".
- **Grading & Summary:**
  - User inputs are compared against the correct answers (case-insensitive).
  - The summary screen shows which answers were correct/incorrect and displays the correct answer for any misses.
- **Scoring:**
  - Points are awarded based on the importance score of correctly answered moments.
  - A small bonus is added for each correct answer.
  - Logged-in users have their final score saved to the `scores` table in Supabase.
- **Summary:** After the final moment, a summary screen displays the total score, number correct, and highlights any high-importance moments the user missed.

### Authentication

This project uses Supabase Auth for email/password authentication.

- Visit `/login` to sign up or log in.
- The `/dashboard` route is protected and requires authentication.
- The `/daily` route is public, but score saving requires login.
- Session management is handled via context and middleware.
- Ensure you have enabled the Email provider in your Supabase project settings.

### Database Schema

The initial database schema includes tables for `scores`, `challenges`, and `game_cache`.

- **Schema Definition:** The SQL script to create these tables and their basic Row Level Security (RLS) policies is located in `sql/init-schema.sql`.
- **Applying the Schema:** Run the contents of `sql/init-schema.sql` in your Supabase project's SQL Editor (Database -> SQL Editor) to set up the tables.
- **RLS Policies:** Basic RLS policies are included to allow users to manage their own scores and challenges. Access to `game_cache` is initially restricted. Adjust policies as needed for your application's security requirements.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
