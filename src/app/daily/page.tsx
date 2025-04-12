'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import dailyChallengeData from '@/data/daily-challenge.json'
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

export default function DailyChallengePage() {
  const { user, loading: authLoading } = useAuth()
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [userInputs, setUserInputs] = useState<string[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [results, setResults] = useState<boolean[]>([]) // Store correctness for each blank
  const [score, setScore] = useState(0)

  const fillInMoments = gameData?.moments.filter(m => m.type === 'fill-in') as FillInMoment[] || [];
  const startMoment = gameData?.moments.find(m => m.type === 'start') as StartEndMoment | undefined;
  const endMoment = gameData?.moments.find(m => m.type === 'end') as StartEndMoment | undefined;

  useEffect(() => {
    setGameData(dailyChallengeData as GameData)
  }, [])

  useEffect(() => {
    if (fillInMoments.length > 0) {
      setUserInputs(Array(fillInMoments.length).fill(''))
      setResults(Array(fillInMoments.length).fill(false))
    }
  }, [gameData]) // Initialize inputs/results when gameData loads

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs]
    newInputs[index] = value
    setUserInputs(newInputs)
  }

  const handleSubmit = () => {
    if (!fillInMoments) return;

    let currentScore = 0;
    const currentResults = fillInMoments.map((moment, index) => {
      const isCorrect = moment.answer.toLowerCase() === userInputs[index].trim().toLowerCase();
      if (isCorrect) {
        currentScore += Math.round(moment.importance * 10); // Score based on importance
      }
      return isCorrect;
    });

    setResults(currentResults);
    setScore(currentScore);
    setIsFinished(true);

    if (user) {
      saveScore(currentScore, currentResults.filter(Boolean).length);
    }
  };

  const saveScore = async (finalScore: number, correctCount: number) => {
    if (!user || !gameData) return;
    // Add bonus for correct answers (adjust multiplier as needed)
    const scoreWithBonus = finalScore + Math.round(correctCount * 5);

    try {
      const { error } = await supabase
        .from('scores')
        .insert({
          user_id: user.id,
          game_id: gameData.gameId,
          mode: 'daily-fill-in', // New mode identifier
          score: scoreWithBonus,
        })
      if (error) throw error
      toast.success('Score saved!')
    } catch (error: any) {
      console.error("Error saving score:", error)
      toast.error(`Failed to save score: ${error.message}`)
    }
  }

  const restartGame = () => {
    setUserInputs(Array(fillInMoments.length).fill(''))
    setResults(Array(fillInMoments.length).fill(false))
    setIsFinished(false)
    setScore(0)
  }

  if (!gameData || !startMoment || !endMoment) {
    return <div className="container mx-auto p-4 text-center">Loading Challenge...</div>
  }

  // --- Render Game --- //
  if (!isFinished) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">{gameData.title}</h1>
        <p className="text-center text-gray-600 mb-6">Fill in the key moments between the start and end!</p>

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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            ))}
          </div>

          {/* End Moment Context */}
          <div className="mb-8 p-4 bg-gray-100 rounded border border-gray-200">
            <p className="text-lg text-gray-800 font-semibold">{endMoment.context}</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
          >
            Submit Guesses
          </button>
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
    const correctCount = results.filter(Boolean).length;
    const scoreWithBonus = score + Math.round(correctCount * 5);

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Daily Challenge Complete!</h1>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Your Results for {gameData.title}</h2>
          <p className="text-4xl font-bold text-indigo-600 mb-4">{scoreWithBonus}</p>
          <p className="text-lg text-gray-700 mb-6">You correctly filled in {correctCount} out of {fillInMoments.length} moments.</p>

          <div className="mt-6 border-t pt-4 text-left space-y-3">
             <h3 className="text-xl font-semibold mb-3 text-center">Your Answers:</h3>
            {fillInMoments.map((moment, index) => (
              <div key={moment.index} className={`p-3 rounded border ${results[index] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="font-medium text-gray-800">{index + 1}. {moment.prompt}</p>
                <p className={`text-sm ${results[index] ? 'text-green-700' : 'text-red-700'}`}>
                  Your answer: <span className="italic">{userInputs[index] || '-'}</span>
                  {!results[index] && <span className="font-semibold"> (Correct: {moment.answer})</span>}
                </p>
              </div>
            ))}
          </div>

          {user ? (
              <p className="text-green-600 text-sm mt-4">Your score has been saved.</p>
          ) : (
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