import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from "@/types/supabase"
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  const { data: { session } } = await supabase.auth.getSession();

  // Define public routes (keep definition for reference if needed)
  // const publicRoutes = [\'/daily\', \'/rewind\', \'/rewind/play\', \'/shuffle\', \'/leaderboard\'] 

  const path = req.nextUrl.pathname

  // --- Simplified Logic --- 
  // If trying to access a route that requires auth (e.g., /dashboard) without a session, redirect.
  if (!session && path.startsWith('/dashboard')) { // Check specific protected routes
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If logged in and accessing login/signup, redirect to dashboard.
  if (session && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Otherwise, allow the request to proceed.
  // No need to explicitly check public routes if the default is allow.
  return res 
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
} 