'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast';
import TransitionLayout from '@/components/layout/TransitionLayout';
import { ArrowPathIcon, XCircleIcon, HomeIcon } from '@heroicons/react/24/solid';

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

// --- Answer Variations Dictionary --- //
// Maps canonical answer (lowercase) to acceptable variations (lowercase)
const answerVariations: { [key: string]: string[] } = {
  'incomplete pass': ['incompletion'],
  'no gain': ['0 yards', 'nothing'],
  'home run': ['homer'],
  // Add more canonical answers and their variations here
  // Example: 'interception': ['pick', 'picked off'],
};

export default function PlayPage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [lockedStates, setLockedStates] = useState<boolean[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const scoreHasBeenSaved = useRef(false);
  const debounceTimers = useRef<(NodeJS.Timeout | null)[]>([]);
  
  const [gameState, setGameState] = useState<'playing' | 'summary' | 'loading' | 'error'>('loading');

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
          setGameState('playing');
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
    if (!gameData || scoreHasBeenSaved.current || isSaving) return;
    
    // Don't attempt to save if player name is empty
    if (!playerName.trim()) {
      return;
    }
    
    console.log(`Attempting to save score: ${finalScore} for game ${gameData.gameId}`);
    setIsSaving(true);
    setSaveError(null);
    const payload = { 
        gameId: gameData.gameId, 
        score: finalScore,
        playerName: playerName.trim(),
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
  }, [gameData, isSaving, playerName]);

  const handleInputChange = (index: number, value: string) => {
    if (lockedStates[index]) return;

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
                let hint = '';
                // Partial match check
                if (lowerCaseCanonicalAnswer.includes(lowerCaseValue) && lowerCaseValue.length >= Math.min(4, lowerCaseCanonicalAnswer.length * 0.5)) {
                    hint = 'Close! Keep going...';
                } 
                // Full name check
                else if (canonicalAnswer.includes(' ') && !trimmedValue.includes(' ') && lowerCaseCanonicalAnswer.endsWith(' ' + lowerCaseValue)) {
                    hint = 'Need full name?';
                }

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
        setGameState('summary');
    }
  }, [lockedStates, gameState, fillInMoments, score, saveScoreAPI]);

  const handleGiveUp = () => {
    setGameState('summary');
    debounceTimers.current.forEach(timerId => {
        if (timerId) clearTimeout(timerId);
    });
    debounceTimers.current = [];
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleSaveScore = () => {
    const correctCount = lockedStates.filter(Boolean).length;
    const totalQuestions = fillInMoments.length;
    saveScoreAPI(score, correctCount, totalQuestions);
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <TransitionLayout showHeader={false} showFooter={true}>
      <div className="relative">
        {/* Absolute positioned Home button */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/" className="text-gray-600 hover:text-yellow-500 p-1 rounded-md hover:bg-gray-100" aria-label="Go Home">
              <HomeIcon className="h-6 w-6" />
          </Link>
        </div>
        
        {/* Absolute positioned Centered Logo */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
           <Link href="/">
              <Image 
                src="/images/applogo.png" 
                alt="FanFrenzy Home" 
                width={120} 
                height={30} // Adjusted height assuming ~4:1 ratio
                priority 
                className="h-auto" // Maintain aspect ratio
              />
          </Link>
        </div>

        {gameState === 'loading' && (
          <div className="flex items-center justify-center pt-20">
            <div className="text-center p-8 text-gray-600">
              <ArrowPathIcon className="h-12 w-12 mx-auto text-yellow-500 animate-spin mb-4" />
              Loading Daily Challenge...
            </div>
          </div>
        )}

        {gameState === 'error' && (
          <div className="flex items-center justify-center pt-20">
            <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg shadow-sm">
              <XCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <p className="font-semibold mb-2">Error Loading Challenge</p>
              <p className="text-sm">{error || 'Could not load the challenge data. Please try again later.'}</p>
              <button 
                onClick={goToHome}
                className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && gameData && (
          <div className="max-w-2xl mx-auto p-4 pt-20 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-800">{gameData.title}</h1>
              <p className="text-sm text-gray-500">{lockedStates.filter(Boolean).length} of {fillInMoments.length} Moments Answered</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {startMoment && (
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 italic">{startMoment.context}</p>
                </div>
              )}
              {fillInMoments.map((moment, index) => (
                <div key={moment.index} className="space-y-2">
                  <label htmlFor={`moment-${index}`} className="block text-sm font-medium text-gray-700">
                    {index + 1}. {moment.prompt}
                  </label>
                  <input
                    id={`moment-${index}`}
                    type="text"
                    value={userInputs[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    disabled={lockedStates[index]}
                    placeholder="Type your answer..."
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm ${lockedStates[index] ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                  />
                  <p className={`text-xs min-h-[1rem] ${feedbackMessages[index] === 'Correct!' ? 'text-green-600' : 'text-blue-600'}`}>
                    {feedbackMessages[index]}
                  </p>
                </div>
              ))}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleGiveUp}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                >
                  Give Up & See Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'summary' && gameData && (
          <div className="max-w-2xl mx-auto p-4 pt-20">
            <div className="bg-white rounded-lg shadow-md p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Challenge Complete!</h2>
              <p className="text-lg">
                You answered <span className="font-semibold text-green-600">{lockedStates.filter(Boolean).length}</span> out of <span className="font-semibold">{fillInMoments.length}</span> moments correctly.
              </p>
              <p className="text-3xl font-bold text-yellow-600">Score: {score}</p>
              {endMoment && (
                <p className="text-sm text-gray-600 italic pt-4 border-t border-gray-200">{endMoment.context}</p>
              )}
              <div className="pt-4 space-y-3">
                <input
                    type="text"
                    value={playerName}
                    onChange={handlePlayerNameChange}
                    placeholder="Enter Your Name to Save Score"
                    maxLength={20}
                    className="block w-full max-w-xs mx-auto rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                    disabled={scoreHasBeenSaved.current || isSaving}
                />
                <button
                    onClick={handleSaveScore}
                    disabled={isSaving || scoreHasBeenSaved.current || !playerName.trim()}
                    className={`w-full max-w-xs mx-auto px-4 py-2 rounded-md text-white font-medium ${!playerName.trim() ? 'bg-gray-300 cursor-not-allowed' : (scoreHasBeenSaved.current ? 'bg-green-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600')}`}
                >
                    {isSaving ? 'Saving...' : (scoreHasBeenSaved.current ? 'Score Saved!' : 'Save Score')}
                </button>
                {saveError && <p className="text-xs text-red-500">Save failed: {saveError}</p>}
              </div>
              <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  Play Again
                </button>
                <button 
                  onClick={goToHome}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm font-medium"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}
        
        {gameState !== 'loading' && gameState !== 'error' && gameState !== 'playing' && gameState !== 'summary' && (
            <div className="text-center p-8 pt-20 text-gray-500">Invalid game state.</div>
        )}
      </div>
    </TransitionLayout>
  );
} 