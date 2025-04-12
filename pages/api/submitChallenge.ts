import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Define the expected request body structure
interface SubmitChallengePayload {
  gameId: string;
  momentIndex: number;
  reason: string;
  comment?: string;
}

// Define allowed reasons
const ALLOWED_REASONS = [
  'Wrong Focus',
  'Better Moment Available',
  'Ambiguous Wording',
  'Other'
];

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 1. Check Authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session Error:', sessionError?.message);
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Parse and Validate Body
    let payload: SubmitChallengePayload;
    try {
      payload = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { gameId, momentIndex, reason, comment } = payload;

    if (
      typeof gameId !== 'string' || !gameId ||
      typeof momentIndex !== 'number' || momentIndex < 0 ||
      typeof reason !== 'string' || !ALLOWED_REASONS.includes(reason) ||
      (comment && typeof comment !== 'string') // Optional comment must be string if present
    ) {
      return NextResponse.json({ message: 'Invalid payload structure or values' }, { status: 400 });
    }

    // 3. Prepare Data for Supabase
    const challengeData = {
      user_id: userId,
      game_id: gameId,
      moment_index: momentIndex,
      reason: reason,
      comment: comment || null, // Ensure comment is null if empty/undefined
      // created_at is handled by Supabase default
    };

    // 4. Insert into Supabase
    const { error: insertError } = await supabase
      .from('challenges')
      .insert([challengeData]);

    if (insertError) {
      console.error('Supabase Insert Error (challenges):', insertError.message);
      return NextResponse.json({ message: `Failed to submit challenge: ${insertError.message}` }, { status: 500 });
    }

    // 5. Return Success
    return NextResponse.json({ message: 'Challenge submitted successfully' }, { status: 201 });

  } catch (error: any) {
    console.error('API Route Error (submitChallenge):', error);
    return NextResponse.json({ message: `An unexpected error occurred: ${error.message}` }, { status: 500 });
  }
} 