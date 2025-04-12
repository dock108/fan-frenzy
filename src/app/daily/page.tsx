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
      // ... JSX using startMoment, endMoment, fillInMoments, userInputs, lockedStates etc. ...
    );
  } else {
    return (
      // ... JSX for summary using fillInMoments, score etc. ...
    );
  }
}