'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
    DragDropContext, 
    Droppable, 
    Draggable, 
    DropResult, 
    DroppableProvided, 
    DraggableProvided, 
    DraggableStateSnapshot, 
} from '@hello-pangea/dnd';
import ResultsModal from './ResultsModal';
import SocialShareButtons from './SocialShareButtons';
import { LockClosedIcon } from '@heroicons/react/20/solid';

interface Moment {
  index: number;
  type: 'start' | 'moment' | 'end';
  text?: string;
  context?: string;
  importance?: number;
}

interface DailyOrderingGameProps {
  title: string;
  questions: Moment[];
}

const DailyOrderingGame: React.FC<DailyOrderingGameProps> = ({ title, questions }) => {
  const startMoment = questions.find(q => q.type === 'start');
  const endMoment = questions.find(q => q.type === 'end');
  const initialOrderableMoments = useMemo(() => 
    questions.filter(q => q.type === 'moment').sort(() => Math.random() - 0.5), 
    [questions]
  );
  const momentCount = initialOrderableMoments.length;
  const maxScore = momentCount * 4;

  const [orderableMoments, setOrderableMoments] = useState<Moment[]>(initialOrderableMoments);
  const [isGuessSubmitted, setIsGuessSubmitted] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chances State
  const [guessesRemaining, setGuessesRemaining] = useState(3);
  const [lockedItems, setLockedItems] = useState<Set<number>>(new Set());
  const [lastGuessScores, setLastGuessScores] = useState<{ [momentIndex: number]: number }>({});
  
  // Timer State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalId = useRef<NodeJS.Timeout | null>(null);

  // Add hasDragged state
  const [hasDragged, setHasDragged] = useState(false);

  // Format Time Helper
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Timer Start Logic
  const onDragStart = () => {
    if (!startTime && !showFinalResults) {
      const now = Date.now();
      setStartTime(now);
      setElapsedTime(0);
      if (timerIntervalId.current) clearInterval(timerIntervalId.current);
      timerIntervalId.current = setInterval(() => {
        if(timerIntervalId.current) { 
             setElapsedTime(Math.floor((Date.now() - now) / 1000));
        }
      }, 1000);
    }
  };

  // Timer Stop & Cleanup Logic
  const stopTimer = useCallback(() => {
    if (timerIntervalId.current) {
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
    }
    if (startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }
  }, [startTime]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Updated Drag End Logic
  const onDragEnd = (result: DropResult) => {
     if (showFinalResults) return; 
     if (!result.destination || result.destination.index === result.source.index) return; 
     
     const items = Array.from(orderableMoments);
     const [reorderedItem] = items.splice(result.source.index, 1);
     
     if (lockedItems.has(reorderedItem.index)) return; 
     
     items.splice(result.destination.index, 0, reorderedItem);
     setOrderableMoments(items);
     setIsGuessSubmitted(false);
     setLastGuessScores({});
     setHasDragged(true);
  };

  // Score Calculation Helper
  const calculateItemScore = (userIndex: number, currentOrder: Moment[]): number => {
      const currentItem = currentOrder[userIndex];
      if (!currentItem) return 0;

      const correctItemIndex = currentItem.index; 
      let itemScore = 0;

      // Check item above (+1 pt)
      if (userIndex === 0) {
          if (startMoment && correctItemIndex === 1) itemScore += 1; 
      } else { 
          const itemAboveUser = currentOrder[userIndex - 1];
          if (itemAboveUser?.index === correctItemIndex - 1) itemScore += 1;
      }
      // Check item below (+1 pt)
      if (userIndex === currentOrder.length - 1) {
          if (endMoment && correctItemIndex === momentCount) itemScore += 1; 
      } else { 
          const itemBelowUser = currentOrder[userIndex + 1];
          if (itemBelowUser?.index === correctItemIndex + 1) itemScore += 1;
      }
      // Check correct spot (+2 pts)
      if (correctItemIndex === userIndex + 1) itemScore += 2;
      return itemScore;
  };

  // Submit Guess Logic
  const handleSubmit = () => {
    if (showFinalResults || isGuessSubmitted) return;

    let calculatedScore = 0;
    const currentGuessScores: { [momentIndex: number]: number } = {};
    const newlyLocked = new Set<number>(lockedItems);

    for (let userIndex = 0; userIndex < orderableMoments.length; userIndex++) {
      const item = orderableMoments[userIndex];
      const itemScore = calculateItemScore(userIndex, orderableMoments);
      currentGuessScores[item.index] = itemScore;
      calculatedScore += itemScore;
      if (itemScore === 4) newlyLocked.add(item.index);
    }

    setScore(calculatedScore);
    setLastGuessScores(currentGuessScores);
    setLockedItems(newlyLocked);
    setIsGuessSubmitted(true);
    const nextGuessesRemaining = guessesRemaining - 1;
    setGuessesRemaining(nextGuessesRemaining);

    const isPerfectScore = calculatedScore === maxScore;
    setIsCorrect(isPerfectScore);

    if (isPerfectScore || nextGuessesRemaining <= 0) {
      setShowFinalResults(true);
      setIsModalOpen(true);
      stopTimer(); 
    } else {
      setShowFinalResults(false);
    }
  };

  // Modal Close Handler
  const handleCloseModal = () => setIsModalOpen(false);

  // --- Corrected JSX Structure --- 
  return (
    <> 
        {/* This div contains the main game elements, styled by DailyPage */} 
        {/* The outer grid and scoring guide are handled by the parent DailyPage */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Start Context */} 
            {startMoment && (
              <div className="p-3 bg-gray-100 rounded text-center border border-gray-200">
                <p className="text-sm text-gray-600 italic">{startMoment.context}</p>
              </div>
            )}

            {/* Drag and Drop Area */} 
            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <Droppable droppableId="moments" isDropDisabled={showFinalResults}>
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {orderableMoments.map((moment, idx) => {
                        const isLocked = lockedItems.has(moment.index);
                        const currentItemScore = isGuessSubmitted ? lastGuessScores[moment.index] ?? -1 : -1; 
                        const isFinal = showFinalResults;
                        const finalItemScore = isFinal ? calculateItemScore(idx, orderableMoments) : -1; 
                        return (
                            <Draggable 
                                key={moment.index.toString()} 
                                draggableId={moment.index.toString()} 
                                index={idx}
                                isDragDisabled={isLocked || isFinal}
                            >
                              {(providedDraggable: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                  const baseClasses = "p-3 border rounded flex justify-between items-center transition-colors duration-150";
                                  const draggingClasses = snapshot.isDragging ? 'shadow-lg opacity-80' : '';
                                  let stateClasses = '';
                                  let glowClasses = '';
                                  if (isLocked) {
                                    stateClasses = 'bg-green-100 border-green-400 cursor-not-allowed'; 
                                  } else if (isFinal) {
                                      stateClasses = 
                                        finalItemScore === 0 ? 'bg-red-50 border-red-300' :
                                        finalItemScore <= 3 ? 'bg-yellow-50 border-yellow-300' : 
                                        'bg-green-100 border-green-300';
                                  } else if (isGuessSubmitted) {
                                      stateClasses = 'bg-gray-100 border-gray-300';
                                      if (currentItemScore === 2 || currentItemScore === 3) {
                                          glowClasses = 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-100';
                                      }
                                  } else {
                                      stateClasses = 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-grab'; 
                                  }
                                  const textScoreClasses = isLocked ? 'text-green-800 font-medium' : 'text-gray-800';
                                  const badgeClasses = isFinal ? 
                                        (finalItemScore <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-300 text-green-800') : 
                                        'bg-gray-100 text-gray-800';

                                  return (
                                      <div
                                        ref={providedDraggable.innerRef}
                                        {...providedDraggable.draggableProps}
                                        {...providedDraggable.dragHandleProps}
                                        style={providedDraggable.draggableProps.style}
                                        className={`${baseClasses} ${draggingClasses} ${stateClasses} ${glowClasses}`}
                                      >
                                        {isLocked && (
                                            <LockClosedIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" aria-hidden="true" />
                                        )}
                                        <div className="flex-grow pr-2">
                                            <p className={`text-sm ${textScoreClasses}`}>{moment.text}</p>
                                            {isFinal && !isLocked && finalItemScore < 4 && (
                                                <p className="text-xs text-gray-500 mt-1">(Correct position: {moment.index})</p>
                                            )}
                                        </div>
                                        {isFinal && (
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeClasses}`}>
                                                +{finalItemScore} pts
                                            </span>
                                        )}
                                      </div>
                                  ); 
                              }} 
                            </Draggable>
                          ); 
                    })}
                    {provided.placeholder} 
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {/* End Context */} 
            {endMoment && (
              <div className="p-3 bg-gray-100 rounded text-center border border-gray-200">
                <p className="text-sm text-gray-600 italic">{endMoment.context}</p>
              </div>
            )}

            {/* Submit Button & Feedback Area */} 
            <div className="pt-4 border-t border-gray-200 text-center">
              {!showFinalResults ? (
                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isGuessSubmitted || !hasDragged} 
                  >
                    Guess ({guessesRemaining} Remaining)
                  </button>
                  {!hasDragged && !isGuessSubmitted && (
                       <p className="text-xs text-gray-500 italic">(Drag an item to enable guessing)</p>
                  )}
                  {isGuessSubmitted && (
                    <p className="text-sm text-gray-600">(Reorder items or wait for final guess)</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                    {isCorrect ? (
                        <p className="text-lg font-semibold text-green-600">
                            Perfect Order!
                            {guessesRemaining === 2 ? (
                                ` (${formatTime(elapsedTime)} on first guess)`
                            ) : (
                                ` (in ${3 - guessesRemaining} guesses)`
                            )}
                        </p>
                    ) : (
                        <p className="text-lg font-semibold text-orange-600">Game Over!</p>
                    )}
                    <p className="text-2xl font-bold text-gray-800">
                         Final Score: {score} / {maxScore}
                    </p>
                    <SocialShareButtons score={score} maxScore={maxScore} title={title} />
                     <button
                         onClick={() => setIsModalOpen(true)}
                         className="mt-3 text-xs text-gray-500 hover:underline"
                     >
                         (Show Results Pop-up)
                     </button>
                </div>
              )}
            </div>
        </div>

        {/* Results Modal */} 
        <ResultsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            score={score}
            maxScore={maxScore}
            title={title} 
            isPerfect={isCorrect}
            elapsedTime={isCorrect && guessesRemaining === 2 ? elapsedTime : undefined}
            guessesTaken={isCorrect ? 3 - guessesRemaining : undefined}
        />
    </> 
  );
};

export default DailyOrderingGame;
