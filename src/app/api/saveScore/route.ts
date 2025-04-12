import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Note: Setting/removing cookies in Route Handlers currently requires
        //       returning a new response object. See docs:
        //       https://supabase.com/docs/guides/auth/server-side/nextjs#setting-cookies-from-server-components
        //       Since we are only reading the session and inserting, we might not need set/remove here.
        // set(name: string, value: string, options: CookieOptions) {
        //   cookieStore.set({ name, value, ...options })
        // },
        // remove(name: string, options: CookieOptions) {
        //   cookieStore.set({ name, value: '', ...options })
        // },
      },
    }
  )

  try {
    // 1. Authentication: Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('[API Save Score] Session Error:', sessionError)
      return NextResponse.json({ message: 'Error getting user session' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized: No active session found.' }, { status: 401 })
    }

    const user = session.user;
    if (!user) {
         return NextResponse.json({ message: 'Unauthorized: User not found in session.' }, { status: 401 })
    }

    // 2. Get Request Body
    const body = await request.json()
    const { gameId, score } = body

    // 3. Validation
    if (!gameId || typeof gameId !== 'string') {
        return NextResponse.json({ message: 'Bad Request: Missing or invalid gameId.' }, { status: 400 })
    }
    if (typeof score !== 'number' || isNaN(score)) {
      return NextResponse.json({ message: 'Bad Request: Missing or invalid score.' }, { status: 400 })
    }

    // 4. Insert into Supabase
    const { error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        game_id: gameId,
        score: score, // Use the validated score from the body
        mode: 'daily-fill-in-reactive', // Match the mode used in frontend
        // created_at is handled by default value in SQL schema
      })

    if (insertError) {
      console.error('[API Save Score] Insert Error:', insertError)
      // Provide more specific errors if needed (e.g., based on insertError.code)
      return NextResponse.json({ message: `Failed to save score: ${insertError.message}` }, { status: 500 })
    }

    // 5. Return Success
    return NextResponse.json({ message: 'Score saved successfully' }, { status: 200 })

  } catch (error: any) {
    console.error('[API Save Score] General Error:', error)
    // Handle JSON parsing errors or other unexpected issues
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Bad Request: Invalid JSON format.' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
} 