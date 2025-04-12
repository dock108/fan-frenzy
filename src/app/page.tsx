'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()

  const dailyChallengeLink = '/daily'

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 bg-gradient-to-b from-white to-gray-100">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-800">SpoilSports</h1>
        <p className="text-lg md:text-xl text-gray-600">
          Test your memory of legendary sports moments.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Daily Challenge Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4">Daily Challenge</h2>
          <p className="text-gray-600 mb-6">A fresh challenge awaits every day. Can you recall the key moments?</p>
          <Link
            href={dailyChallengeLink}
            className={`w-full px-6 py-3 rounded-md text-lg font-semibold text-white transition duration-300 text-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            aria-disabled={loading}
            onClick={(e) => { if (loading) e.preventDefault() }}
          >
            {loading ? 'Loading...' : 'Start Today\'s Challenge'}
          </Link>
        </div>

        {/* Updated: Team Rewind - Now Active */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Team Rewind</h2>
          <p className="text-gray-600 mb-6">Pick a team, pick a game or season, and test your recall.</p>
          <Link
            href="/rewind"
            className="w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 transition duration-300 text-center"
          >
            Select Game
          </Link>
        </div>

        {/* Placeholder: Shuffle Mode */}
        <div className="bg-gray-200 p-6 rounded-lg shadow-sm border border-gray-300 flex flex-col items-center text-center opacity-60">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Shuffle Mode</h2>
          <p className="text-gray-500 mb-6">Put iconic moments in the correct chronological order.</p>
          <button
            disabled
            className="w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-gray-400 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>

    </div>
  );
}
