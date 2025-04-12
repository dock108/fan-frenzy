'use client'

import React from 'react';

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
  resultCorrectPosition
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

  // Determine border color for Shuffle results
  const getShuffleResultBorder = (): string => {
      if (!resultStatus) return 'border-gray-200';
      switch (resultStatus) {
          case 'correct': return 'border-l-4 border-l-green-500';
          case 'close': return 'border-l-4 border-l-yellow-500';
          case 'far_off': return 'border-l-4 border-l-red-500';
          default: return 'border-gray-200';
      }
  };

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

  const cardBaseClasses = "p-4 rounded border bg-white transition-shadow";
  const draggableClasses = isDraggable ? "shadow border-gray-200" : "shadow-md border border-gray-200";
  const shuffleResultClasses = resultStatus ? getShuffleResultBorder() : '';

  return (
    <div className={`${cardBaseClasses} ${isDraggable ? shuffleResultClasses : draggableClasses} ${disabled && !isRevealed ? 'opacity-70' : ''}`}>
        {displayIndex && totalMoments && (
            <p className="text-sm text-center text-gray-500 mb-3 font-medium">Moment {displayIndex} of {totalMoments}</p>
        )}

      {/* --- Context --- */}
      <p className="text-gray-700 mb-4 italic">
          {context} {resultIsMostImportant && <span title="Most Important Moment">⭐</span>}
      </p>

      {/* --- Multiple Choice Section --- */}
      {question && options && onSelect && (
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

      {/* --- Footer: Importance & Challenge Button --- */}
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200 min-h-[30px]">
        <div title={importanceTooltip}>
            {isRevealed && typeof importance === 'number' && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${importanceStyle.badgeClass} ${importanceStyle.textClass}`}>
                    AI Importance: {importance.toFixed(1)}/10 ({importanceStyle.label})
                </span>
            )}
        </div>
        <div className="flex items-center space-x-2">
            {resultStatus && resultStatus !== 'correct' && typeof resultCorrectPosition === 'number' && (
                <p className="text-xs text-gray-600">Correct: #{resultCorrectPosition}</p>
            )}
            {resultStatus && (
                 <span className="text-lg">
                     {resultStatus === 'correct' ? '✅' : resultStatus === 'close' ? '⚠️' : '❌'}
                 </span>
            )}
            {onChallengeClick && (
                <button
                    onClick={onChallengeClick}
                    className="text-xs text-red-500 hover:text-red-700 border border-red-300 px-2 py-1 rounded hover:bg-red-50 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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