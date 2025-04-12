'use client'

import React from 'react';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface MomentCardProps {
  context: string;
  question?: string; // For MC modes
  options?: string[]; // For MC modes
  userGuess?: number | null; // Index of the user\'s selected option (for MC)
  correctAnswer?: number; // Index of the correct option (for MC)
  importance?: number; // Optional importance score (0-10?)
  isRevealed?: boolean; // Whether answers/importance should be shown
  onSelect?: (index: number) => void; // Callback when an option is clicked (for MC)
  onChallengeClick?: () => void; // Callback to open challenge modal
  challengeDisabled?: boolean; // Whether the challenge button should be disabled
  disabled?: boolean; // General disabled state (e.g., for already answered)
  displayIndex?: number; // Optional 1-based index for display (e.g., \"Moment 1 of X\")
  totalMoments?: number; // Optional total moments for display
  isDraggable?: boolean; // Hint for styling if used in DND context
  // Props related to Shuffle Mode results (passed through if needed)
  resultStatus?: 'correct' | 'close' | 'far_off';
  resultIsMostImportant?: boolean;
  resultCorrectPosition?: number;
  // --- NEW: Prop for shuffle context --- //
  isShuffleMode?: boolean;
}

const MomentCard: React.FC<MomentCardProps> = ({
  context,
  question,
  options,
  userGuess,
  correctAnswer,
  importance,
  isRevealed = false,
  onSelect,
  onChallengeClick,
  challengeDisabled = false,
  disabled = false,
  displayIndex,
  totalMoments,
  isDraggable = false,
  resultStatus,
  resultIsMostImportant,
  resultCorrectPosition,
  // --- NEW: Prop for shuffle context --- //
  isShuffleMode = false
}) => {

  const getOptionClasses = (index: number): string => {
    if (!isRevealed) {
      // Before reveal: Highlight selected, standard otherwise
      return userGuess === index
        ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-300'
        : 'bg-white border-gray-300 hover:bg-gray-100';
    }

    // After reveal:
    const isCorrect = index === correctAnswer;
    const isSelected = index === userGuess;

    if (isCorrect) return 'bg-green-100 border-green-400 ring-1 ring-green-400'; // Correct answer
    if (isSelected) return 'bg-red-100 border-red-400 ring-1 ring-red-400'; // Incorrectly selected
    return 'bg-gray-100 border-gray-300 opacity-70'; // Other incorrect options
  };

  // --- UPDATED: Shuffle Result Styling --- //
  const getShuffleResultStyle = (): { borderClass: string; icon: React.ReactNode; bgColorClass: string } => {
      if (!resultStatus) return { borderClass: 'border-gray-200 dark:border-gray-700', icon: null, bgColorClass: 'bg-white dark:bg-gray-800' };
      switch (resultStatus) {
          case 'correct': 
              return { 
                  borderClass: 'border-l-4 border-l-green-500', 
                  icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />, 
                  bgColorClass: 'bg-green-50 dark:bg-green-900/30'
              };
          case 'close': 
              return { 
                  borderClass: 'border-l-4 border-l-yellow-500', 
                  icon: <InformationCircleIcon className="h-5 w-5 text-yellow-500" />, 
                  bgColorClass: 'bg-yellow-50 dark:bg-yellow-900/30'
              };
          case 'far_off': 
              return { 
                  borderClass: 'border-l-4 border-l-red-500', 
                  icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
                  bgColorClass: 'bg-red-50 dark:bg-red-900/30' 
              };
          default: 
              return { borderClass: 'border-gray-200 dark:border-gray-700', icon: null, bgColorClass: 'bg-white dark:bg-gray-800' };
      }
  };
  const shuffleStyle = getShuffleResultStyle();

  // --- NEW: Helper to get Importance styling --- //
  const getImportanceStyle = (score: number | undefined): { badgeClass: string; textClass: string; label: string } => {
    if (typeof score !== 'number') {
      return { badgeClass: 'bg-gray-200', textClass: 'text-gray-800', label: 'N/A' };
    }
    if (score >= 8.0) return { badgeClass: 'bg-red-100', textClass: 'text-red-800', label: 'High' };
    if (score >= 5.0) return { badgeClass: 'bg-yellow-100', textClass: 'text-yellow-800', label: 'Medium' };
    return { badgeClass: 'bg-gray-100', textClass: 'text-gray-700', label: 'Low' };
  };

  const importanceStyle = getImportanceStyle(importance);
  const importanceTooltip = "Calculated based on swing in win probability, game context, and momentum.";

  // Base card classes
  const cardBaseClasses = "p-4 rounded-lg border transition-shadow duration-150 ease-in-out";
  // Conditional classes based on state
  const stateClasses = isDraggable && !resultStatus
      ? 'shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800' // Draggable state
      : resultStatus 
          ? `${shuffleStyle.borderClass} ${shuffleStyle.bgColorClass}` // Result state
          : 'shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'; // Default MC state
  const opacityClass = disabled && !isRevealed ? 'opacity-70' : '';

  return (
     <div className={`${cardBaseClasses} ${stateClasses} ${opacityClass}`}>
        {/* Optional: Display Index for non-shuffle modes */}
        {!isShuffleMode && displayIndex && totalMoments && (
            <p className="text-sm text-center text-gray-500 mb-3 font-medium">Moment {displayIndex} of {totalMoments}</p>
        )}

        {/* --- Context --- */}
        {/* Make context slightly smaller for shuffle mode */}
        <p className={`text-gray-700 dark:text-gray-300 mb-4 italic ${isShuffleMode ? 'text-sm' : ''}`}>
            {context}
            {/* Show most important star only in results */}
            {resultStatus && resultIsMostImportant && <span title="Most Important Moment" className="ml-1">⭐</span>}
        </p>

        {/* --- Multiple Choice Section (Hidden in Shuffle Mode) --- */}
        {!isShuffleMode && question && options && onSelect && (
            <>
              <h2 className={`text-xl font-semibold mb-4 ${disabled ? 'text-gray-600' : 'text-gray-900'}`}>{question}</h2>
              <div className="space-y-3 mb-6">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(index)}
                    disabled={disabled || isRevealed} // Disable if game disabled or answer revealed
                    className={`block w-full text-left p-3 rounded border transition duration-150 ${getOptionClasses(index)} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
        )}

        {/* --- Footer: Importance, Challenge, Shuffle Result --- */}
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200 dark:border-gray-600 min-h-[30px]">
            {/* Importance Score (Show only on reveal if not shuffle) */}
            <div title={importanceTooltip}>
                {(isRevealed || resultStatus) && typeof importance === 'number' && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${importanceStyle.badgeClass} ${importanceStyle.textClass}`}>
                        AI Importance: {importance.toFixed(1)} ({importanceStyle.label})
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {/* Shuffle Result Details */}
                {resultStatus && (
                    <div className="flex items-center space-x-1">
                        {shuffleStyle.icon}
                        {resultStatus !== 'correct' && typeof resultCorrectPosition === 'number' && (
                             <p className="text-xs text-gray-600 dark:text-gray-400">(Correct: #{resultCorrectPosition})</p>
                        )}
                    </div>
                )}
                 {/* Challenge Button */}
                 {onChallengeClick && (
                     <button
                         onClick={onChallengeClick}
                         className="text-xs text-red-500 hover:text-red-700 border border-red-300 dark:border-red-600 dark:hover:border-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={challengeDisabled}
                         title={challengeDisabled ? "Log in to challenge moments" : "Challenge this moment"}
                     >
                         Challenge
                     </button>
                 )}
            </div>
        </div>
    </div>
  );
};

export default MomentCard; 