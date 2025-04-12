import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Define the expected request body structure
interface SubmitChallengePayload {
  gameId: string;
  momentIndex: number | null;
  reason: string;
  comment?: string;
}

// Define allowed reasons
const ALLOWED_REASONS = [
  'Incorrect Answer/Order',
  'Ambiguous Wording/Context',
  'Incorrect Player/Team Info',
  'Technical Bug',
  'Other'
];

export async function POST(request: Request) {
  const cookieStore = await cookies()

  try {
    // Create Supabase client using createServerClient
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

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
    } catch {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { gameId, momentIndex, reason, comment } = payload;

    if (
      typeof gameId !== 'string' || !gameId ||
      (momentIndex !== null && typeof momentIndex !== 'number') ||
      (typeof momentIndex === 'number' && momentIndex < -1) ||
      typeof reason !== 'string' || !ALLOWED_REASONS.includes(reason) ||
      (comment && typeof comment !== 'string')
    ) {
      return NextResponse.json({ message: 'Invalid payload structure or values' }, { status: 400 });
    }

    // 3. Prepare Data for Supabase
    const challengeData = {
      user_id: userId,
      game_id: gameId,
      moment_index: momentIndex,
      reason: reason,
      comment: comment || null,
    };

    // 4. Insert into Supabase
    const { error } = await supabase
      .from('challenges')
      .insert([challengeData]);

    if (error) {
      console.error('Supabase Insert Error (challenges):', error.message);
      return NextResponse.json({ message: `Failed to submit challenge: ${error.message}` }, { status: 500 });
    }

    // 5. Return Success
    return NextResponse.json({ message: 'Challenge submitted successfully' }, { status: 201 });

  } catch (error: unknown) {
    console.error('API Route Error (submitChallenge):', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `An unexpected error occurred: ${message}` }, { status: 500 });
  }
} 