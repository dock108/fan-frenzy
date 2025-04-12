'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Cookies from 'js-cookie'
import TransitionLayout from '@/components/layout/TransitionLayout'
import AdminDateSelector from '@/components/AdminDateSelector'
import DailyOrderingGame from '@/components/DailyOrderingGame'
import ScoringGuide from '@/components/ScoringGuide'
import { ArrowPathIcon, XCircleIcon, HomeIcon, CheckCircleIcon } from '@heroicons/react/24/solid'

// Simplified type definitions
interface Moment { // Define Moment type if not imported globally
  index: number;
  type: 'start' | 'moment' | 'end';
  text?: string;
  context?: string;
  importance?: number;
}
interface ChallengeBase {
  id: string
  title: string
  mode: 'order'; // Only 'order' mode supported now
  meta?: {
    event_date?: string;
    kickoff_et?: string; // Optional kickoff time
    venue?: string;
    // Add other potential meta fields if needed
  };
}
interface OrderChallenge extends ChallengeBase { questions: Moment[]; }

type Challenge = OrderChallenge; // Only OrderChallenge

const COOKIE_NAME = 'played_daily_challenge';

function DailyChallengeContent() {
  const searchParams = useSearchParams()
  const adminDate = searchParams.get('adminDate')

  const [challengeData, setChallengeData] = useState<Challenge | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPlayedToday, setHasPlayedToday] = useState<boolean>(false);

  useEffect(() => {
    const playedCookie = Cookies.get(COOKIE_NAME);
    if (playedCookie === 'true' && !adminDate) {
      setHasPlayedToday(true);
      setIsLoading(false);
      return;
    }
    setHasPlayedToday(false);

    const fetchChallenge = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const apiUrl = adminDate
          ? `/api/getDailyChallenge?adminDate=${adminDate}`
          : '/api/getDailyChallenge'

        const response = await fetch(apiUrl)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to fetch challenge (Status: ${response.status})`)
        }
        const data: Challenge = await response.json()

        if (data.mode !== 'order') {
          throw new Error(`Unsupported challenge mode received: ${data.mode}. Only 'order' mode is supported.`)
        }
        if (!data.questions) {
          throw new Error('Challenge data is missing questions.')
        }

        setChallengeData(data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(message)
        setChallengeData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChallenge()
  }, [adminDate])

  // Function to remove year in parentheses from title
  const formatTitle = (title: string): string => {
    // Regex to match ' (YYYY)' at the end of the string
    return title.replace(/\s*\(\d{4}\)$/, '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 text-gray-600">
        <ArrowPathIcon className="h-8 w-8 animate-spin mr-2" /> Loading Challenge...
      </div>
    )
  }

  if (hasPlayedToday) {
    return (
      <div className="p-6 text-center text-blue-700 bg-blue-50 rounded-lg shadow-sm border border-blue-200 max-w-md mx-auto">
        <CheckCircleIcon className="h-10 w-10 mx-auto text-blue-500 mb-3" />
        <p className="font-semibold mb-1">Already Played Today!</p>
        <p className="text-sm">You have completed today&apos;s challenge. Come back tomorrow for a new one!</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg shadow-sm border border-red-200">
        <XCircleIcon className="h-10 w-10 mx-auto text-red-500 mb-3" />
        <p className="font-semibold mb-1">Error Loading Challenge</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!challengeData) {
    return <div className="p-6 text-center text-gray-500">No challenge data found for the selected date.</div>
  }

  // --- Corrected Return Structure --- 
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Game Details Card - Updated */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-center">
        {/* Line 1: Title (Largest) - Year removed */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">{formatTitle(challengeData.title)}</h1>
        
        {/* Line 2: Date (Smaller) */}
        {challengeData.meta?.event_date && (
            <p className="text-sm text-gray-600">{challengeData.meta.event_date}</p>
        )}

        {/* Line 3: Venue (Smallest) */}
        {challengeData.meta?.venue && (
            <p className="text-xs text-gray-500 mt-0.5">{challengeData.meta.venue}</p>
        )}
      </div>

      {/* Grid for Game and Scoring Guide */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Game Component Area */}
        <div className="lg:col-span-2">
          <DailyOrderingGame 
            key={challengeData.id} // Use challenge ID as key
            questions={challengeData.questions} 
            title={challengeData.title} // Pass title to game component IF needed by modal
          />
        </div>
        {/* Scoring Guide Area */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <ScoringGuide />
        </div>
      </div>
    </div>
  );
}

// Main Page Component using Suspense
export default function DailyPage() {
  return (
    <TransitionLayout showHeader={false} showFooter={true}>
      <div className="relative">
        {/* Home Icon */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="./" className="text-gray-600 hover:text-yellow-500 p-1 rounded-md hover:bg-gray-100" aria-label="Go Home">
            <HomeIcon className="h-6 w-6" />
          </Link>
        </div>
        
        {/* Logo - Resized */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Link href="./">
            <Image 
              src="/images/applogo.png" 
              alt="FanFrenzy Home" 
              width={180}  // Increased width
              height={45} // Increased height
              priority 
              className="h-auto"
            />
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="pt-20">
          <AdminDateSelector />
          <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-600"><ArrowPathIcon className="h-8 w-8 animate-spin mr-2" /> Loading...</div>} >
            <DailyChallengeContent />
          </Suspense>
        </div>
      </div>
    </TransitionLayout>
  )
}