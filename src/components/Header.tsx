'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    // No need to redirect here, context/middleware handles state changes
    // router.push('/')
    // router.refresh()
  }

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          FanFrenzy
        </Link>
        <div className="space-x-4">
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Link href="/daily" className="hover:text-gray-300">
                 Daily
              </Link>
              <Link href="/rewind" className="hover:text-gray-300">
                 Rewind
              </Link>
              <Link href="/shuffle" className="hover:text-gray-300">
                 Shuffle
              </Link>
              <Link href="/leaderboard" className="hover:text-gray-300">
                Leaderboard
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/daily" className="hover:text-gray-300">
                 Daily
              </Link>
               <Link href="/rewind" className="hover:text-gray-300">
                 Rewind
              </Link>
              <Link href="/shuffle" className="hover:text-gray-300">
                 Shuffle
              </Link>
              <Link href="/leaderboard" className="hover:text-gray-300">
                Leaderboard
              </Link>
              <Link href="/login" className="hover:text-gray-300">
                Login / Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
} 