'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// Define expected data structures (should match API response)
interface MomentBase { index: number; type: 'start' | 'fill-in' | 'end'; }
interface StartEndMoment extends MomentBase { type: 'start' | 'end'; context: string; }
interface FillInMoment extends MomentBase { type: 'fill-in'; prompt: string; answer: string; importance: number; }
type Moment = StartEndMoment | FillInMoment;
interface GameData {
    event_data: any;
    key_moments: Moment[];
}

export default function RewindPlayPage() {
  const searchParams = useSearchParams()
  const team = searchParams.get('team')
  const year = searchParams.get('year')
  const gameId = searchParams.get('gameId')

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (!team || !year || !gameId) {
          setError('Missing team, year, or game information in URL.');
          setIsLoading(false);
          return;
      }

      const fetchGame = async () => {
          setIsLoading(true);
          setError(null);
          try {
              const response = await fetch(`/api/fetchGame?team=${team}&year=${year}&gameId=${gameId}`);
              const data = await response.json();
              if (!response.ok) {
                  throw new Error(data.message || `HTTP error! Status: ${response.status}`);
              }
              setGameData(data as GameData);
          } catch (err: any) {
              console.error("Failed to fetch game data:", err);
              setError(err.message || 'An unknown error occurred.');
              setGameData(null);
          } finally {
              setIsLoading(false);
          }
      };

      fetchGame();

  }, [team, year, gameId]); // Re-fetch if params change

  // Render loading state
  if (isLoading) {
      return (
          <div className="container mx-auto p-4 text-center">
              <p>Loading game data for {gameId}...</p>
          </div>
      )
  }

  // Render error state
  if (error) {
      return (
          <div className="container mx-auto p-4 text-center">
              <p className="text-red-600">Error: {error}</p>
              <Link href="/rewind" className="text-indigo-600 hover:underline mt-4 block">
                  Go back to selection
              </Link>
          </div>
      )
  }

  // Render game content (Placeholder for actual gameplay UI)
  if (!gameData) {
      // Should be covered by error state, but as a fallback
       return (
          <div className="container mx-auto p-4 text-center">
              <p className="text-gray-500">Game data could not be loaded.</p>
              <Link href="/rewind" className="text-indigo-600 hover:underline mt-4 block">
                  Go back to selection
              </Link>
          </div>
      )
  }

  // --- Placeholder Gameplay UI --- 
  // Replace this section with the actual game component later
  // For now, just display the fetched data structure
  const startMoment = gameData.key_moments.find(m => m.type === 'start');
  const endMoment = gameData.key_moments.find(m => m.type === 'end');
  const fillInMoments = gameData.key_moments.filter(m => m.type === 'fill-in');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Team Rewind - {gameId}</h1>
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Gameplay Area</h2>
          <p className="text-center text-gray-500 mb-4">(Actual game UI to be implemented here)</p>

          {/* Display fetched data for verification */}
          <div className="mt-6 p-4 bg-gray-50 rounded border text-sm text-gray-700 space-y-2">
              <p className="font-semibold">Data Fetched:</p>
              {startMoment && <p>Start Context: {startMoment.context}</p>}
              <p>Fill-in Moments: {fillInMoments.length}</p>
              {endMoment && <p>End Context: {endMoment.context}</p>}
              <p>Event Data Summary: {JSON.stringify(gameData.event_data?.summary || 'N/A')}</p>
              {/* <pre className="text-xs bg-gray-100 p-2 overflow-x-auto">{JSON.stringify(gameData, null, 2)}</pre> */} 
          </div>

         <Link href="/rewind" className="text-indigo-600 hover:underline mt-6 block text-center">
          Select a Different Game
        </Link>
      </div>
    </div>
  )
} 