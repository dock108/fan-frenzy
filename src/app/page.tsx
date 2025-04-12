'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TransitionLayout from '@/components/layout/TransitionLayout'
import { ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/solid'

interface GameData {
  id: string;
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
        const loadedGameData: { id: string; title: string } = await response.json();
        setGameData({ id: loadedGameData.id, title: loadedGameData.title });
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
      <TransitionLayout transitionMode="fade" showHeader={false} showFooter={true}>
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
      <TransitionLayout transitionMode="fade" showHeader={false} showFooter={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 text-gray-500">
            {error || 'No challenge data available. Please try again later.'}
          </div>
        </div>
      </TransitionLayout>
    );
  }

  return (
    <TransitionLayout transitionMode="fade" showHeader={false} showFooter={true}>
      <div className="flex flex-col items-center justify-center p-4 text-center bg-gray-50">
        
        <div className="absolute top-4 right-4 z-20">
        </div>
        
        <div className="relative z-10 max-w-xl">
          <div className="flex flex-col items-center justify-center py-8 bg-gray-50">
            <Image 
              src="/images/applogo.png" 
              alt="FanFrenzy logo - daily sports memory challenge game" 
              width={220} 
              height={88} 
              priority
              className="w-[150px] md:w-[220px] h-auto mb-2"
            />
            <h1 className="text-xl md:text-2xl font-semibold text-center text-gray-800">
              FanFrenzy: Daily Sports Memory Challenge
            </h1>
          </div>

          <div className="bg-amber-50 rounded-xl shadow-lg p-4 max-w-sm mx-auto mb-4">
            <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2 text-yellow-500"/>
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              Today&apos;s Challenge
            </h2>
            <p className="text-md text-gray-600 mb-4 italic">
              {gameData.title}
            </p>
            <Link href="/daily" className="inline-block w-full">
              <button 
                className="w-full px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
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
