'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import TransitionLayout from '@/components/layout/TransitionLayout'

export default function Home() {
  const { user } = useAuth()

  return (
    <TransitionLayout transitionMode="fade">
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-teamPrimary/5 to-teamSecondary/10 backdrop-blur-sm z-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[url('/images/stadium-bg.jpg')] bg-cover bg-center opacity-10"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-teamPrimary to-teamAccent bg-clip-text text-transparent">
            FanFrenzy
          </h1>
          <p className="text-xl md:text-2xl font-light mb-10 text-foreground">
            For the Love of the Game
          </p>
          
          {user && (
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-sm mb-8 text-left">
              <p className="text-foreground font-medium">Welcome back, {user.email?.split('@')[0]}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ready to continue your journey?</p>
            </div>
          )}
          
          <button 
            className="px-8 py-4 bg-teamPrimary hover:bg-teamAccent text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Playing
          </button>
        </div>
      </div>
      
      {/* Mode Selector Section */}
      <div 
        className="pt-10 pb-20 px-6 md:px-10 max-w-7xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-center mb-16 text-foreground">
          Choose Your Game Mode
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Daily Challenge Card */}
          <div className="group relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/70 to-yellow-700/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-[url('/images/calendar-icon.jpg')] bg-cover bg-center opacity-20"></div>
            
            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              <div>
                <div className="bg-yellow-500 text-yellow-800 p-2 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-white transition-colors duration-300">Daily Challenge</h3>
                <p className="text-gray-600 dark:text-gray-300 group-hover:text-white/90 transition-colors duration-300">
                  Test your sports knowledge with a new challenge every day. Fill in the blanks to complete the story of a legendary sports moment.
                </p>
              </div>
              
              <Link href="/daily" className="w-full py-3 bg-white/90 dark:bg-gray-800/90 hover:bg-yellow-500 hover:text-white text-center rounded-lg font-medium transition-colors duration-300">
                Play Today's Challenge
              </Link>
            </div>
          </div>
          
          {/* Team Rewind Card */}
          <div className="group relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/70 to-blue-800/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-[url('/images/rewind-icon.jpg')] bg-cover bg-center opacity-20"></div>
            
            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              <div>
                <div className="bg-blue-600 text-blue-100 p-2 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-white transition-colors duration-300">Team Rewind</h3>
                <p className="text-gray-600 dark:text-gray-300 group-hover:text-white/90 transition-colors duration-300">
                  Relive key moments from your favorite team's history. Select your team and answer quiz questions about their biggest games.
                </p>
              </div>
              
              <Link href="/rewind" className="w-full py-3 bg-white/90 dark:bg-gray-800/90 hover:bg-blue-600 hover:text-white text-center rounded-lg font-medium transition-colors duration-300">
                Choose Your Team
              </Link>
            </div>
          </div>
          
          {/* Shuffle Mode Card */}
          <div className="group relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/70 to-green-700/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-[url('/images/shuffle-icon.jpg')] bg-cover bg-center opacity-20"></div>
            
            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              <div>
                <div className="bg-green-500 text-green-800 p-2 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-white transition-colors duration-300">Shuffle Mode</h3>
                <p className="text-gray-600 dark:text-gray-300 group-hover:text-white/90 transition-colors duration-300">
                  Put your memory to the test by arranging game moments in the correct chronological order. How well do you remember the sequence?
                </p>
              </div>
              
              <Link href="/shuffle" className="w-full py-3 bg-white/90 dark:bg-gray-800/90 hover:bg-green-500 hover:text-white text-center rounded-lg font-medium transition-colors duration-300">
                Start Shuffling
              </Link>
            </div>
          </div>
        </div>
        
        {/* Demo Links */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-3">Check out our features:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/theme-demo" className="px-4 py-2 bg-background border border-gray-200 dark:border-gray-700 hover:bg-teamPrimary hover:text-white rounded-lg transition-colors">
              Team Theme Demo
            </Link>
            <Link href="/transition-demo" className="px-4 py-2 bg-background border border-gray-200 dark:border-gray-700 hover:bg-teamSecondary hover:text-white rounded-lg transition-colors">
              Transition Demo
            </Link>
          </div>
        </div>
      </div>
    </TransitionLayout>
  );
}
