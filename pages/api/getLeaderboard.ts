import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from "@/types/supabase"; // Assuming you have types generated

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  email: string | null;
  game_id: string;
  score: number;
  mode: string;
  metadata: any;
  created_at: string;
  position: number; // Changed from rank to position
}

// Define the structure of the response
export interface LeaderboardResponse {
  daily: LeaderboardEntry[];
  rewind: LeaderboardEntry[];
  shuffle: LeaderboardEntry[];
}

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export async function GET(/* request: Request */) { // Removed unused 'request' parameter
  try {
    // Using Route Handler Client - careful with RLS for reads!
    // If RLS prevents reading scores/users, you might need a service role client here.
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Optional: Check if user is authenticated if needed for RLS
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) { ... }

    // --- Execute the Leaderboard Function via RPC --- 
    // Now calling the actual database function 'get_leaderboard'
    // The <LeaderboardEntry[]> part tells TypeScript the expected return structure
    const { data, error } = await supabase
        .rpc('get_leaderboard')
        .returns<LeaderboardEntry[]>(); // Specify the expected return type

    if (error) {
        console.error("Supabase Leaderboard RPC Error:", error);
        // Check RLS policies if you get permission errors
        return NextResponse.json({ message: `Failed to fetch leaderboard: ${error.message}` }, { status: 500 });
    }

    // Process data into separate arrays per mode
    const leaderboardData: LeaderboardResponse = {
      daily: [],
      rewind: [],
      shuffle: [],
    };

    if (data) {
        // Type assertion might be needed depending on exact setup, 
        // but .returns<T>() should ideally handle it.
        (data as LeaderboardEntry[]).forEach((entry) => { 
            switch (entry.mode) {
                case 'daily':
                    leaderboardData.daily.push(entry);
                    break;
                case 'rewind':
                    leaderboardData.rewind.push(entry);
                    break;
                case 'shuffle':
                    leaderboardData.shuffle.push(entry);
                    break;
            }
        });
    }

    return NextResponse.json(leaderboardData, { status: 200 });

  } catch (error: unknown) { // Use unknown for generic catch
    console.error('API Route Error (getLeaderboard):', error);
    // Type check for error message
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `An unexpected error occurred: ${message}` }, { status: 500 });
  }
} 