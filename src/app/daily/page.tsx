'use client'

import { useAuth } from '@/context/AuthContext'
// import Link from 'next/link' // No longer needed here for login prompt

export default function DailyChallengePage() {
  // We might still use user/loading later for score saving, but don't block render
  const { user, loading } = useAuth()

  // Removed auth/loading checks that blocked rendering or showed login prompt
  // if (loading) { ... }
  // if (!user) { ... }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Daily Challenge</h1>
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Today's Challenge: [Game/Event Name Placeholder]</h2>
        <p className="text-gray-700 mb-6">
          Gameplay for the Daily Challenge will go here. This will involve fetching the day's game data,
          displaying questions, handling user input, and scoring.
        </p>
        {/* Optionally show user status if logged in */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading user status...</p>
        ) : user ? (
          <p className="text-green-600 text-sm">Logged in as {user.email} (Scores will be saved)</p>
        ) : (
          <p className="text-gray-500 text-sm">Log in to save your score!</p>
        )}
        <p className="text-gray-500 mt-4">(Placeholder Page)</p>
        {/* Add placeholder for game components later */}
      </div>
    </div>
  )
} 