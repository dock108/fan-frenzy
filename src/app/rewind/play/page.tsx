'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext' // If needed for saving scores later
import toast from 'react-hot-toast'

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
}

// --- Component --- //
export default function RewindPlayPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth(); // Get user for potential score saving

  // Game Parameters
  const team = searchParams.get('team')
  const year = searchParams.get('year')
  const gameId = searchParams.get('gameId')

  // Fetching State
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gameplay State
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [skippedMoments, setSkippedMoments] = useState<number[]>([]); // Store indices of skipped moments
  const [missedHighImportance, setMissedHighImportance] = useState<MultipleChoiceMoment[]>([]);

  // Fetch Game Data
  useEffect(() => {
      if (!team || !year || !gameId) {
          setError('Missing team, year, or game information in URL.');
          setIsLoading(false);
          return;
      }
      const fetchGame = async () => {
          setIsLoading(true);
          setError(null);
          // Reset gameplay state on new fetch
          setCurrentMomentIndex(0);
          setSelectedAnswer(null);
          setIsRevealed(false);
          setScore(0);
          setCorrectAnswersCount(0);
          setIsFinished(false);
          setSkippedMoments([]);
          setMissedHighImportance([]);

          try {
              const response = await fetch(`/api/fetchGame?team=${team}&year=${year}&gameId=${gameId}`);
              const data = await response.json();
              if (!response.ok) {
                  throw new Error(data.message || `HTTP error! Status: ${response.status}`);
              }
              // Basic validation of the fetched data format
              if (!data || !Array.isArray(data.key_moments) || data.key_moments.length === 0 || data.key_moments[0].type !== 'mc'){
                   throw new Error('Invalid game data format received from API. Expected multiple-choice moments.');
              }
              setGameData(data as GameData);
          } catch (err: any) {
              console.error("Failed to fetch game data:", err);
              setError(err.message || 'An unknown error occurred.');
              setGameData(null);
          } finally {
              setIsLoading(false);
          }
      };

      fetchGame();

  }, [team, year, gameId]); // Re-fetch if params change

  const mcMoments = gameData?.key_moments.filter(m => m.type === 'mc') as MultipleChoiceMoment[] || [];
  const currentMoment = mcMoments[currentMomentIndex];

  // --- Event Handlers --- //
  const handleSelectAnswer = (index: number) => {
    if (!isRevealed) {
      setSelectedAnswer(index);
    }
  };

  const handleReveal = () => {
    if (selectedAnswer === null || !currentMoment) return;
    setIsRevealed(true);
    if (selectedAnswer === currentMoment.answer) {
      setScore(prev => prev + Math.round(currentMoment.importance * 10));
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      if (currentMoment.importance >= 8.5) {
        setMissedHighImportance(prev => [...prev, currentMoment]);
      }
    }
  };

  const handleSkip = () => {
    if (!currentMoment) return;
    // Award partial score for skipping (e.g., 1 point or small fraction of importance)
    setScore(prev => prev + 1); // Example: 1 point for skipping
    setSkippedMoments(prev => [...prev, currentMoment.index]);
    gotoNextMoment();
  };

  const handleNext = () => {
     gotoNextMoment();
  }

  const gotoNextMoment = () => {
      setSelectedAnswer(null);
      setIsRevealed(false);
      if (currentMomentIndex < mcMoments.length - 1) {
          setCurrentMomentIndex(prev => prev + 1);
      } else {
          setIsFinished(true);
          // TODO: Add score saving logic here if Rewind scores should be saved
          // Similar to Daily Challenge, potentially call /api/saveScore with mode='rewind'
      }
  }

  // --- Render Logic --- //

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading game: {gameId}...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-600">Error: {error}</p>
        <Link href="/rewind" className="text-indigo-600 hover:underline mt-4 block">Go back to selection</Link>
      </div>
    );
  }

  if (!gameData || !currentMoment && !isFinished) {
    return <div className="container mx-auto p-4 text-center">Game data unavailable or invalid.</div>;
  }

  // --- Render Game --- //
  if (!isFinished && currentMoment) {
      const isCorrect = selectedAnswer === currentMoment.answer;
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Team Rewind: {gameData.event_data?.summary || gameId}</h1>
        <p className="text-center text-gray-600 mb-6">Moment {currentMomentIndex + 1} of {mcMoments.length}</p>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
          {/* Moment Card Content */}
          <p className="text-lg text-gray-700 mb-4 italic">{currentMoment.context}</p>
          <h2 className="text-xl font-semibold mb-5">{currentMoment.question}</h2>

          <div className="space-y-3 mb-6">
            {currentMoment.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={isRevealed}
                className={`block w-full text-left p-3 rounded border transition-colors duration-200 
                  ${isRevealed
                    ? (index === currentMoment.answer ? 'bg-green-100 border-green-300 text-green-800' : 'bg-gray-100 border-gray-300 text-gray-500')
                    : (selectedAnswer === index ? 'bg-indigo-100 border-indigo-400' : 'bg-white border-gray-300 hover:bg-gray-50')
                  }
                  ${!isRevealed ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Action Buttons */} 
          <div className="flex flex-col sm:flex-row gap-3">
              {!isRevealed ? (
                  <>
                      <button
                          onClick={handleReveal}
                          disabled={selectedAnswer === null}
                          className="flex-1 px-6 py-3 rounded-md text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
                      >
                          Reveal Answer
                      </button>
                      <button
                          onClick={handleSkip}
                          className="flex-1 px-6 py-3 rounded-md text-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-300"
                      >
                          Skip Moment (+1 pt)
                      </button>
                  </>
              ) : (
                  <button
                      onClick={handleNext}
                      className="w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
                      >
                      {currentMomentIndex < mcMoments.length - 1 ? 'Next Moment' : 'Finish Challenge'}
                  </button>
              )}
            </div>

            {/* Reveal Panel */} 
            {isRevealed && (
              <div className={`mt-6 p-4 rounded border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`font-semibold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect.'}
                  </p>
                  <p className="text-gray-800 mb-2">{currentMoment.explanation}</p>
                  <p className="text-sm text-gray-600">Importance Score: <span className="font-medium">{currentMoment.importance}/10</span></p>
              </div>
          )}
        </div>
      </div>
    );
  }

  // --- Render Summary Screen --- //
  if (isFinished) {
      const finalScore = score; // Base score + skip points
      const momentsAttempted = mcMoments.length - skippedMoments.length;
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Team Rewind Complete!</h1>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Your Results for {gameData?.event_data?.summary || gameId}</h2>
          <p className="text-4xl font-bold text-indigo-600 mb-4">{finalScore}</p>
          <p className="text-lg text-gray-700">You answered {correctAnswersCount} out of {momentsAttempted} moments correctly.</p>
          <p className="text-lg text-gray-700 mb-6">You skipped {skippedMoments.length} moment(s).</p>

          {missedHighImportance.length > 0 && (
            <div className="mt-6 border-t pt-4 text-left">
              <h3 className="text-xl font-semibold mb-3 text-red-600 text-center">Key Moments Missed (Importance >= 8.5):</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {missedHighImportance.map(moment => (
                  <li key={moment.index}>
                    <span className="font-medium">Moment {moment.index + 1}:</span> {moment.question} (Importance: {moment.importance})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add Save Score button/logic here if needed */}

          <Link href="/rewind" className="mt-8 inline-block px-6 py-3 rounded-md text-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 transition duration-300">
            Select Another Game
          </Link>
        </div>
      </div>
    );
  }

  return null; // Should not be reached
} 