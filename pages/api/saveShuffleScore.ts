import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Define the expected request body structure
interface SaveShuffleScorePayload {
  gameId: string;
  score: number;
  totalMoments: number;
  correctPositions: number;
  bonusEarned: boolean;
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 1. Check Authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session Error:', sessionError.message);
      return NextResponse.json({ message: 'Error retrieving session' }, { status: 500 });
    }
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Parse and Validate Body
    let payload: SaveShuffleScorePayload;
    try {
      payload = await request.json();
    } catch (parseError) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { gameId, score, totalMoments, correctPositions, bonusEarned } = payload;

    if (
      typeof gameId !== 'string' || !gameId ||
      typeof score !== 'number' || score < 0 ||
      typeof totalMoments !== 'number' || totalMoments <= 0 ||
      typeof correctPositions !== 'number' || correctPositions < 0 || correctPositions > totalMoments ||
      typeof bonusEarned !== 'boolean'
    ) {
      return NextResponse.json({ message: 'Invalid payload structure or values' }, { status: 400 });
    }

    // 3. Prepare Data for Supabase
    const scoreData = {
      user_id: userId,
      game_id: gameId,
      score: score,
      mode: 'shuffle', // Set the mode for this score type
      metadata: { // Store additional details in the JSONB column
        total_moments: totalMoments,
        correct_positions: correctPositions,
        bonus_earned: bonusEarned,
      },
      // created_at is handled by Supabase default
    };

    // 4. Insert into Supabase
    const { error } = await supabase
      .from('scores')
      .insert([scoreData]);

    if (error) {
      console.error('Supabase Insert Error:', error.message);
      // Consider more specific error handling (e.g., duplicate violation?)
      return NextResponse.json({ message: `Failed to save score: ${error.message}` }, { status: 500 });
    }

    // 5. Return Success
    return NextResponse.json({ message: 'Shuffle score saved successfully' }, { status: 201 });

  } catch (error: unknown) {
    console.error('API Route Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `An unexpected error occurred: ${message}` }, { status: 500 });
  }
} 