'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useAuth } from '@/context/AuthContext'
import MomentCard from '@/components/MomentCard'
import ChallengeModal from '@/components/ChallengeModal'
import toast, { Toaster } from 'react-hot-toast'

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
    const [originalMoments, setOriginalMoments] = useState<MultipleChoiceMoment[]>([]);
    const [shuffledMoments, setShuffledMoments] = useState<MultipleChoiceMoment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasDragged, setHasDragged] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --- UPDATED: Results state type --- //
    const [results, setResults] = useState<ShuffleResult[] | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [gameInfo, setGameInfo] = useState<string | null>(null);
    // --- NEW: State for bonus --- //
    const [mostImportantBonusApplied, setMostImportantBonusApplied] = useState<boolean>(false);
    // --- NEW: State for saving score --- //
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [hasAttemptedSave, setHasAttemptedSave] = useState<boolean>(false); // Prevent duplicate saves
    // --- NEW: State for Challenge Modal --- //
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
    const [momentToChallenge, setMomentToChallenge] = useState<Moment | null>(null); // Store the moment being challenged

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
            setIsChallengeModalOpen(false); // Reset challenge state
            setMomentToChallenge(null);

            try {
                // Use the same fetchGame API
                const response = await fetch(`/api/fetchGame?team=${SHUFFLE_TEAM}&year=${SHUFFLE_YEAR}&gameId=${SHUFFLE_GAME_ID}`);
                const data: GameData = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! Status: ${response.status}`);
                }

                // Expecting MC moments based on API V11 refactor
                 if (!data || !data.key_moments || !Array.isArray(data.key_moments) || data.key_moments.length === 0) {
                    throw new Error('No valid moments found for shuffle mode.');
                 }
                 // Ensure moments have context and index
                 const validMoments = data.key_moments
                     .filter((m): m is MultipleChoiceMoment => // Type guard filter
                         m.type === 'mc' && typeof m.context === 'string' && typeof m.index === 'number'
                     )
                     .map((m) => ({ ...m, type: 'shuffle-item', importance: m.importance ?? 0 }));

                if (validMoments.length < 2) { // Need at least 2 moments to shuffle
                     throw new Error('Not enough moments with context found for shuffle mode.');
                }

                setOriginalMoments(validMoments.sort((a, b) => a.index - b.index)); // Store original order
                setShuffledMoments(shuffleArray(validMoments)); // Shuffle for display

                // --- NEW: Extract and set game info --- //
                if (data.event_data && data.event_data.shortName) {
                    // Attempt to extract date if available, otherwise just use shortName
                    let displayDate = '';
                    if (data.event_data.date) {
                        try {
                            displayDate = new Date(data.event_data.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                        } catch (e) { /* Ignore date parsing errors */ }
                    }
                    setGameInfo(`${data.event_data.shortName}${displayDate ? ` (${displayDate})` : ''}`);
                } else {
                     setGameInfo("Game details unavailable"); // Fallback
                }

            } catch (err: unknown) { // Use unknown
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

        // Dropped outside the list or no movement
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const items = Array.from(shuffledMoments);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        setShuffledMoments(items);
        setHasDragged(true);
        setResults(null); // Clear previous results if user reorders
        setScore(null);
        setMostImportantBonusApplied(false); // Reset bonus on re-drag
        setHasAttemptedSave(false); // Reset save attempt if user re-orders
        setSaveSuccess(null);
        setSaveError(null);
        setIsChallengeModalOpen(false); // Close modal if open during drag
        setMomentToChallenge(null);
    };

    // --- NEW: Function to save score --- //
    const saveScoreToDb = useCallback(async (calculatedScore: number, resultDetails: ShuffleResult[]) => {
        if (!user || hasAttemptedSave || !calculatedScore) return; // Only save if logged in, not already attempted, and score exists

        setIsSaving(true);
        setSaveSuccess(null);
        setSaveError(null);
        setHasAttemptedSave(true); // Mark that we're attempting to save

        const payload = {
            gameId: SHUFFLE_GAME_ID, // Using the hardcoded ID for now
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

        } catch (err: unknown) { // Use unknown
            const message = err instanceof Error ? err.message : 'Could not save score';
            console.error("Error saving shuffle score:", err);
            setSaveError(message);
            setSaveSuccess(false);
            // Optional: Allow retry? For now, we just show error.
        } finally {
            setIsSaving(false);
        }
    }, [user, hasAttemptedSave, originalMoments.length, mostImportantBonusApplied]); // Dependencies

    // --- UPDATED: Handle Submission with New Scoring Logic --- //
    const handleSubmitOrder = () => {
        if (!originalMoments.length) return;
        setIsSubmitting(true);

        let currentScore = 0;
        let bonusApplied = false;

        // Find the most important moment
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
                currentScore += 10; // +10 points for correct position
                 if (isMostImportant) {
                    currentScore += 5; // +5 bonus for most important moment
                    bonusApplied = true;
                 }
            } else if (diff <= 2) { // Changed logic: close means 1 or 2 spots off
                status = 'close';
                // No points gained or lost for being close
            } else { // diff > 2
                status = 'far_off';
                currentScore -= 2; // -2 points if more than 2 places off
            }

            return {
                status: status,
                isMostImportant: isMostImportant,
                correctPosition: correctIndex + 1 // 1-based for display
            };
        });

        const finalScore = Math.max(0, currentScore);
        setResults(newResults);
        setScore(finalScore);
        setMostImportantBonusApplied(bonusApplied);

        console.log("Scoring Results:", newResults, "Score:", finalScore, "Bonus Applied:", bonusApplied);
        setIsSubmitting(false);

        // --- Trigger save --- //
        if (user) { // Only attempt save if logged in
            saveScoreToDb(finalScore, newResults);
        } else {
            setHasAttemptedSave(true); // Mark as attempted even if not logged in to prevent future attempts
        }
    };

    // --- NEW: Challenge Modal Handlers --- //
    const openChallengeModal = (moment: Moment) => {
        if (!user) {
            toast.error("Please log in to challenge a moment.");
            return;
        }
        setMomentToChallenge(moment);
        setIsChallengeModalOpen(true);
    };

    const closeChallengeModal = () => {
        setIsChallengeModalOpen(false);
        setMomentToChallenge(null);
    };

    const handleChallengeSuccess = () => {
        toast.success("Thanks! Your feedback will help improve future versions.");
    };

    // --- Render Logic --- //

    if (isLoading) {
        return <div className="container mx-auto p-4 text-center">Loading Shuffle Challenge...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-red-600">Error loading shuffle challenge: {error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <Toaster position="top-center" />
            <h1 className="text-3xl font-bold mb-2 text-center">Shuffle Mode</h1>
            {/* --- NEW: Display Game Info --- */} 
            {gameInfo && (
                <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">
                    {gameInfo}
                </h2>
            )}
            <p className="text-center text-gray-600 mb-6">Drag and drop the moments into the correct chronological order.</p>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="shuffleMoments">
                    {(provided) => (
                        <ul
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="max-w-2xl mx-auto space-y-3 mb-6"
                        >
                            {shuffledMoments.map((moment, index) => (
                                <Draggable key={moment.index.toString()} draggableId={moment.index.toString()} index={index}>
                                    {(providedDraggable, snapshot) => (
                                        <div
                                            ref={providedDraggable.innerRef}
                                            {...providedDraggable.draggableProps}
                                            {...providedDraggable.dragHandleProps}
                                            style={{ ...providedDraggable.draggableProps.style }}
                                            className={snapshot.isDragging ? 'opacity-80' : ''}
                                        >
                                            <MomentCard
                                                context={sanitizeContextForShuffle(moment.context)}
                                                isDraggable={true}
                                                resultStatus={results ? results[index].status : undefined}
                                                resultIsMostImportant={results ? results[index].isMostImportant : undefined}
                                                resultCorrectPosition={results ? results[index].correctPosition : undefined}
                                                onChallengeClick={results ? () => openChallengeModal(moment) : undefined}
                                                challengeDisabled={!user}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
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
    );
} 