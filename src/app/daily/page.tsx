'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import dailyChallengeData from '@/data/daily-challenge.json' // Import static data
import { supabase } from '@/utils/supabase' // For saving score later
import toast from 'react-hot-toast'

interface Moment {
  index: number;
  context: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  importance: number;
}

interface GameData {
  gameId: string;
  title: string;
  moments: Moment[];
}

export default function DailyChallengePage() {
  const { user, loading: authLoading } = useAuth()
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [missedHighImportance, setMissedHighImportance] = useState<Moment[]>([])

  useEffect(() => {
    // Load static data on component mount
    setGameData(dailyChallengeData as GameData)
  }, [])

  const currentMoment = gameData?.moments[currentMomentIndex]

  const handleSelectAnswer = (index: number) => {
    if (!isRevealed) {
      setSelectedAnswer(index)
    }
  }

  const handleReveal = () => {
    if (selectedAnswer === null || !currentMoment) return

    setIsRevealed(true)
    if (selectedAnswer === currentMoment.answer) {
      setScore(prev => prev + Math.round(currentMoment.importance * 10)) // Score based on importance
      setCorrectAnswers(prev => prev + 1)
    } else {
      // Track missed high-importance moments (e.g., importance > 9)
      if (currentMoment.importance >= 9.0) {
        setMissedHighImportance(prev => [...prev, currentMoment])
      }
    }
  }

  const handleNext = () => {
    if (!gameData) return
    setSelectedAnswer(null)
    setIsRevealed(false)
    if (currentMomentIndex < gameData.moments.length - 1) {
      setCurrentMomentIndex(prev => prev + 1)
    } else {
      setIsFinished(true)
      // Attempt to save score if user is logged in
      if (user) {
        saveScore()
      }
    }
  }

  const saveScore = async () => {
    if (!user || !gameData) return
    const finalScore = score + Math.round(correctAnswers * 5); // Add bonus for correct answers

    try {
      const { error } = await supabase
        .from('scores')
        .insert({
          user_id: user.id,
          game_id: gameData.gameId, // Use gameId from JSON
          mode: 'daily',
          score: finalScore,
        })
      if (error) throw error
      toast.success('Score saved!')
    } catch (error: any) {
      console.error("Error saving score:", error)
      toast.error(`Failed to save score: ${error.message}`)
    }
  }

  const restartGame = () => {
    setCurrentMomentIndex(0)
    setSelectedAnswer(null)
    setIsRevealed(false)
    setScore(0)
    setCorrectAnswers(0)
    setIsFinished(false)
    setMissedHighImportance([])
  }

  if (!gameData) {
    return <div className="container mx-auto p-4 text-center">Loading Challenge...</div>
  }

  // --- Render Game --- //
  if (!isFinished && currentMoment) {
    const isCorrect = selectedAnswer === currentMoment.answer
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2 text-center">{gameData.title}</h1>
        <p className="text-center text-gray-600 mb-6">Moment {currentMomentIndex + 1} of {gameData.moments.length}</p>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
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

          {!isRevealed ? (
            <button
              onClick={handleReveal}
              disabled={selectedAnswer === null}
              className="w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
            >
              Reveal Answer
            </button>
          ) : (
            <div className="mt-6 p-4 rounded 
              ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
              border" 
            >
              <p className={`font-semibold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect.'}
              </p>
              <p className="text-gray-800 mb-2">{currentMoment.explanation}</p>
              <p className="text-sm text-gray-600">Importance Score: <span className="font-medium">{currentMoment.importance}/10</span></p>
              <button
                onClick={handleNext}
                className="w-full mt-4 px-6 py-3 rounded-md text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
              >
                {currentMomentIndex < gameData.moments.length - 1 ? 'Next Moment' : 'Finish Challenge'}
              </button>
            </div>
          )}
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
    const finalScore = score + Math.round(correctAnswers * 5); // Add bonus for correct answers
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Daily Challenge Complete!</h1>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Your Results for {gameData.title}</h2>
          <p className="text-4xl font-bold text-indigo-600 mb-4">{finalScore}</p>
          <p className="text-lg text-gray-700 mb-6">You answered {correctAnswers} out of {gameData.moments.length} moments correctly.</p>

          {missedHighImportance.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xl font-semibold mb-3 text-red-600">Key Moments Missed:</h3>
              <ul className="list-disc list-inside text-left space-y-2 text-gray-700">
                {missedHighImportance.map(moment => (
                  <li key={moment.index}>
                    <span className="font-medium">Moment {moment.index + 1}:</span> {moment.question} (Importance: {moment.importance})
                    <p className="text-sm pl-4 italic">{moment.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user ? (
              <p className="text-green-600 text-sm mt-4">Your score has been saved.</p>
          ) : (
            <p className="text-gray-500 text-sm mt-4">Log in to save your scores for future challenges!</p>
          )}

          <button
            onClick={restartGame} // Option to restart or navigate away
            className="mt-8 px-6 py-3 rounded-md text-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 transition duration-300"
          >
            Play Again (Test)
          </button>
          {/* Add Link to go back home or to dashboard */}
        </div>
      </div>
    )
  }

  return null; // Should not happen if gameData loads
} 