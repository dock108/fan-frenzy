'use client'

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { LeaderboardEntry, LeaderboardResponse } from '@/pages/api/getLeaderboard'; // Import types
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { ArrowPathIcon, UserCircleIcon } from '@heroicons/react/24/solid'; // Import icons
import TransitionLayout from '@/components/layout/TransitionLayout'; // Import TransitionLayout
import LeaderboardRow from '@/components/LeaderboardRow';

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
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
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
        setLeaderboardData(null); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Simple Loading Skeleton/Spinner
  const LoadingState = () => (
      <div className="flex justify-center items-center py-20">
          <ArrowPathIcon className="h-8 w-8 text-gray-500 animate-spin mr-3" />
          <span className="text-gray-500">Loading Leaderboard...</span>
      </div>
  );

  // Improved Error Display
  const ErrorState = ({ message }: { message: string }) => (
       <div className="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg shadow-sm">
           <p className="text-red-600 dark:text-red-300">Error: {message}</p>
       </div>
  );

  // Updated Table/List Renderer (will use LeaderboardRow)
  const renderLeaderboardList = (scores: LeaderboardEntry[]) => {
    if (!scores || scores.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 py-10">No scores recorded for this mode yet.</p>;
    }

    return (
        <div className="space-y-3 md:space-y-0"> {/* Remove spacing on desktop, rely on row borders */}
            {/* Header Row (visible on md+) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">User</div>
                <div className="col-span-2 text-right">Score</div>
                <div className="col-span-2">Game/Date</div>
                <div className="col-span-2 text-right">Time</div>
            </div>
            {/* Map scores to LeaderboardRow */}
            {scores.map((entry, index) => (
                 <LeaderboardRow 
                     key={entry.id}
                     entry={entry}
                     rank={entry.score_position} // Use score_position provided by API
                     currentUserEmail={user?.email} // Pass current user's email
                 />
            ))}
        </div>
    );
  };

  return (
    <TransitionLayout transitionMode="fade">
        <div className="container mx-auto p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Leaderboard</h1>

          {/* Loading State */}
          {isLoading && <LoadingState />} 

          {/* Error State */}
          {!isLoading && error && <ErrorState message={error} />} 

          {/* Content State */}
          {!isLoading && !error && leaderboardData && (
            <Tab.Group>
              {/* Styled Tabs */}
              <Tab.List className="flex justify-center space-x-2 sm:space-x-4 rounded-xl mb-6">
                {Object.keys(leaderboardData).map((mode) => (
                  <Tab
                    key={mode}
                    className={({ selected }) =>
                      classNames(
                        'w-full max-w-[120px] sm:max-w-[150px] rounded-md px-3 py-2 text-sm font-medium leading-5 transition-colors duration-150',
                        'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 dark:ring-offset-gray-900 ring-blue-500',
                        selected
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      )
                    }
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} 
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-2">
                {Object.entries(leaderboardData).map(([_mode, scores], idx) => (
                  <Tab.Panel
                    key={idx}
                    className={classNames(
                      'rounded-xl focus:outline-none'
                    )}
                  >
                    {renderLeaderboardList(scores)}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          )}

          {!isLoading && !error && !leaderboardData && (
              <p className="text-center text-gray-500 py-10">Leaderboard data could not be loaded or is empty.</p>
          )}
        </div>
    </TransitionLayout>
  );
} 