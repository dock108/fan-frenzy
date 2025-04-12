'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { useAuth } from '@/context/AuthContext'
import MomentCard from '@/components/MomentCard'
import ChallengeModal from '@/components/ChallengeModal'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowPathIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import TransitionLayout from '@/components/layout/TransitionLayout'
import useTeamTheme from '@/hooks/useTeamTheme'
import Link from 'next/link'

// Define expected data structures (can be shared)
interface MomentBase { index: number; type: 'start' | 'mc' | 'end' | 'shuffle-item'; } // Added shuffle-item type
interface MultipleChoiceMoment extends MomentBase { // Reusing MC type for shuffle context
    type: 'mc' | 'shuffle-item';
    context: string;
    question?: string; // Make optional if not always present
    options?: string[];
    answer?: number;
    explanation?: string;
    importance?: number;
}
type Moment = MultipleChoiceMoment; // For shuffle, we primarily care about context/index
interface EventData { // Define a basic type for event_data if needed
    shortName?: string;
    date?: string;
    // Add other relevant fields if available/used
}
interface GameData {
    event_data: EventData | null; // Use defined type
    key_moments: MultipleChoiceMoment[];
    game_id?: string; // Ensure game_id is part of fetched data if needed elsewhere
}

// --- NEW: Result Status Type --- //
type ResultStatus = 'correct' | 'close' | 'far_off';
interface ShuffleResult {
  status: ResultStatus;
  isMostImportant: boolean;
  correctPosition: number; // Store the correct 1-based index for display
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- NEW: Context Sanitizer Function --- //
function sanitizeContextForShuffle(context: string): string {
    if (!context) return '';
    let sanitized = context;
    // Remove scores (e.g., Score: X-Y, leads X-Y, tied X-X)
    sanitized = sanitized.replace(/score:?\s*\d+\s*[-–—]\s*\d+/gi, '(Score Hidden)');
    sanitized = sanitized.replace(/(?:leads?|trails?|tied)\s*\d+\s*[-–—]\s*\d+/gi, '(Score Hidden)');
    // Remove explicit time remaining (e.g., X minutes/seconds left, MM:SS)
    sanitized = sanitized.replace(/\d+\s*(?:minutes?|seconds?|mins?|secs?)\s*left/gi, '(Time Hidden)');
    sanitized = sanitized.replace(/\b\d{1,2}:\d{2}\b/g, '(Time Hidden)'); // MM:SS format
    // Remove quarters/innings (e.g., Q1, Top/Bottom Xth, Mid-Xth quarter/inning)
    sanitized = sanitized.replace(/\bQ[1-4]\b/gi, '(Period Hidden)');
    sanitized = sanitized.replace(/\b(?:Top|Bottom|Mid)[-\s]?\d+(?:st|nd|rd|th)?\s*(?:inning|quarter)?/gi, '(Period Hidden)');
    sanitized = sanitized.replace(/\b\d+(?:st|nd|rd|th)\s*(?:quarter|inning)/gi, '(Period Hidden)');
    // Remove field position/yard lines
    sanitized = sanitized.replace(/\b(?:at|on|to|near)\s+(?:the\s+)?(?:own\s+|opponent's\s+)?(\d{1,2}[-\s]?yard\s+line|goal\s+line|midfield|\d{1,2})\b/gi, '(Field Position Hidden)');
    sanitized = sanitized.replace(/\b(\d{1,2}[-\s]?yard\s+line|goal\s+line|midfield)\b/gi, '(Field Position Hidden)');
    // Remove start/end markers if they exist from AI generation
    sanitized = sanitized.replace(/^START:\s*/i, '').replace(/\s*END:?$/i, '');
    // Replace multiple hidden markers with one - CORRECTED REGEX LITERAL
    sanitized = sanitized.replace(/\((\w+\sHidden)\)(\s*\(\w+\sHidden\))+/g, '(Info Hidden)');

    return sanitized.trim() || "(Context Details Hidden)"; // Fallback if everything is removed
}

// Hardcoded game for Shuffle Mode demo
const SHUFFLE_GAME_ID = 'rutgers-vs-louisville-2006';
const SHUFFLE_TEAM = 'RUTG';
const SHUFFLE_YEAR = '2006';

// --- Component --- //
export default function ShuffleModePage() {
    const { user } = useAuth();
    const { setTeamTheme, resetTeamTheme } = useTeamTheme();
    const [originalMoments, setOriginalMoments] = useState<MultipleChoiceMoment[]>([]);
    const [shuffledMoments, setShuffledMoments] = useState<MultipleChoiceMoment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasDragged, setHasDragged] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<ShuffleResult[] | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [gameInfo, setGameInfo] = useState<string | null>(null);
    const [mostImportantBonusApplied, setMostImportantBonusApplied] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [hasAttemptedSave, setHasAttemptedSave] = useState<boolean>(false);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
    const [momentToChallenge, setMomentToChallenge] = useState<Moment | null>(null);

    useEffect(() => {
        setTeamTheme(SHUFFLE_TEAM);
        return () => resetTeamTheme();
    }, [setTeamTheme, resetTeamTheme]);

    // Fetch Game Data
    useEffect(() => {
        const fetchGameForShuffle = async () => {
            setIsLoading(true);
            setError(null);
            setHasDragged(false);
            setResults(null);
            setScore(null);
            setIsSubmitting(false);
            setGameInfo(null);
            setMostImportantBonusApplied(false);
            setIsSaving(false);
            setSaveSuccess(null);
            setSaveError(null);
            setHasAttemptedSave(false);
            setIsChallengeModalOpen(false);
            setMomentToChallenge(null);

            try {
                const response = await fetch(`/api/fetchGame?team=${SHUFFLE_TEAM}&year=${SHUFFLE_YEAR}&gameId=${SHUFFLE_GAME_ID}`);
                const data: GameData = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! Status: ${response.status}`);
                }

                if (!data || !data.key_moments || !Array.isArray(data.key_moments) || data.key_moments.length === 0) {
                    throw new Error('No valid moments found for shuffle mode.');
                }

                const validMoments = data.key_moments
                    .filter((m): m is MultipleChoiceMoment =>
                        m.type === 'mc' && typeof m.context === 'string' && typeof m.index === 'number'
                    )
                    .map((m) => ({ 
                        ...m, 
                        type: 'shuffle-item', 
                        importance: m.importance ?? 0,
                        context: sanitizeContextForShuffle(m.context)
                    }));

                if (validMoments.length < 2) {
                    throw new Error('Not enough moments with context found for shuffle mode.');
                }

                setOriginalMoments(validMoments.sort((a, b) => a.index - b.index));
                setShuffledMoments(shuffleArray(validMoments));

                if (data.event_data && data.event_data.shortName) {
                    let displayDate = '';
                    if (data.event_data.date) {
                        try {
                            displayDate = new Date(data.event_data.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                        } catch (e) { /* Ignore date parsing errors */ }
                    }
                    setGameInfo(`${data.event_data.shortName}${displayDate ? ` (${displayDate})` : ''}`);
                } else {
                    setGameInfo("Game details unavailable");
                }

            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                console.error("Failed to fetch/process game data for shuffle:", err);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameForShuffle();
    }, []);

    // Handle Drag End
    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const items = Array.from(shuffledMoments);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        setShuffledMoments(items);
        setHasDragged(true);
        setResults(null);
        setScore(null);
        setMostImportantBonusApplied(false);
        setHasAttemptedSave(false);
        setSaveSuccess(null);
        setSaveError(null);
        setIsChallengeModalOpen(false);
        setMomentToChallenge(null);
    };

    // --- NEW: Function to save score --- //
    const saveScoreToDb = useCallback(async (calculatedScore: number, resultDetails: ShuffleResult[]) => {
        if (!user || hasAttemptedSave || !calculatedScore) return;

        setIsSaving(true);
        setSaveSuccess(null);
        setSaveError(null);
        setHasAttemptedSave(true);

        const payload = {
            gameId: SHUFFLE_GAME_ID,
            score: calculatedScore,
            totalMoments: originalMoments.length,
            correctPositions: resultDetails.filter(r => r.status === 'correct').length,
            bonusEarned: mostImportantBonusApplied,
        };

        try {
            const response = await fetch('/api/saveShuffleScore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save score');
            }

            setSaveSuccess(true);
            console.log("Shuffle score saved successfully.");

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not save score';
            console.error("Error saving shuffle score:", err);
            setSaveError(message);
            setSaveSuccess(false);
        } finally {
            setIsSaving(false);
        }
    }, [user, hasAttemptedSave, originalMoments.length, mostImportantBonusApplied]);

    // --- UPDATED: Handle Submission with New Scoring Logic --- //
    const handleSubmitOrder = () => {
        if (!originalMoments.length) return;
        setIsSubmitting(true);

        let currentScore = 0;
        let bonusApplied = false;

        const mostImportantMomentIndex = originalMoments.reduce((maxIndex, moment, currentIndex, arr) => {
            return (moment.importance ?? 0) > (arr[maxIndex].importance ?? 0) ? currentIndex : maxIndex;
        }, 0);
        const mostImportantMomentId = originalMoments[mostImportantMomentIndex]?.index;

        const newResults: ShuffleResult[] = shuffledMoments.map((userMoment, userIndex) => {
            const correctIndex = originalMoments.findIndex(om => om.index === userMoment.index);
            const diff = Math.abs(userIndex - correctIndex);
            const isMostImportant = userMoment.index === mostImportantMomentId;
            let status: ResultStatus = 'far_off';

            if (diff === 0) {
                status = 'correct';
                currentScore += 10;
                if (isMostImportant) {
                    currentScore += 5;
                    bonusApplied = true;
                }
            } else if (diff <= 2) {
                status = 'close';
            } else {
                status = 'far_off';
                currentScore -= 2;
            }

            return {
                status: status,
                isMostImportant: isMostImportant,
                correctPosition: correctIndex + 1
            };
        });

        const finalScore = Math.max(0, currentScore);
        setResults(newResults);
        setScore(finalScore);
        setMostImportantBonusApplied(bonusApplied);

        console.log("Scoring Results:", newResults, "Score:", finalScore, "Bonus Applied:", bonusApplied);
        setIsSubmitting(false);

        if (user) {
            saveScoreToDb(finalScore, newResults);
        } else {
            setHasAttemptedSave(true);
        }
    };

    // --- UPDATED: Challenge Modal Handlers --- //
    const openChallengeModal = (moment: Moment) => {
        const original = originalMoments.find(om => om.index === moment.index);
        setMomentToChallenge(original || moment);
        setIsChallengeModalOpen(true);
    };

    const closeChallengeModal = () => {
        setIsChallengeModalOpen(false);
        setMomentToChallenge(null);
    };

    const handleChallengeSuccess = () => {
        toast.success('Challenge submitted successfully!');
        closeChallengeModal();
    };

    // --- Render Logic --- //
    if (isLoading) {
        return (
            <TransitionLayout transitionMode="fade">
                <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
                    <ArrowPathIcon className="h-10 w-10 text-gray-500 animate-spin mr-3" />
                    Loading Shuffle Mode...
                </div>
            </TransitionLayout>
        );
    }

    if (error) {
        return (
            <TransitionLayout transitionMode="fade">
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-center px-4">
                    <XCircleIcon className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Shuffle</h2>
                    <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </TransitionLayout>
        );
    }

    if (!originalMoments.length) {
        return (
            <TransitionLayout transitionMode="fade">
                <div className="flex items-center justify-center min-h-[calc(100vh-128px)] text-gray-500">
                    No moments available for this game.
                </div>
            </TransitionLayout>
        );
    }

    const accentColor = "var(--team-primary, #8b5cf6)";
    const accentBgColor = "var(--team-primary-bg, bg-purple-600)";
    const accentHoverBgColor = "var(--team-primary-hover-bg, hover:bg-purple-700)";

    return (
        <TransitionLayout transitionMode="slide-up">
            <div className="relative min-h-[calc(100vh-64px)] py-8 px-4 flex flex-col items-center justify-start overflow-hidden">
                <div 
                    className={`absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900/30 z-0 opacity-70`}
                >
                    <div className="absolute inset-0 bg-[url('/images/timeline-blur.svg')] bg-cover bg-center opacity-10 dark:opacity-5"></div> 
                </div>

                <div className="relative z-10 w-full max-w-3xl mx-auto">
                    <Toaster position="top-center" />
                    
                    <div className="sticky top-[64px] bg-background/80 dark:bg-gray-900/80 backdrop-blur-md py-4 mb-6 z-20 rounded-b-lg shadow-sm border-b border-gray-200 dark:border-gray-700 px-4">
                         <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">
                             Shuffle Mode
                         </h1>
                         <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                             {gameInfo || 'Arrange the moments in chronological order'}
                         </p>
                         {!results && (
                            <p className="text-center text-purple-600 dark:text-purple-400 font-medium">
                                Arrange the moments below in the correct order.
                            </p>
                         )}
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="moments">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-4 mb-8"
                                >
                                    {shuffledMoments.map((moment, index) => (
                                        <Draggable key={moment.index.toString()} draggableId={moment.index.toString()} index={index}>
                                            {(providedDraggable: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                <div
                                                    ref={providedDraggable.innerRef}
                                                    {...providedDraggable.draggableProps}
                                                    {...providedDraggable.dragHandleProps}
                                                    style={{
                                                         ...providedDraggable.draggableProps.style,
                                                         boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
                                                         outline: snapshot.isDragging ? `2px solid ${accentColor}` : 'none',
                                                         outlineOffset: '2px',
                                                         borderRadius: '0.5rem',
                                                    }}
                                                    className={`transition-shadow duration-150 ease-in-out ${results ? 'cursor-default' : 'cursor-grab'}`}
                                                >
                                                    <MomentCard
                                                        moment={moment}
                                                        isShuffleMode={true}
                                                        isDraggable={true}
                                                        isRevealed={results !== null}
                                                        resultStatus={results ? results[index]?.status : undefined}
                                                        resultIsMostImportant={results ? results[index]?.isMostImportant : undefined}
                                                        resultCorrectPosition={results ? results[index]?.correctPosition : undefined}
                                                        onChallengeClick={results ? () => openChallengeModal(moment) : undefined}
                                                        challengeDisabled={!user}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {/* Submit Button & Results */} 
                    <div className="max-w-2xl mx-auto text-center">
                        <button
                            onClick={handleSubmitOrder}
                            disabled={!hasDragged || isSubmitting || results !== null} // Disable if not dragged, submitting, or already submitted
                            className="px-8 py-3 rounded-md text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
                        >
                            {isSubmitting ? 'Checking...' : (results ? 'Order Submitted' : 'Submit Order')}
                        </button>

                        {results && score !== null && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-center">
                                <h3 className="text-xl font-semibold mb-2">Results</h3>
                                <p className="text-3xl font-bold text-blue-700 mb-2">Score: {score}</p>
                                <p className="text-sm text-gray-700 mb-1">
                                    {results.filter(r => r.status === 'correct').length} correct, {results.filter(r => r.status === 'close').length} close, {results.filter(r => r.status === 'far_off').length} far off.
                                </p>
                                {mostImportantBonusApplied && (
                                     <p className="text-sm font-semibold text-purple-700 mb-3">+5 bonus for correctly placing the most important moment! ⭐</p>
                                )}
                                 <div className="mt-3 text-sm">
                                    {!user && hasAttemptedSave && (
                                        <p className="text-gray-600">(Log in to save your score)</p>
                                    )}
                                    {user && isSaving && (
                                        <p className="text-blue-600 animate-pulse">Saving score...</p>
                                    )}
                                    {user && saveSuccess === true && (
                                        <p className="text-green-600 font-semibold">Score saved successfully!</p>
                                    )}
                                    {user && saveSuccess === false && (
                                        <p className="text-red-600">Could not save score. {saveError ? `(${saveError})` : 'Please try again later.'}</p>
                                    )}
                                </div>
                                 <button 
                                    onClick={() => window.location.reload()} // Simple reset for now
                                    className="mt-4 text-sm text-indigo-600 hover:underline"
                                >
                                    Play Again?
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- Render Challenge Modal --- */}
                    {momentToChallenge && gameInfo && (
                         <ChallengeModal
                            isOpen={isChallengeModalOpen}
                            onClose={closeChallengeModal}
                            gameId={SHUFFLE_GAME_ID}
                            momentIndex={momentToChallenge.index}
                            onSubmitSuccess={handleChallengeSuccess}
                         />
                    )}
                </div>
            </div>
        </TransitionLayout>
    );
} 