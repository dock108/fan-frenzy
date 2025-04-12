import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Define expected request body structure
interface RewindScorePayload {
    gameId: string;
    score: number;
    totalMoments: number;
    skipped: number;
    correct: number;
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    // 1. Authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session || !session.user) {
      console.error('[API Save Rewind Score] Session Error:', sessionError);
      const status = sessionError ? 500 : 401;
      const message = sessionError ? 'Error getting user session' : 'Unauthorized: No active session found.';
      return NextResponse.json({ message }, { status });
    }
    const user = session.user;

    // 2. Get Request Body
    const body = await request.json() as RewindScorePayload;
    const { gameId, score, totalMoments, skipped, correct } = body;

    // 3. Validation
    if (!gameId || typeof gameId !== 'string') {
        return NextResponse.json({ message: 'Bad Request: Missing or invalid gameId.' }, { status: 400 });
    }
    if (typeof score !== 'number' || isNaN(score)) {
      return NextResponse.json({ message: 'Bad Request: Missing or invalid score.' }, { status: 400 });
    }
    if (typeof totalMoments !== 'number' || !Number.isInteger(totalMoments) || totalMoments < 0) {
         return NextResponse.json({ message: 'Bad Request: Missing or invalid totalMoments.' }, { status: 400 });
    }
    if (typeof skipped !== 'number' || !Number.isInteger(skipped) || skipped < 0) {
         return NextResponse.json({ message: 'Bad Request: Missing or invalid skipped count.' }, { status: 400 });
    }
     if (typeof correct !== 'number' || !Number.isInteger(correct) || correct < 0) {
         return NextResponse.json({ message: 'Bad Request: Missing or invalid correct count.' }, { status: 400 });
    }
    // Optional: Check if correct + skipped <= totalMoments

    // 4. Insert into Supabase
    const { error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        game_id: gameId, // Use the specific gameId from Rewind selection
        score: score,
        mode: 'rewind', // Set mode to 'rewind'
        total_moments: totalMoments,
        correct_moments: correct,
        skipped_moments: skipped,
      })

    if (insertError) {
      console.error('[API Save Rewind Score] Insert Error:', insertError);
      return NextResponse.json({ message: `Failed to save rewind score: ${insertError.message}` }, { status: 500 });
    }

    // 5. Return Success
    return NextResponse.json({ message: 'Rewind score saved successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('[API Save Rewind Score] General Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Bad Request: Invalid JSON format.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 