'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import toast, { Toaster } from 'react-hot-toast';

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

const DEBOUNCE_DELAY = 1500; // ms

export default function DailyChallengePage() {
  const { user, loading: authLoading } = useAuth();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [lockedStates, setLockedStates] = useState<boolean[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const debounceTimers = useRef<(NodeJS.Timeout | number | null)[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scoreHasBeenSaved = useRef(false);

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
      setIsLoading(true);
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
          debounceTimers.current = Array(currentFillInMoments.length).fill(null);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        setGameData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGameData();
    return () => { debounceTimers.current.forEach(timerId => { if (timerId) clearTimeout(timerId as NodeJS.Timeout); }); };
  }, []);

  const saveScoreAPI = useCallback(async (finalScore: number) => {
    if (!user || !gameData || scoreHasBeenSaved.current || isSaving) return;
    const payload = { gameId: gameData.gameId, score: finalScore };
    try {
      const response = await fetch('/api/saveScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save score');
      toast.success('Score saved successfully');
      scoreHasBeenSaved.current = true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save score';
      setSaveError(message);
      toast.error(`Save failed: ${message}`);
      scoreHasBeenSaved.current = false;
    } finally {
      setIsSaving(false);
    }
  }, [user, gameData, isSaving]);

  useEffect(() => {
    if (!isLoading && fillInMoments.length > 0 && lockedStates.length === fillInMoments.length && lockedStates.every(Boolean)) {
      const isNewlyFinished = !isFinished;
      setIsFinished(true);
      if (user && isNewlyFinished && !scoreHasBeenSaved.current) {
        const correctCount = lockedStates.filter(Boolean).length;
        const scoreWithBonus = score + Math.round(correctCount * 5);
        saveScoreAPI(scoreWithBonus);
      }
    }
  }, [isLoading, lockedStates, user, score, saveScoreAPI, fillInMoments, isFinished]);

  const debouncedCheck = useCallback((index: number, currentInputValue: string) => {
    // ... logic using fillInMoments[index] ...
  }, [fillInMoments, lockedStates]);

  const handleInputChange = (index: number, value: string) => {
    // ... logic using fillInMoments[index] and debouncedCheck ...
  };

  const restartGame = () => {
    // ...
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading Daily Challenge...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-600">
      Error loading challenge: {error}
    </div>
  }

  if (!gameData || !startMoment || !endMoment) {
    return <div className="container mx-auto p-4 text-center">No challenge data available.</div>;
  }

  if (!isFinished) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Toaster position="top-center" />
        <h1 className="text-3xl font-bold mb-2 text-center">Daily Challenge</h1>
        <h2 className="text-xl text-gray-600 mb-6 text-center">{gameData.title}</h2>

        {/* Start Context */}
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">{startMoment.context}</p>
        </div>

        {/* Fill-in Moments */}
        <div className="space-y-4">
          {fillInMoments.map((moment, index) => (
            <div key={moment.index} className={`p-4 border rounded-md transition-colors duration-300 ${lockedStates[index] ? (feedbackMessages[index].startsWith('Correct') ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-gray-200 bg-white'}`}>
              <label htmlFor={`moment-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                {moment.prompt}
              </label>
              <input
                id={`moment-${index}`}
                type="text"
                value={userInputs[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                disabled={lockedStates[index]}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${lockedStates[index] ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                placeholder="Type your answer..."
              />
              {feedbackMessages[index] && (
                <p className={`mt-2 text-sm ${feedbackMessages[index].startsWith('Correct') ? 'text-green-600' : 'text-red-600'}`}>
                  {feedbackMessages[index]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* End Context */}
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">{endMoment.context}</p>
        </div>

        {/* Submit/Next Button (logic handled by locking) */} 
         <div className="mt-6 text-center text-sm text-gray-500">
             {lockedStates.filter(l => !l).length > 0 
                 ? `${lockedStates.filter(l => !l).length} moment(s) remaining...`
                 : "Checking final answer..."
             }
         </div>
      </div>
    );
  } else {
    // Results Summary View
    return (
      <div className="container mx-auto p-4 max-w-2xl text-center">
        <Toaster position="top-center" />
        <h1 className="text-3xl font-bold mb-4">Daily Challenge Complete!</h1>
        <h2 className="text-xl text-gray-700 mb-6">{gameData.title}</h2>

        <div className="p-6 bg-blue-50 rounded-lg shadow-md border border-blue-200 mb-6">
          <p className="text-2xl font-semibold text-blue-800 mb-2">Final Score: {score}</p>
          <p className="text-gray-600 mb-4">You got {feedbackMessages.filter(f => f.startsWith('Correct')).length} out of {fillInMoments.length} moments correct.</p>
          
           {/* Save Status Display */} 
           <div className="mt-4 text-center text-sm h-6"> {/* Added fixed height */} 
               {!user && !authLoading && <p className="text-gray-600">(Log in to save your score)</p>} 
               {user && isSaving && <p className="text-blue-600 animate-pulse">Saving score...</p>} 
               {user && !isSaving && saveError && <p className="text-red-600">Could not save score: {saveError}</p>} 
               {user && !isSaving && !saveError && scoreHasBeenSaved.current && <p className="text-green-600 font-semibold">Score saved successfully!</p>} 
               {user && !isSaving && !saveError && !scoreHasBeenSaved.current && <p className="text-yellow-600">Attempting to save...</p>} {/* Indicate attempt before success/fail */} 
           </div>
        </div>

        {/* Display the moments with answers */} 
        <div className="space-y-4 text-left mb-8">
          {fillInMoments.map((moment, index) => (
            <div key={moment.index} className={`p-4 border rounded-md ${feedbackMessages[index].startsWith('Correct') ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <p className="text-sm font-medium text-gray-800 mb-1">{moment.prompt}</p>
              <p className={`text-sm ${feedbackMessages[index].startsWith('Correct') ? 'text-green-700' : 'text-red-700'}`}>Your Answer: <span className="font-semibold">{userInputs[index] || "(No answer)"}</span></p>
              {!feedbackMessages[index].startsWith('Correct') && (
                  <p className="text-sm text-gray-600 mt-1">Correct Answer: <span className="font-semibold">{moment.answer}</span></p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
            <button 
              onClick={restartGame} // Link to the restart function
              className="px-6 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              Play Again Tomorrow
            </button>
            <Link 
              href="/leaderboard" 
              className="px-6 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              View Leaderboard
            </Link>
        </div>
      </div>
    );
  }
}