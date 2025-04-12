'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          FanFrenzy
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/play" className="hover:text-gray-300">
            Play Challenge
              </Link>
        </div>
      </nav>
    </header>
  )
} 