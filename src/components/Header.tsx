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
          SpoilSports
        </Link>
        <div className="space-x-4">
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-gray-300">
              Login / Sign Up
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
} 