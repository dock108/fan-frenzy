'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function RewindPlayPage() {
  const searchParams = useSearchParams()

  const team = searchParams.get('team')
  const year = searchParams.get('year')
  const gameId = searchParams.get('gameId')

  if (!team || !year || !gameId) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-600">Error: Missing team, year, or game information.</p>
        <Link href="/rewind" className="text-indigo-600 hover:underline mt-4 block">
          Go back to selection
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Team Rewind - Play</h1>
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Selected Game:</h2>
        <p>Team: {team}</p>
        <p>Year: {year}</p>
        <p>Game ID: {gameId}</p>

        <p className="mt-6 text-gray-700">
          The actual gameplay for Team Rewind will be implemented here.
          This will involve fetching the specific game data (similar to Daily Challenge but based on selection)
          and presenting the moments for the user to recall.
        </p>
        <p className="text-gray-500 mt-4">(Placeholder Page)</p>

         <Link href="/rewind" className="text-indigo-600 hover:underline mt-6 block">
          Select a Different Game
        </Link>
      </div>
    </div>
  )
} 