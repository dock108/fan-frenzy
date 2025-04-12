'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext' // If needed for saving scores later
import toast, { Toaster } from 'react-hot-toast'
import ChallengeModal from '@/components/ChallengeModal'
import MomentCard from '@/components/MomentCard'

// Define expected data structures (should match API response)
interface MomentBase { index: number; type: 'start' | 'mc' | 'end'; }
interface StartEndMoment extends MomentBase { type: 'start' | 'end'; context: string; }
interface MultipleChoiceMoment extends MomentBase {
    type: 'mc';
    context: string;
    question: string;
    options: string[];
    answer: number;
    explanation: string;
    importance: number;
}
type Moment = StartEndMoment | MultipleChoiceMoment;
interface GameData {
    event_data: any;
    key_moments: Moment[];
    game_id: string;
}

// Interfaces (ensure consistency or import shared types)
interface ScorePayload { /* ... */ }

// --- Main Content Component --- //
function RewindPlayContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()

    const gameId = searchParams.get('gameId');
    const team = searchParams.get('team');
    const year = searchParams.get('year');

    // --- State --- 
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [currentMomentIndex, setCurrentMomentIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [score, setScore] = useState<number>(0);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [hasAttemptedSave, setHasAttemptedSave] = useState<boolean>(false);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
    const [momentToChallenge, setMomentToChallenge] = useState<MultipleChoiceMoment | null>(null);

    // --- Effects and Callbacks --- 
    useEffect(() => { /* ... fetch logic ... */ }, [gameId, team, year]);
    const saveScore = useCallback(async (/* ... */) => { /* ... save logic ... */ }, [user, hasAttemptedSave, gameData]);
    const handleAnswer = (optionIndex: number) => { /* ... answer logic ... */ };
    const finishGame = (finalAnswers: (number | null)[]) => { /* ... finish logic ... */ };
    const openChallengeModal = (moment: MultipleChoiceMoment) => { /* ... open modal logic ... */ };
    const closeChallengeModal = () => { /* ... close modal logic ... */ };
    const handleChallengeSuccess = () => { /* ... toast logic ... */ };

    // --- Render Logic --- //
    if (isLoading) { /* ... loading UI ... */ }
    if (error) { /* ... error UI ... */ }
    if (!gameData) { /* ... no game data UI ... */ }

    const currentMoment = gameData.key_moments.length > currentMomentIndex ? gameData.key_moments[currentMomentIndex] : null;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Toaster position="top-center" />
            <h1 className="text-3xl font-bold mb-4 text-center">Team Rewind</h1>
            <p className="text-center text-gray-600 mb-6">(Game: {gameData.event_data?.shortName || gameData.game_id})</p>
            
            {!isFinished ? (
                // --- Active Gameplay View --- //
                <>
                    {currentMoment ? (
                        <MomentCard
                            key={currentMoment.index}
                            context={currentMoment.context}
                            question={currentMoment.question}
                            options={currentMoment.options}
                            onSelect={handleAnswer}
                            displayIndex={currentMomentIndex + 1}
                            totalMoments={gameData.key_moments.length}
                            onChallengeClick={() => openChallengeModal(currentMoment)}
                            challengeDisabled={!user}
                            // isRevealed={false} // Default
                            // userGuess={userAnswers[currentMomentIndex]} // Pass if you want instant highlight on select
                            // disabled={false} // Active card
                        />
                    ) : (
                         <p className="text-center text-gray-500">Loading next moment or game finished incorrectly.</p>
                    )}
                    {/* Optional: Button to force finish */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => finishGame(userAnswers)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                            disabled={!gameData} // Disable if no game data
                        >
                            Finish Now / View Results
                        </button>
                    </div>
                </>
            ) : (
                // --- Results Display View --- //
                <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                    <h2 className="text-2xl font-bold mb-4 text-blue-800 text-center">Game Over!</h2>
                    <p className="text-xl mb-6 text-center">Final Score: {score} / {gameData.key_moments.length}</p>
                    <div className="space-y-4 mb-6">
                        {gameData.key_moments.map((moment, index) => (
                            <MomentCard
                                key={moment.index}
                                context={moment.context}
                                question={moment.question}
                                options={moment.options}
                                userGuess={userAnswers[index]} // Show the user's final answer
                                correctAnswer={moment.answer} // Show the correct answer
                                importance={moment.importance}
                                isRevealed={true} // Set to reveal answers
                                onChallengeClick={() => openChallengeModal(moment)} // Allow challenge from results
                                challengeDisabled={!user}
                                disabled={true} // Card is non-interactive in results view
                            />
                        ))}
                    </div>

                    {/* Save Status Display */}
                    <div className="mt-4 text-center text-sm h-6"> {/* Added fixed height */}
                        {!user && hasAttemptedSave && <p className="text-gray-600">(Log in to save your score)</p>}
                        {user && isSaving && <p className="text-blue-600 animate-pulse">Saving score...</p>}
                        {user && saveSuccess === true && <p className="text-green-600 font-semibold">Score saved successfully!</p>}
                        {user && saveSuccess === false && <p className="text-red-600">Could not save score. {saveError ? `(${saveError})` : 'Please try again later.'}</p>}
                    </div>
                    <div className="text-center mt-6">
                        <Link href="/rewind" className="mr-4 inline-block px-6 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">
                            Select Another Game
                        </Link>
                        <Link href="/" className="inline-block px-6 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                            Back to Home
                        </Link>
                    </div>
                </div>
            )}

            {/* Render Challenge Modal */}
            {momentToChallenge && gameData && (
                <ChallengeModal
                    isOpen={isChallengeModalOpen}
                    onClose={closeChallengeModal}
                    gameId={gameData.game_id}
                    momentIndex={momentToChallenge.index}
                    onSubmitSuccess={handleChallengeSuccess}
                />
            )}
        </div>
    );
} // End of RewindPlayContent function

// --- Default Export with Suspense --- //
export default function RewindPlayPage() {
    return (
        <Suspense fallback={<div className="container mx-auto p-4 text-center">Loading Game Parameters...</div>}>
            <RewindPlayContent />
        </Suspense>
    );
}