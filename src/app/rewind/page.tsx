'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext' // To potentially check login status

// Define the expected structure of the game list data
interface GameInfo {
    gameId: string;
    week?: number | string;
    date: string;
    opponent: string;
    result?: string;
}

// Static lists for selectors (replace with dynamic data later)
const TEAMS = ['NE', 'PHI', 'NYJ', 'MIA', 'DAL']; // Add more as needed
const YEARS = [2023, 2022, 2021, 2020]; // Add more as needed

export default function RewindSelectionPage() {
  const { user } = useAuth(); // Check if user is logged in (for future features like progress)
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | '' >('');
  const [games, setGames] = useState<GameInfo[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch games when both team and year are selected
  const fetchGames = useCallback(async () => {
    if (!selectedTeam || !selectedYear) {
        setGames([]); // Clear games if selection is incomplete
        return;
    }

    setIsLoadingGames(true);
    setError(null);
    setGames([]); // Clear previous games

    try {
      const response = await fetch(`/api/getRewindGames?team=${selectedTeam}&year=${selectedYear}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setGames(data as GameInfo[]);
    } catch (err: any) {
      console.error("Failed to fetch games:", err);
      setError(err.message || 'An unknown error occurred while fetching games.');
      setGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  }, [selectedTeam, selectedYear]);

  // Trigger fetchGames when selections change
  useEffect(() => {
    fetchGames();
  }, [fetchGames]); // Dependency array includes the memoized fetchGames function

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Team Rewind Selector</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
        {/* Team Selector */}
        <div>
          <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Team
          </label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>-- Select a Team --</option>
            {TEAMS.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div>
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Year
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : '')}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>-- Select a Year --</option>
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Game List */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Select Game</h2>
        {isLoadingGames && (
          <p className="text-center text-gray-500">Loading games...</p>
        )}
        {error && (
          <p className="text-center text-red-600">Error: {error}</p>
        )}
        {!isLoadingGames && !error && games.length === 0 && selectedTeam && selectedYear && (
            <p className="text-center text-gray-500">No games found for {selectedTeam} {selectedYear}. Check available data.</p>
        )}
         {!isLoadingGames && !error && games.length === 0 && (!selectedTeam || !selectedYear) && (
            <p className="text-center text-gray-400">Please select a team and year to see available games.</p>
        )}
        {!isLoadingGames && !error && games.length > 0 && (
          <ul className="space-y-3">
            {games.map(game => (
              <li key={game.gameId} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                <Link
                  href={`/rewind/play?team=${selectedTeam}&year=${selectedYear}&gameId=${game.gameId}`}
                  className="block group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold text-indigo-600 group-hover:underline">
                           Week {game.week || 'N/A'}: vs {game.opponent}
                        </span>
                        <p className="text-sm text-gray-500">{game.date}</p>
                    </div>
                    {game.result && <span className={`text-sm font-medium px-2 py-1 rounded ${game.result.startsWith('W') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{game.result}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 