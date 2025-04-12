'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TransitionLayout from '@/components/layout/TransitionLayout'
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/solid'

interface GameData {
  gameId: string;
  title: string;
}

export default function HomePage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/getDailyChallenge');
        if (!response.ok) throw new Error('Failed to fetch daily challenge');
        const loadedGameData: GameData = await response.json();
        setGameData(loadedGameData);
        setIsLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        setGameData(null);
        setIsLoading(false);
      } 
    };
    fetchGameData();
  }, []);

  if (isLoading) {
    return (
      <TransitionLayout transitionMode="fade" showHeader={false} showFooter={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
             <ArrowPathIcon className="h-12 w-12 mx-auto text-yellow-500 animate-spin mb-4" />
             Loading Daily Challenge...
          </div>
        </div>
      </TransitionLayout>
    );
  }

  if (error || !gameData) {
    return (
      <TransitionLayout transitionMode="fade" showHeader={false} showFooter={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            {error || 'No challenge data available. Please try again later.'}
          </div>
        </div>
      </TransitionLayout>
    );
  }

  return (
    <TransitionLayout transitionMode="fade" showHeader={false} showFooter={false}>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 dark:from-gray-800 dark:via-gray-900 dark:to-black z-0">
          <div className="absolute inset-0 bg-[url('/images/subtle-texture.png')] opacity-10 dark:opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-xl">
          {/* Centered logo */}
          <div className="mb-8">
            <div className="flex justify-center mb-2">
              <Image 
                src="/images/applogo.png" 
                alt="FanFrenzy Logo" 
                width={300}
                height={120}
                priority
                className="h-auto w-auto"
              />
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
              Daily Challenge
            </p>
          </div>

          {/* Smaller challenge card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 max-w-sm mx-auto mb-10">
            <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-yellow-500 dark:text-yellow-400"/>
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
              Today&apos;s Challenge
            </h2>
            <p className="text-md text-gray-600 dark:text-gray-300 mb-6 italic">
              {gameData.title}
            </p>
            <Link href="/play" className="inline-block w-full">
              <button 
                className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Start Quiz
              </button>
            </Link>
          </div>
        </div>
      </div>
    </TransitionLayout>
  );
}
