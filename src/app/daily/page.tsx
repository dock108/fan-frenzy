'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast';
import TransitionLayout from '@/components/layout/TransitionLayout';
import { ArrowPathIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface MomentBase {
  index: number;
  type: 'start' | 'fill-in' | 'end';
}

interface StartEndMoment extends MomentBase {
  type: 'start' | 'end';
  context: string;
}

interface FillInMoment extends MomentBase {
  type: 'fill-in';
  prompt: string;
  answer: string;
  importance: number;
}

interface GameData {
  gameId: string;
  title: string;
  moments: (StartEndMoment | FillInMoment)[];
}

// --- NEW: Answer Variations Dictionary --- //
// Maps canonical answer (lowercase) to acceptable variations (lowercase)
const answerVariations: { [key: string]: string[] } = {
  'incomplete pass': ['incompletion'],
  'no gain': ['0 yards', 'nothing'],
  'home run': ['homer'],
  // Add more canonical answers and their variations here
  // Example: 'interception': ['pick', 'picked off'],
};

export default function DailyChallengePage() {
  const { user, loading: authLoading } = useAuth();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [lockedStates, setLockedStates] = useState<boolean[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scoreHasBeenSaved = useRef(false);
  const debounceTimers = useRef<(NodeJS.Timeout | null)[]>([]);
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'summary' | 'loading' | 'error'>('loading');

  const fillInMoments = useMemo(() => 
    gameData?.moments.filter(m => m.type === 'fill-in') as FillInMoment[] || []
  , [gameData]);

  const startMoment = useMemo(() => 
    gameData?.moments.find(m => m.type === 'start') as StartEndMoment | undefined
  , [gameData]);

  const endMoment = useMemo(() => 
    gameData?.moments.find(m => m.type === 'end') as StartEndMoment | undefined
  , [gameData]);

  useEffect(() => {
    const fetchGameData = async () => {
      setGameState('loading'); 
      setError(null);
      scoreHasBeenSaved.current = false;
      try {
        const response = await fetch('/api/getDailyChallenge');
        if (!response.ok) throw new Error('Failed to fetch daily challenge');
        const loadedGameData: GameData = await response.json();
        setGameData(loadedGameData);

        const currentFillInMoments = loadedGameData.moments.filter(m => m.type === 'fill-in') as FillInMoment[] || [];
        if (currentFillInMoments.length > 0) {
          setUserInputs(Array(currentFillInMoments.length).fill(''));
          setLockedStates(Array(currentFillInMoments.length).fill(false));
          setFeedbackMessages(Array(currentFillInMoments.length).fill(''));
          setScore(0);
          debounceTimers.current = Array(currentFillInMoments.length).fill(null);
          setGameState('intro');
        } else {
          throw new Error('No fill-in moments found in the challenge data.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        setGameData(null);
        setGameState('error');
      } 
    };
    fetchGameData();
    return () => {
        debounceTimers.current.forEach(timerId => {
            if (timerId) clearTimeout(timerId);
        });
    };
  }, []);

  const saveScoreAPI = useCallback(async (finalScore: number, correctCount: number, totalQuestions: number) => {
    if (!user || !gameData || scoreHasBeenSaved.current || isSaving) return;
    console.log(`Attempting to save score: ${finalScore} for game ${gameData.gameId}`);
    setIsSaving(true);
    setSaveError(null);
    const payload = { 
        gameId: gameData.gameId, 
        score: finalScore,
        mode: 'daily',
        correctCount: correctCount,
        totalQuestions: totalQuestions
    };
    try {
      const response = await fetch('/api/saveScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Save score failed:", response.status, errorData);
          throw new Error(errorData.message || `Failed to save score (${response.status})`);
      }
      const result = await response.json();
      console.log("Save score success:", result);
      toast.success('Score saved successfully!');
      scoreHasBeenSaved.current = true;
      setSaveError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save score';
      console.error("Save score error:", message);
      setSaveError(message);
      toast.error(`Save failed: ${message}`);
      scoreHasBeenSaved.current = false;
    } finally {
      setIsSaving(false);
    }
  }, [user, gameData, isSaving]);

  const handleInputChange = (index: number, value: string) => {
    if (lockedStates[index] || gameState !== 'playing') return;

    if (debounceTimers.current[index]) {
        clearTimeout(debounceTimers.current[index] as NodeJS.Timeout);
        debounceTimers.current[index] = null;
    }

    setUserInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });

    const moment = fillInMoments[index];
    const trimmedValue = value.trim();
    const lowerCaseValue = trimmedValue.toLowerCase();
    const canonicalAnswer = moment.answer.trim(); // Keep original case for potential future use
    const lowerCaseCanonicalAnswer = canonicalAnswer.toLowerCase();

    // --- UPDATED: Correctness Check with Variations --- //
    let isCorrect = false;
    if (lowerCaseValue === lowerCaseCanonicalAnswer) {
        isCorrect = true;
    } else {
        // Check variations if direct match failed
        const variations = answerVariations[lowerCaseCanonicalAnswer];
        if (variations && variations.includes(lowerCaseValue)) {
            isCorrect = true;
        }
    }

    if (isCorrect) {
        // Lock state, set 'Correct!' feedback, update score
        setLockedStates(prev => {
            const newStates = [...prev];
            newStates[index] = true;
            return newStates;
        });
        setFeedbackMessages(prev => {
            const newMessages = [...prev];
            newMessages[index] = 'Correct!'; 
            return newMessages;
        });
        setScore(prevScore => prevScore + (moment.importance || 1));
        // Clear debounce timer
        if (debounceTimers.current[index]) {
             clearTimeout(debounceTimers.current[index] as NodeJS.Timeout);
             debounceTimers.current[index] = null;
        }
    } else {
        // --- Not Correct: Hint Logic --- //
        // ... clear 'Correct!' message if necessary ...
        // ... hint timer logic (Close!, Need full name?) ...
        
        // Add a specific hint if a variation was *almost* typed?
        // (This could get complex, maybe add later if needed)

        // Reset feedback if it wasn't 'Correct!' and hint doesn't apply
         if (feedbackMessages[index] !== 'Correct!' && /* hint logic determined no hint */ false ) {
              setFeedbackMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[index] = '';
                  return newMessages;
              });
         }
         
         // Start the debounce timer for hints
         if (trimmedValue.length >= 2 && !debounceTimers.current[index]) { // Only start if not already running
              debounceTimers.current[index] = setTimeout(() => {
                 // ... existing hint checking logic ...
                let hint = '';
                // Partial match check
                if (lowerCaseCanonicalAnswer.includes(lowerCaseValue) && lowerCaseValue.length >= Math.min(4, lowerCaseCanonicalAnswer.length * 0.5)) {
                    hint = 'Close! Keep going...';
                } 
                // Full name check
                else if (canonicalAnswer.includes(' ') && !trimmedValue.includes(' ') && lowerCaseCanonicalAnswer.endsWith(' ' + lowerCaseValue)) {
                    hint = 'Need full name?';
                }
                 // Check variation partial matches (optional enhancement)
                 // const variations = answerVariations[lowerCaseCanonicalAnswer];
                 // if (!hint && variations) { ... check partial match against variations ... }

                // Update hint message
                if (feedbackMessages[index] !== 'Correct!') { // Check again before setting
                     setFeedbackMessages(prev => {
                         const newMessages = [...prev];
                         newMessages[index] = hint;
                         return newMessages;
                     });
                }
                debounceTimers.current[index] = null; 
            }, 750); 
         }
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && fillInMoments.length > 0 && lockedStates.every(Boolean)) {
        const correctCount = lockedStates.filter(Boolean).length;
        const totalQuestions = fillInMoments.length;
        
        if (user && !scoreHasBeenSaved.current) {
            saveScoreAPI(score, correctCount, totalQuestions);
        }

        setGameState('summary');
    }
  }, [lockedStates, gameState, fillInMoments, user, score, saveScoreAPI]);

  const handleGiveUp = () => {
    setGameState('summary');
    debounceTimers.current.forEach(timerId => {
        if (timerId) clearTimeout(timerId);
    });
    debounceTimers.current = [];
  };

  const startGame = () => {
    setGameState('playing');
  };

  const restartGame = () => {
    window.location.reload(); 
  };

  if (gameState === 'loading') {
    return (
      <TransitionLayout transitionMode="fade">
        <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
          <div className="text-center p-8">
             <ArrowPathIcon className="h-12 w-12 mx-auto text-teamPrimary animate-spin mb-4" />
             Loading Daily Challenge...
          </div>
        </div>
      </TransitionLayout>
    );
  }

  if (gameState === 'error') {
    return (
      <TransitionLayout transitionMode="fade">
         <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
            <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg shadow-md">
                <XCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Challenge</h2>
                <p className="text-red-600 dark:text-red-300">{error || 'An unknown error occurred.'}</p>
                <button 
                    onClick={restartGame} 
                    className="mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
      </TransitionLayout>
    );
  }
  
  if (!gameData || !startMoment || !endMoment || fillInMoments.length === 0) {
      return (
          <TransitionLayout transitionMode="fade">
              <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                      No challenge data available or data is incomplete. Please try again later.
                  </div>
              </div>
          </TransitionLayout>
      );
  }

  if (gameState === 'intro') {
    return (
      <TransitionLayout transitionMode="fade">
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 dark:from-gray-800 dark:via-gray-900 dark:to-black z-0">
             <div className="absolute inset-0 bg-[url('/images/subtle-texture.png')] opacity-10 dark:opacity-5"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-black/50 to-transparent"></div>
           </div>
           
           <div className="relative z-10 max-w-2xl">
                <CalendarDaysIcon className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-yellow-500 dark:text-yellow-400"/>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                    Daily Challenge
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10">
                    One quiz. One shot. Updated daily.
                </p>
                <p className="text-md text-gray-700 dark:text-gray-200 mb-12 font-semibold">
                    Today's Topic: {gameData.title}
                </p>

                <button 
                    onClick={startGame}
                    className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    Start Quiz
                </button>
            </div>
        </div>
      </TransitionLayout>
    );
  }

  if (gameState === 'playing') {
    return (
      <TransitionLayout transitionMode="slide-up">
        <div className="relative min-h-[calc(100vh-64px)] py-10 px-4 flex flex-col items-center justify-start overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-white to-amber-50 dark:from-gray-800 dark:via-gray-900 dark:to-black z-0">
            <div className="absolute inset-0 bg-[url('/images/stadium-crowd-blur.jpg')] bg-cover bg-center opacity-10 dark:opacity-5"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-3xl">
            <div className="mb-6 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {lockedStates.filter(Boolean).length} of {fillInMoments.length} Moments Answered
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${(lockedStates.filter(Boolean).length / fillInMoments.length) * 100}%` }}>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-semibold mb-2 text-center text-gray-800 dark:text-gray-100">{gameData.title}</h1>

            <div className="bg-background/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 mt-6 border border-gray-200 dark:border-gray-700">
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 italic text-center">{startMoment.context}</p>
              </div>

              <div className="space-y-6"> 
                {fillInMoments.map((moment, index) => (
                  <div 
                    key={moment.index} 
                    className={`p-4 rounded-lg transition-colors duration-200 ${
                      lockedStates[index] 
                        ? 'bg-green-50 dark:bg-green-900/40 border border-green-300 dark:border-green-700' 
                        : 'bg-transparent border border-transparent' // Normal state
                    }`}
                  >
                    <label htmlFor={`moment-${index}`} className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {index + 1}. {moment.prompt} 
                      <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 px-1.5 py-0.5 rounded-full ml-2 font-normal">
                         Importance: {moment.importance}
                      </span>
                    </label>
                    <input
                      id={`moment-${index}`}
                      type="text"
                      value={userInputs[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Type your answer..."
                      aria-label={`Answer for moment ${index + 1}: ${moment.prompt}`}
                      disabled={lockedStates[index]}
                    />
                    {feedbackMessages[index] && (
                        <p className={`mt-2 text-sm font-medium ${
                            feedbackMessages[index] === 'Correct!' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                            {feedbackMessages[index]}
                        </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 italic text-center">{endMoment.context}</p>
              </div>

              <div className="mt-6 text-center">
                    <button
                        onClick={handleGiveUp}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 underline px-4 py-2 rounded-md transition-colors"
                    >
                        Give Up & See Answers
                    </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionLayout>
    );
  } 
  
  else if (gameState === 'summary') {
    const correctCount = lockedStates.filter(Boolean).length;
    const totalQuestions = fillInMoments.length;

    return (
      <TransitionLayout transitionMode="fade">
        <div className="relative min-h-[calc(100vh-64px)] py-10 px-4 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-amber-300 to-yellow-400 dark:from-yellow-700 dark:via-amber-800 dark:to-yellow-900 z-0">
              <div className="absolute inset-0 bg-[url('/images/confetti-pattern.svg')] opacity-10 dark:opacity-5"></div> 
            </div>

           <div className="relative z-10 w-full max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800 dark:text-gray-100">Daily Challenge Complete!</h1>
            <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-8">{gameData.title}</h2>

            <div className="p-6 md:p-8 bg-background/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
              <p className="text-sm uppercase tracking-wider mb-1 text-yellow-600 dark:text-yellow-400 font-semibold">Your Score</p>
              <p className="text-4xl md:text-5xl font-bold mb-2">{score}</p>
              <p className="text-lg text-gray-700 dark:text-gray-300">You answered <span className="font-semibold">{correctCount}</span> out of <span className="font-semibold">{totalQuestions}</span> moments correctly.</p>
            </div>

            <div className="space-y-3 text-left mb-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200 text-center">Review Your Answers:</h3>
                {fillInMoments.map((moment, index) => (
                    <div key={`feedback-${index}`} className={`p-4 border rounded-lg text-sm shadow-sm ${feedbackMessages[index].startsWith('Correct') 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/40 dark:border-green-700' 
                        : 'bg-red-50 border-red-200 dark:bg-red-900/40 dark:border-red-700'}`
                    }>
                        <p className="font-medium text-gray-800 dark:text-gray-100 mb-1">{index + 1}. {moment.prompt}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Your Answer: <span className="font-semibold">"{userInputs[index]}"</span>
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            Correct Answer: <span className="font-semibold">"{moment.answer}"</span>
                        </p>
                        {typeof moment.importance === 'number' && ( 
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(Importance: {moment.importance})</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center text-sm h-6 mb-6"> 
              {!user && !authLoading && <p className="text-gray-600 dark:text-gray-400">(Log in or Sign up to save your score and track progress!)</p>} 
              {user && isSaving && <p className="text-blue-600 dark:text-blue-400 animate-pulse">Saving score...</p>} 
              {user && !isSaving && saveError && <p className="text-red-600 dark:text-red-400">Could not save score: {saveError}</p>} 
              {user && !isSaving && !saveError && scoreHasBeenSaved.current && <p className="text-green-600 dark:text-green-400 font-semibold">Score saved successfully!</p>} 
              {user && !isSaving && !saveError && !scoreHasBeenSaved.current && !isSaving && <p className="text-yellow-600 dark:text-yellow-400">Score not saved (already played today or issue occurred).</p>} 
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-center items-center gap-4">
               <button 
                  onClick={restartGame} 
                  className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors"
              >
                  Play Again Tomorrow?
              </button>
               {user && (
                  <Link href="/leaderboard?mode=daily" className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center">
                      View Leaderboard
                  </Link>
              )}
               <Link href="/rewind" className="w-full sm:w-auto px-6 py-3 bg-teamPrimary hover:bg-teamAccent text-white rounded-lg font-medium transition-colors text-center">
                  Try Team Rewind
               </Link>
            </div>
           </div>
        </div>
      </TransitionLayout>
    );
  }

  return <div className="text-center p-8">Invalid game state. Please refresh.</div>;
}