import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises'; // Using promises version of fs

// Define the structure of a challenge based on your JSON
// (Adjust based on the final structure you used, including 'order' and 'position' modes)
interface ChallengeBase {
  id: string;
  title: string;
  mode: 'order' | 'position'; // Add other modes if necessary
}

interface OrderChallenge extends ChallengeBase {
  mode: 'order';
  questions: Array<{
    index: number;
    type: 'start' | 'moment' | 'end';
    text?: string; // For 'moment'
    context?: string; // For 'start'/'end'
    importance?: number;
  }>;
}

interface PositionChallenge extends ChallengeBase {
  mode: 'position';
  scenario: string;
  fixedPlayers: string[];
  choices: string[];
  correctPositions: string[];
}

type Challenge = OrderChallenge | PositionChallenge;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date');
  const adminDate = searchParams.get('adminDate'); // Get potential admin date

  let targetDate: string | null = null;

  // Prioritize adminDate only in non-production environments
  if (process.env.NODE_ENV !== 'production' && adminDate) {
    // Basic validation for adminDate format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(adminDate)) {
      targetDate = adminDate;
      console.log(`[Admin Override] Using date: ${targetDate}`); // Log admin usage
    } else {
       console.warn(`[Admin Override] Invalid adminDate format received: ${adminDate}`);
    }
  }

  // If adminDate wasn't used or was invalid, check for regular date param
  if (!targetDate && requestedDate) {
     // Basic validation for date format (YYYY-MM-DD)
     if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
        targetDate = requestedDate;
     } else {
        console.warn(`Invalid date format received: ${requestedDate}`);
     }
  }

  // If still no valid date, default to today
  if (!targetDate) {
    targetDate = new Date().toISOString().slice(0, 10);
  }

  try {
    // Construct the path to the JSON file
    // process.cwd() gives the root of the project
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'dailyChallenges.json');

    // Read the file content
    const jsonData = await fs.readFile(jsonPath, 'utf-8');

    // Parse the JSON data
    const challenges: Challenge[] = JSON.parse(jsonData);

    // Find the challenge for the target date
    const challenge = challenges.find(c => c.id === targetDate);

    if (challenge) {
      // Return the found challenge
      return NextResponse.json(challenge);
    } else {
      // Return 404 if no challenge found for the date
      return NextResponse.json({ message: `No challenge found for date: ${targetDate}` }, { status: 404 });
    }
  } catch (error) {
    console.error('Error reading or parsing dailyChallenges.json:', error);
    // Return 500 for server errors (e.g., file not found, invalid JSON)
    return NextResponse.json({ message: 'Internal Server Error reading challenge data' }, { status: 500 });
  }
}

// Prevent caching since challenge data depends on the current date
export const dynamic = 'force-dynamic' 