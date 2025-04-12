'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
// import dailyChallengeData from '@/data/daily-challenge.json' // Removed direct import
import { supabase } from '@/utils/supabase'
import toast from 'react-hot-toast'

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

type Moment = StartEndMoment | FillInMoment;

interface GameData {
  gameId: string;
  title: string;
  moments: Moment[];
}

const DEBOUNCE_DELAY = 1500; // ms

export default function DailyChallengePage() {
  const { user, loading: authLoading } = useAuth()
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetch
  const [error, setError] = useState<string | null>(null); // Error state for fetch
  const [userInputs, setUserInputs] = useState<string[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [lockedStates, setLockedStates] = useState<boolean[]>([])
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const debounceTimers = useRef<(NodeJS.Timeout | number | null)[]>([]);
  const [isSaving, setIsSaving] = useState(false); // State for saving process
  const [saveError, setSaveError] = useState<string | null>(null); // State for save errors
  const scoreHasBeenSaved = useRef(false); // Prevent duplicate saves

  // Derived states need careful handling due to async data loading
  const fillInMoments = gameData?.moments.filter(m => m.type === 'fill-in') as FillInMoment[] || [];
  const startMoment = gameData?.moments.find(m => m.type === 'start') as StartEndMoment | undefined;
  const endMoment = gameData?.moments.find(m => m.type === 'end') as StartEndMoment | undefined;

  // Fetch data and initialize state
  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      setError(null);
      scoreHasBeenSaved.current = false; // Reset save flag on new game load
      try {
        const response = await fetch('/api/getDailyChallenge');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const loadedGameData: GameData = await response.json();
        setGameData(loadedGameData);

        // Initialize states based on fetched data
        const loadedFillInMoments = loadedGameData.moments.filter(m => m.type === 'fill-in') as FillInMoment[];
        if (loadedFillInMoments.length > 0) {
          setUserInputs(Array(loadedFillInMoments.length).fill(''));
          setLockedStates(Array(loadedFillInMoments.length).fill(false));
          setFeedbackMessages(Array(loadedFillInMoments.length).fill(''));
          debounceTimers.current = Array(loadedFillInMoments.length).fill(null);
        } else {
          setUserInputs([]);
          setLockedStates([]);
          setFeedbackMessages([]);
          debounceTimers.current = [];
        }
      } catch (err: any) {
        console.error("Failed to fetch daily challenge:", err);
        setError(err.message || 'An unknown error occurred while fetching the challenge.');
        setGameData(null); // Ensure no stale data is shown
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();

    // Cleanup timers on unmount
    return () => {
      debounceTimers.current.forEach(timerId => {
        if (timerId) clearTimeout(timerId as NodeJS.Timeout);
      });
    };
  }, []);

  // Function to call the save score API
  const saveScoreAPI = useCallback(async (finalScore: number) => {
    if (!user || !gameData || scoreHasBeenSaved.current || isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    scoreHasBeenSaved.current = true; // Set flag immediately

    try {
      const response = await fetch('/api/saveScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameData.gameId,
          score: finalScore
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      toast.success('Score saved successfully!');
      // console.log('Save successful:', result.message);
    } catch (err: any) {
      console.error("Error saving score via API:", err);
      setSaveError(err.message || 'Failed to save score.');
      toast.error(`Save failed: ${err.message}`);
      scoreHasBeenSaved.current = false; // Allow retry if save failed
    } finally {
      setIsSaving(false);
    }
  }, [user, gameData, isSaving]); // Add isSaving to dependencies

  // Check for game completion whenever lockedStates changes
  useEffect(() => {
    if (!isLoading && lockedStates.length > 0 && lockedStates.every(locked => locked)) {
        const isNewlyFinished = !isFinished; // Check if this is the transition moment
        setIsFinished(true);
        if (user && isNewlyFinished && !scoreHasBeenSaved.current) {
            // Calculate final score (consistency with summary display)
            const correctCount = lockedStates.filter(Boolean).length;
            const scoreWithBonus = score + Math.round(correctCount * 5);
            saveScoreAPI(scoreWithBonus); // Call API to save score
        }
    }
  }, [isLoading, lockedStates, user, score, isFinished, saveScoreAPI]); // Added dependencies

  // Debounced check function
  const debouncedCheck = useCallback((index: number, currentInputValue: string) => {
    if (!fillInMoments[index] || lockedStates[index]) return; // Don't check if locked

    const correctAnswer = fillInMoments[index].answer.trim().toLowerCase();
    const trimmedInput = currentInputValue.trim().toLowerCase();

    let feedback = '';
    if (trimmedInput.length > 0 && correctAnswer.includes(trimmedInput) && trimmedInput !== correctAnswer) {
      feedback = 'Keep going, or be more specific...';
    }
    setFeedbackMessages(prev => {
      const newFeedback = [...prev];
      newFeedback[index] = feedback;
      return newFeedback;
    });
  }, [fillInMoments, lockedStates]);

  // Handle Input Change with debouncing and locking
  const handleInputChange = (index: number, value: string) => {
    if (lockedStates[index] || isFinished) return; // Don't allow changes if locked or finished

    // Update input state immediately
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);

    // Clear previous debounce timer for this input
    if (debounceTimers.current[index]) {
      clearTimeout(debounceTimers.current[index] as NodeJS.Timeout);
      debounceTimers.current[index] = null;
    }
     // Clear feedback immediately on new input
    setFeedbackMessages(prev => {
        const newFeedback = [...prev];
        newFeedback[index] = '';
        return newFeedback;
    });

    // Check for exact match
    const correctAnswer = fillInMoments[index].answer.trim().toLowerCase();
    const trimmedInput = value.trim().toLowerCase();

    if (trimmedInput === correctAnswer) {
      // Exact match: lock the state, update score, clear feedback
      setLockedStates(prevLocked => {
          const newLocked = [...prevLocked];
          // Only update score if it wasn't already locked
          if (!newLocked[index]) {
              setScore(prevScore => prevScore + Math.round(fillInMoments[index].importance * 10))
          }
          newLocked[index] = true;
          return newLocked;
      });
       setFeedbackMessages(prev => {
           const newFeedback = [...prev];
           newFeedback[index] = '';
           return newFeedback;
       });
    } else {
       // Not an exact match: set up debounce timer for partial check
       debounceTimers.current[index] = setTimeout(() => {
         debouncedCheck(index, value);
       }, DEBOUNCE_DELAY);
    }
  };

  const restartGame = () => {
    setGameData(null); // Clear data to show loading
    setIsLoading(true);
    setError(null);
    setIsFinished(false);
    setScore(0);
    // Reset save flags
    scoreHasBeenSaved.current = false;
    setIsSaving(false);
    setSaveError(null);
    // Trigger fetch again by reloading (simplest for now)
    window.location.reload();
  }

  // --- Handle Loading and Error States --- //
  if (isLoading) {
      return <div className="container mx-auto p-4 text-center">Loading Daily Challenge...</div>
  }

  if (error) {
      return <div className="container mx-auto p-4 text-center text-red-600">
          Error loading challenge: {error}
      </div>
  }

  if (!gameData || !startMoment || !endMoment) {
    // This case should ideally be covered by loading/error, but added as a fallback
    return <div className="container mx-auto p-4 text-center">Challenge data is unavailable.</div>
  }

  // --- Render Game --- //
  if (!isFinished) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">{gameData.title}</h1>
        <p className="text-center text-gray-600 mb-6">Fill in the key moments. Correct answers lock automatically!</p>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
          {/* Start Moment Context */}
          <div className="mb-6 p-4 bg-gray-100 rounded border border-gray-200">
            <p className="text-lg text-gray-800 font-semibold">{startMoment.context}</p>
          </div>

          {/* Fill-in Blanks */}
          <div className="space-y-4 mb-6">
            {fillInMoments.map((moment, index) => (
              <div key={moment.index}>
                <label htmlFor={`moment-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {index + 1}. {moment.prompt}
                </label>
                <input
                  type="text"
                  id={`moment-${index}`}
                  value={userInputs[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  disabled={lockedStates[index]} // Disable when locked
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm 
                    ${lockedStates[index]
                      ? 'bg-green-50 border-green-300 text-gray-700 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                />
                {/* Feedback Message Area */}
                {feedbackMessages[index] && (
                  <p className="text-xs text-orange-600 mt-1">{feedbackMessages[index]}</p>
                )}
              </div>
            ))}
          </div>

          {/* End Moment Context */}
          <div className="mb-8 p-4 bg-gray-100 rounded border border-gray-200">
            <p className="text-lg text-gray-800 font-semibold">{endMoment.context}</p>
          </div>

        </div>

        {/* User login status indicator */}
        <div className="text-center mt-6">
          {authLoading ? (
            <p className="text-gray-500 text-sm">Loading user status...</p>
          ) : user ? (
            <p className="text-green-600 text-sm">Logged in as {user.email} (Score will be saved)</p>
          ) : (
            <p className="text-gray-500 text-sm">Log in to save your score!</p>
          )}
        </div>
      </div>
    )
  }

  // --- Render Summary Screen --- //
  if (isFinished) {
    const correctCount = lockedStates.filter(Boolean).length;
    const scoreWithBonus = score + Math.round(correctCount * 5);

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Daily Challenge Complete!</h1>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Your Results for {gameData.title}</h2>
          <p className="text-4xl font-bold text-indigo-600 mb-4">{scoreWithBonus}</p>
          <p className="text-lg text-gray-700 mb-6">You correctly identified all {fillInMoments.length} key moments!</p>

          {/* Recap */}
          <div className="mt-6 border-t pt-4 text-left space-y-3">
             <h3 className="text-xl font-semibold mb-3 text-center">Recap:</h3>
            {fillInMoments.map((moment, index) => (
              <div key={moment.index} className="p-3 rounded border bg-green-50 border-green-200">
                <p className="font-medium text-gray-800">{index + 1}. {moment.prompt}</p>
                <p className="text-sm text-green-700">
                  Correct Answer: <span className="font-semibold">{moment.answer}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Save Status Indicator */}
          {user && (
            <div className="mt-4">
                {isSaving && <p className="text-blue-600 text-sm">Saving score...</p>}
                {saveError && <p className="text-red-600 text-sm">Save failed: {saveError}</p>}
                {!isSaving && scoreHasBeenSaved.current && !saveError && <p className="text-green-600 text-sm">Your score has been saved.</p>}
                {!isSaving && !scoreHasBeenSaved.current && saveError && (
                     <button
                        onClick={() => saveScoreAPI(scoreWithBonus)} // Allow retry
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        Retry Save?
                    </button>
                )}
            </div>
          )}
          {!user && (
            <p className="text-gray-500 text-sm mt-4">Log in to save your scores for future challenges!</p>
          )}

          <button
            onClick={restartGame}
            className="mt-8 px-6 py-3 rounded-md text-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 transition duration-300"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return null;
} 