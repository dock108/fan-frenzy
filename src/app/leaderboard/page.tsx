'use client'

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { LeaderboardEntry, LeaderboardResponse } from '@/pages/api/getLeaderboard'; // Import types
import { formatDistanceToNow } from 'date-fns'; // For relative time

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Helper to display user identity (email or fallback)
function displayUser(email: string | null, userId: string): string {
    if (email) {
        // Basic anonymization: show part before @ and the domain initial
        const parts = email.split('@');
        if (parts.length === 2) {
            return `${parts[0].substring(0, Math.min(parts[0].length, 5))}...@${parts[1][0]}...`;
        }
        return email; // Fallback if format is unexpected
    }
    // Fallback to showing part of the user ID
    return `User ...${userId.substring(userId.length - 6)}`;
}

// Helper to display game context based on mode
function displayGameContext(mode: string, gameId: string): string {
    switch (mode) {
        case 'daily':
            // Assuming daily uses date as gameId YYYY-MM-DD
            try {
                return new Date(gameId + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'});
            } catch { return gameId; } // Fallback
        case 'rewind':
        case 'shuffle':
            // Use gameId directly or potentially lookup a friendly name if available later
            return gameId;
        default:
            return gameId;
    }
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/getLeaderboard');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch leaderboard data');
        }
        setLeaderboardData(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const renderLeaderboardTable = (scores: LeaderboardEntry[]) => {
    if (!scores || scores.length === 0) {
      return <p className="text-center text-gray-500 py-6">No scores recorded for this mode yet.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game/Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scores.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.score_position}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700" title={entry.email || entry.user_id}>{displayUser(entry.email, entry.user_id)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{entry.score}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{displayGameContext(entry.mode, entry.game_id)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500" title={new Date(entry.created_at).toLocaleString()}>
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Leaderboards</h1>

      {leaderboardData ? (
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6 max-w-md mx-auto">
            {Object.keys(leaderboardData).map((mode) => (
              <Tab
                key={mode}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)} {/* Capitalize mode name */}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2">
            {Object.entries(leaderboardData).map(([_mode, scores], idx) => (
              <Tab.Panel
                key={idx}
                className={classNames(
                  'rounded-xl bg-white p-3 shadow',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                {renderLeaderboardTable(scores)}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      ) : (
        <p className="text-center text-gray-500 py-6">Leaderboard data could not be loaded.</p>
      )}
    </div>
  );
} 