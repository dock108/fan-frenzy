import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // No try...catch needed in Route Handler
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // No try...catch needed, use delete
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  try {
    // 1. Get Request Body
    const body = await request.json()
    const { gameId, score, playerName } = body

    // 2. Validation
    if (!gameId || typeof gameId !== 'string') {
      return NextResponse.json({ message: 'Bad Request: Missing or invalid gameId.' }, { status: 400 })
    }
    if (typeof score !== 'number' || isNaN(score)) {
      return NextResponse.json({ message: 'Bad Request: Missing or invalid score.' }, { status: 400 })
    }
    
    // Check for session but don't require it
    const { data: { session } } = await supabase.auth.getSession()
    const user_id = session?.user?.id || null

    // 3. Insert into Supabase
    const { error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: user_id, // Will be null for anonymous users
        game_id: gameId,
        score: score,
        mode: 'daily-challenge-beta', 
        metadata: playerName ? { playerName } : null // Store player name for anonymous users
      })

    if (insertError) {
      console.error('[API Save Score] Insert Error:', insertError)
      return NextResponse.json({ message: `Failed to save score: ${insertError.message}` }, { status: 500 })
    }

    // 4. Return Success
    return NextResponse.json({ message: 'Score saved successfully' }, { status: 200 })

  } catch (error: unknown) {
    console.error('[API Save Score] General Error:', error)
    // Handle JSON parsing errors or other unexpected issues
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Bad Request: Invalid JSON format.' }, { status: 400 })
    }
    // Add type checking for Error instance
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 })
  }
} 