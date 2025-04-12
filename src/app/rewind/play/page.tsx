'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext' // If needed for saving scores later
import toast, { Toaster } from 'react-hot-toast'
import ChallengeModal from '@/components/ChallengeModal'
import MomentCard from '@/components/MomentCard'
import useTeamTheme, { TEAM_THEMES } from '@/hooks/useTeamTheme' // Import theme hook
import TeamTransition from '@/components/layout/TeamTransition' // Import TeamTransition
import Image from 'next/image' // Import Image
import { ArrowPathIcon } from '@heroicons/react/24/outline'

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
    const { setTeamTheme, resetTeamTheme } = useTeamTheme(); // Use theme hook

    const gameId = searchParams.get('gameId');
    const team = searchParams.get('team');
    // const year = searchParams.get('year'); // Year removed

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
    const [showTransition, setShowTransition] = useState<boolean>(true); // State for entry transition
    const [teamThemeColors, setTeamThemeColors] = useState<TeamTheme | null>(null);

    // --- Effects and Callbacks --- 
    useEffect(() => {
        // Set the team theme when the component mounts with a valid team
        if (team) {
            setTeamTheme(team);
            setTeamThemeColors(TEAM_THEMES[team.toLowerCase()] || TEAM_THEMES.default);
        } else {
            // Handle case where team is missing?
            setError("Team parameter is missing.");
            setIsLoading(false);
            return;
        }

        // Reset theme when component unmounts
        return () => resetTeamTheme();
    }, [team, setTeamTheme, resetTeamTheme]);

    useEffect(() => {
        // Fetch game data
        if (!gameId || !team) {
            setError("Missing game ID or team.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setHasAttemptedSave(false);
        setSaveSuccess(null);

        const fetchGame = async () => {
            try {
                // API endpoint might need adjustment if year was required
                const response = await fetch(`/api/getRewindGameDetails?gameId=${gameId}&team=${team}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to load game data');
                setGameData(data as GameData);
                setUserAnswers(Array(data.key_moments.length).fill(null)); // Initialize answers array
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(message);
                setGameData(null);
            } finally {
                setIsLoading(false);
                // Hide transition after loading (adjust timing as needed)
                setTimeout(() => setShowTransition(false), 500);
            }
        };

        fetchGame();
    }, [gameId, team]); // Depend on gameId and team

    const saveScore = useCallback(async (finalScore: number, correctCount: number, totalMoments: number) => { 
        if (!user || hasAttemptedSave || !gameData || !team) return;
        setIsSaving(true);
        setHasAttemptedSave(true);
        setSaveSuccess(null);
        setSaveError(null);

        const payload = { 
            gameId: gameData.game_id,
            score: finalScore,
            mode: 'rewind', // Specify mode
            team: team,      // Include team
            correctCount: correctCount,
            totalQuestions: totalMoments
        };

        try {
            const response = await fetch('/api/saveScore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to save score (${response.status})`);
            }
            setSaveSuccess(true);
            toast.success('Score saved!');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save score';
            setSaveError(message);
            setSaveSuccess(false);
            toast.error(`Save failed: ${message}`);
        } finally {
            setIsSaving(false);
        }
    }, [user, hasAttemptedSave, gameData, team]);

    const handleAnswer = (optionIndex: number) => { 
        if (!gameData || isFinished) return;

        const newAnswers = [...userAnswers];
        newAnswers[currentMomentIndex] = optionIndex;
        setUserAnswers(newAnswers);

        // Move to next moment or finish
        if (currentMomentIndex < gameData.key_moments.length - 1) {
            setCurrentMomentIndex(currentMomentIndex + 1);
        } else {
            finishGame(newAnswers);
        }
    };
    
    const finishGame = (finalAnswers: (number | null)[]) => { 
        if (!gameData) return;

        let calculatedScore = 0;
        let correctCount = 0;
        const mcMoments = gameData.key_moments.filter(m => m.type === 'mc') as MultipleChoiceMoment[];

        mcMoments.forEach((moment, gameIndex) => {
            // Find the answer corresponding to this moment in the flat userAnswers array
            const answerIndex = gameData.key_moments.findIndex(m => m.index === moment.index);
            if (answerIndex !== -1 && finalAnswers[answerIndex] === moment.answer) {
                calculatedScore += moment.importance || 1; // Add importance or default 1
                correctCount++;
            }
        });

        setScore(calculatedScore);
        setIsFinished(true);

        if (user && !hasAttemptedSave) {
            saveScore(calculatedScore, correctCount, mcMoments.length);
        }
    };

    const openChallengeModal = (moment: MultipleChoiceMoment) => { setMomentToChallenge(moment); setIsChallengeModalOpen(true); };
    const closeChallengeModal = () => { setIsChallengeModalOpen(false); setMomentToChallenge(null); };
    const handleChallengeSuccess = () => { toast.success('Challenge submitted successfully!'); };

    // --- Render Logic --- //
    if (isLoading && showTransition) { // Show loading within transition initially
        return (
            <TeamTransition isActive={true} teamColor={teamThemeColors?.primary || '#000'}>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-white">
                   <ArrowPathIcon className="h-10 w-10 animate-spin mb-4" />
                   <p>Loading {team?.toUpperCase()} Trivia...</p>
                </div>
            </TeamTransition>
        );
    }

    if (isLoading) { 
        return (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                 <ArrowPathIcon className="h-10 w-10 text-teamPrimary animate-spin mb-4" />
                 <p className="text-gray-600 dark:text-gray-300">Loading Game Data...</p>
            </div>
        );
     }
    if (error) { 
        return (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                <p className="text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-md">Error: {error}</p>
                <Link href="/rewind" className="mt-4 px-4 py-2 bg-teamPrimary text-white rounded hover:bg-teamAccent">
                    Back to Team Selection
                </Link>
            </div>
        );
     }
    if (!gameData) { 
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                <p className="text-gray-500 dark:text-gray-400">No game data found.</p>
                 <Link href="/rewind" className="mt-4 px-4 py-2 bg-teamPrimary text-white rounded hover:bg-teamAccent">
                    Back to Team Selection
                </Link>
            </div>
        );
     }

    const currentMoment = gameData.key_moments.length > currentMomentIndex ? gameData.key_moments[currentMomentIndex] : null;
    const totalMoments = gameData.key_moments.length;
    const mcMoments = gameData.key_moments.filter(m => m.type === 'mc');

    // Simplified progress calculation (adjust if start/end moments affect display index)
    const currentProgressIndex = currentMomentIndex + 1;
    const totalProgressSteps = totalMoments;

    return (
        <TeamTransition isActive={showTransition} teamColor={teamThemeColors?.primary || '#000'}>
            {/* Immersive Background Container */}
            <div className="relative min-h-[calc(100vh-64px)] py-8 px-4 flex flex-col items-center justify-start overflow-hidden">
                {/* Background Effect - Use team color overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-teamPrimary/10 via-transparent to-teamSecondary/10 dark:from-teamPrimary/20 dark:to-teamSecondary/20 z-0"
                  style={{ backgroundColor: `var(--team-overlay, rgba(0,0,0,0.05))` }} // Use overlay color
                >
                    {/* TODO: Add dynamic blurred team image based on team */}
                    <div className="absolute inset-0 bg-[url('/images/stadium-blur-generic.jpg')] bg-cover bg-center opacity-10 dark:opacity-5"></div> 
                    {/* Team Logo Watermark */}
                    {team && (
                        <Image 
                            src={`/images/logos/${team.toUpperCase()}.svg`} 
                            alt=""
                            width={200} height={200}
                            className="absolute bottom-4 right-4 opacity-5 dark:opacity-[0.03] pointer-events-none"
                            onError={(e) => { e.currentTarget.src = `/images/logos/${team.toUpperCase()}.png`; }} // PNG Fallback
                        />
                    )}
                </div>

                {/* Content Area */}
                 <div className="relative z-10 w-full max-w-2xl">
                    <Toaster position="top-center" />
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-800 dark:text-gray-100">Team Rewind: {team?.toUpperCase()}</h1>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
                        Game: {gameData.event_data?.shortName || gameData.game_id}
                    </p>
                    
                    {/* Progress Bar */} 
                    <div className="mb-6">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                                className="bg-teamPrimary h-2.5 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${(currentProgressIndex / totalProgressSteps) * 100}%` }}>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                           Moment {currentProgressIndex} of {totalProgressSteps}
                        </p>
                    </div>

                    {!isFinished ? (
                        // --- Active Gameplay View --- //
                        <div className="flex flex-col"> {/* Use flex column */} 
                            {currentMoment && currentMoment.type === 'mc' ? (
                                <MomentCard
                                    key={currentMoment.index}
                                    moment={currentMoment as MultipleChoiceMoment} // Pass the whole moment
                                    onSelect={handleAnswer}
                                    displayIndex={currentProgressIndex} // Use calculated progress index
                                    totalMoments={totalProgressSteps}
                                    onChallengeClick={() => openChallengeModal(currentMoment as MultipleChoiceMoment)}
                                    challengeDisabled={!user}
                                    // Add team-specific styles if MomentCard supports it or via global CSS vars
                                />
                            ) : currentMoment && (currentMoment.type === 'start' || currentMoment.type === 'end') ? (
                                <div className="bg-background/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-6 my-4 border border-gray-200 dark:border-gray-700 text-center italic">
                                    <p className="text-gray-600 dark:text-gray-300">{currentMoment.context}</p>
                                     <button 
                                        onClick={() => handleAnswer(-1)} // Use -1 or similar to signify moving past context
                                        className="mt-4 px-4 py-2 bg-teamPrimary hover:bg-teamAccent text-white rounded-md text-sm"
                                    >
                                        Continue
                                    </button>
                                </div>
                            ) : (
                                 <p className="text-center text-gray-500 dark:text-gray-400 py-10">Loading next moment...</p>
                            )}
                            {/* Buttons Container - moved to bottom */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={() => handleAnswer(-1)} // Treat skip like moving past context
                                    className="text-sm px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md transition-colors w-full sm:w-auto"
                                    disabled={!currentMoment || currentMomentIndex >= gameData.key_moments.length - 1} // Disable on last moment
                                >
                                    Skip Moment
                                </button>
                                <button
                                    onClick={() => finishGame(userAnswers)}
                                    className="text-sm px-4 py-2 bg-teamSecondary hover:bg-opacity-80 text-white rounded-md transition-colors w-full sm:w-auto"
                                    disabled={!gameData} // Disable if no game data
                                >
                                    Finish Now
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- Results Display View --- //
                        <div className="bg-background/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                             {/* Background: slightly tinted retro overlay or team wallpaper - Apply via styles */}
                            <h2 className="text-2xl font-bold mb-4 text-teamPrimary text-center">Game Over!</h2>
                            <p className="text-xl mb-6 text-center font-semibold">Final Score: {score}</p>
                            
                            <h3 className="text-lg font-semibold mb-3 text-center">Review Moments:</h3>
                            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                                {mcMoments.map((moment, resultIndex) => {
                                    const answerIndex = gameData.key_moments.findIndex(m => m.index === moment.index);
                                    return (
                                        <MomentCard
                                            key={moment.index}
                                            moment={moment}
                                            userGuess={userAnswers[answerIndex]} // Show the user's final answer
                                            correctAnswer={moment.answer} // Show the correct answer
                                            isRevealed={true} // Set to reveal answers
                                            onChallengeClick={() => openChallengeModal(moment)} // Allow challenge from results
                                            challengeDisabled={!user}
                                            disabled={true} // Card is non-interactive in results view
                                        />
                                    )
                                })}
                            </div>

                            {/* Save Status Display */}
                            <div className="mt-4 text-center text-sm h-6"> 
                                {!user && !hasAttemptedSave && <p className="text-gray-600 dark:text-gray-400">(Log in to save your score)</p>}
                                {user && isSaving && <p className="text-teamPrimary animate-pulse">Saving score...</p>}
                                {user && saveSuccess === true && <p className="text-green-600 dark:text-green-400 font-semibold">Score saved successfully!</p>}
                                {user && saveSuccess === false && <p className="text-red-600 dark:text-red-400">Could not save score. {saveError ? `(${saveError})` : 'Please try again later.'}</p>}
                            </div>
                             {/* CTAs - Ensure they are at the bottom */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-center gap-3">
                                <Link href="/rewind" className="w-full sm:w-auto px-5 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition-colors">
                                    Select Another Team
                                </Link>
                                {/* TODO: Add Try another game from same team/year */} 
                                <Link href="/" className="w-full sm:w-auto px-5 py-2 rounded bg-teamPrimary hover:bg-teamAccent text-white transition-colors">
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
            </div>
        </TeamTransition>
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