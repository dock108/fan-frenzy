import React from 'react';
import { LeaderboardEntry } from '@/pages/api/getLeaderboard';
import { formatDistanceToNow } from 'date-fns';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  currentUserEmail?: string | null; // Changed from ID to email for matching
  rank: number; // Rank passed explicitly
}

// Helper to display user identity (email or fallback)
function displayUser(email: string | null, userId: string): string {
    if (email) {
        const parts = email.split('@');
        if (parts.length === 2) {
            return `${parts[0].substring(0, Math.min(parts[0].length, 8))}...`; // Slightly longer prefix
        }
        return email;
    }
    return `User ...${userId.substring(userId.length - 6)}`;
}

// Helper to get user initials
function getInitials(email: string | null): string {
    if (!email) return '?';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase() || email[0].toUpperCase() || '?';
}

// Helper to display game context based on mode
function displayGameContext(mode: string, gameId: string): string {
    switch (mode) {
        case 'daily':
            try {
                return new Date(gameId + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'});
            } catch { return gameId; } 
        case 'rewind':
        case 'shuffle':
            // Simple formatting: replace dashes with spaces, capitalize
            return gameId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        default:
            return gameId;
    }
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, currentUserEmail, rank }) => {
  const isCurrentUser = entry.email === currentUserEmail;

  const getRankIndicator = (rank: number): React.ReactNode => {
    if (rank === 1) return <span title="1st Place">🥇</span>;
    if (rank === 2) return <span title="2nd Place">🥈</span>;
    if (rank === 3) return <span title="3rd Place">🥉</span>;
    return <span className="text-gray-500 dark:text-gray-400">{rank}</span>;
  };

  const rowClasses = classNames(
    "bg-white dark:bg-gray-800 md:bg-transparent md:dark:bg-transparent", // Base bg, transparent on desktop
    "rounded-lg shadow-sm md:shadow-none", // Card look on mobile, no shadow on desktop
    "border border-gray-200 dark:border-gray-700 md:border-none", // Border on mobile, none on desktop
    "p-3 md:py-3 md:px-4", // Padding for mobile card, adjusted for desktop row
    "grid grid-cols-3 md:grid-cols-12 gap-x-4 md:gap-x-4 items-center", // Grid layout for both
    isCurrentUser ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900 bg-blue-50 dark:bg-blue-900/30 md:bg-blue-50 md:dark:bg-blue-900/30" : "", // Highlight current user
    "md:border-b md:dark:border-gray-700 md:rounded-none" // Bottom border for desktop rows
  );

  return (
    <div className={rowClasses}>
      {/* Rank (Mobile: Top Left, Desktop: Col 1) */}
      <div className="md:col-span-1 font-semibold text-lg md:text-sm text-gray-800 dark:text-gray-100 flex items-center">
        {getRankIndicator(rank)}
      </div>

      {/* User Info (Mobile: Row 1 Center, Desktop: Col 2-6) */}
      <div className="col-span-2 md:col-span-5 flex items-center space-x-3">
        {/* Avatar */} 
        <div className="flex-shrink-0 h-8 w-8 md:h-9 md:w-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-200 overflow-hidden">
          {/* Placeholder logic - replace with actual avatars if available */}
          {/* <UserCircleIcon className="h-full w-full text-gray-400 dark:text-gray-500" /> */} 
          <span>{getInitials(entry.email)}</span>
        </div>
        {/* Name */}
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={entry.email || entry.user_id}>
          {displayUser(entry.email, entry.user_id)}
        </span>
      </div>

      {/* Score (Mobile: Row 2 Left, Desktop: Col 7-8) */}
      <div className="text-left md:text-right md:col-span-2 mt-1 md:mt-0">
          <span className="text-xs text-gray-500 md:hidden mr-1">Score:</span> 
          <span className="font-semibold text-gray-900 dark:text-white">{entry.score}</span>
      </div>

      {/* Game/Date (Mobile: Row 2 Center, Desktop: Col 9-10) */}
      <div className="text-center md:text-left md:col-span-2 text-xs text-gray-500 dark:text-gray-400 mt-1 md:mt-0 truncate" title={entry.game_id}>
        {displayGameContext(entry.mode, entry.game_id)}
      </div>

      {/* Time (Mobile: Row 2 Right, Desktop: Col 11-12) */}
      <div className="text-right md:col-span-2 text-xs text-gray-500 dark:text-gray-400 mt-1 md:mt-0 whitespace-nowrap" title={new Date(entry.created_at).toLocaleString()}>
        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
      </div>
    </div>
  );
};

export default LeaderboardRow; 