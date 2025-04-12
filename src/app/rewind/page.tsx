'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import useTeamTheme, { TEAM_THEMES } from '@/hooks/useTeamTheme'
import { ArrowPathIcon } from '@heroicons/react/24/solid'

// Define the expected structure of the game list data
interface GameInfo {
    gameId: string;
    week?: number | string;
    date: string;
    opponent: string;
    result?: string;
}

// Teams will be fetched from hook
// const TEAMS = ['NE', 'PHI', 'NYJ', 'MIA', 'DAL'];
// const YEARS = [2023, 2022, 2021, 2020]; // Remove year selection for now

export default function RewindSelectionPage() {
  const router = useRouter()
  const { availableTeams, setTeamTheme, resetTeamTheme } = useTeamTheme(); // Use theme hook
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  // const [selectedYear, setSelectedYear] = useState<number | '' >(''); // Remove year selection
  const [games, setGames] = useState<GameInfo[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset theme when leaving the page
  useEffect(() => {
    resetTeamTheme(); // Reset theme on initial mount
    return () => resetTeamTheme(); // Reset theme on unmount
  }, [resetTeamTheme]);

  // Fetch games when team is selected (year removed)
  const fetchGames = useCallback(async () => {
    // if (!selectedTeam || !selectedYear) {
    if (!selectedTeam) { // Only check team
        setGames([]); 
        return;
    }

    setIsLoadingGames(true);
    setError(null);
    setGames([]);

    try {
      // Update API call to remove year if necessary, or assume API handles missing year
      const response = await fetch(`/api/getRewindGames?team=${selectedTeam}`); 
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setGames(data as GameInfo[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load game list';
      console.error("Fetch games error:", err);
      setError(message);
      setGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  // }, [selectedTeam, selectedYear]);
  }, [selectedTeam]); // Depend only on team

  // Trigger fetchGames when selections change
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleTeamSelect = (teamCode: string) => {
      setSelectedTeam(teamCode);
      // No need to set theme here, it will be set on the play page
  }

  // Filter out 'default' team from the list to display
  const displayTeams = availableTeams.filter(t => t !== 'default');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Team Rewind</h1>
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-700 dark:text-gray-300">Select Your Team</h2>

      {/* Team Logo Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6 mb-12 max-w-4xl mx-auto">
        {displayTeams.map(teamCode => (
          <button
            key={teamCode}
            onClick={() => handleTeamSelect(teamCode)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              selectedTeam === teamCode
                ? 'border-teamPrimary ring-2 ring-teamPrimary shadow-lg'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md'
            }`}
            aria-label={`Select ${teamCode.toUpperCase()} team`}
          >
            <Image
              // Assume logo path structure
              src={`/images/logos/${teamCode.toUpperCase()}.svg`} // Try SVG first
              alt={`${teamCode.toUpperCase()} Logo`}
              width={80}
              height={80}
              className="mx-auto h-16 w-auto object-contain" // Adjust size as needed
              onError={(e) => { 
                  // Fallback to PNG if SVG fails
                  e.currentTarget.src = `/images/logos/${teamCode.toUpperCase()}.png`; 
              }}
            />
          </button>
        ))}
      </div>

      {/* Game List - Conditionally Rendered */} 
      {selectedTeam && (
          <div className="max-w-3xl mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Select Game for {selectedTeam.toUpperCase()}</h2>
            {isLoadingGames && (
                <div className="flex justify-center items-center py-6">
                    <ArrowPathIcon className="h-6 w-6 text-gray-500 animate-spin mr-2" />
                    <p className="text-center text-gray-500">Loading games...</p>
                </div>
            )}
            {error && (
              <p className="text-center text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">Error: {error}</p>
            )}
            {!isLoadingGames && !error && games.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">No games found for {selectedTeam.toUpperCase()}. Please try another team or check data sources.</p>
            )}
            {!isLoadingGames && !error && games.length > 0 && (
              <ul className="space-y-3">
                {games.map(game => (
                  <li key={game.gameId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-teamPrimary dark:hover:border-teamPrimary transition-all duration-150">
                    <Link
                      // Pass only necessary params - API on play page should fetch based on gameId
                      href={`/rewind/play?gameId=${game.gameId}&team=${selectedTeam}`}
                      className="block group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                            <span className="font-semibold text-teamPrimary group-hover:underline">
                               Week {game.week || 'N/A'}: vs {game.opponent}
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{game.date}</p>
                        </div>
                        {game.result && 
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${game.result.startsWith('W') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                {game.result}
                            </span>
                        }
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
      )}
    </div>
  );
} 