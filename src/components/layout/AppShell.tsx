'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenu from './MobileMenu';
import Image from 'next/image';

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Main layout component that wraps application content
 * Provides consistent header, footer, and structure
 */
export default function AppShell({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: AppShellProps) {
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get user initials for avatar placeholder
  const getUserInitials = () => {
    if (!user || !user.email) return '?';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              {/* Brand/Logo */}
              <Link href="/" className="flex items-center">
                <Image 
                  src="/images/applogo.png" 
                  alt="FanFrenzy Logo" 
                  width={140}
                  height={35}
                  priority
                />
              </Link>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/daily" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  Daily
                </Link>
                <Link href="/rewind" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  Rewind
                </Link>
                <Link href="/shuffle" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  Shuffle
                </Link>
                <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  Leaderboard
                </Link>
              </nav>
              
              {/* User section & Theme toggle */}
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                ) : user ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => signOut()}
                      className="text-sm px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Sign Out
                    </button>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teamPrimary text-white text-sm font-medium">
                      {getUserInitials()}
                    </div>
                  </div>
                ) : (
                  <Link href="/login" className="text-sm px-4 py-2 bg-teamPrimary hover:bg-teamAccent text-white rounded-md transition-colors">
                    Sign In
                  </Link>
                )}
                
                {/* Mobile menu toggle */}
                <button 
                  onClick={() => setMobileMenuOpen(true)} 
                  className="md:hidden w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300"
                  aria-label="Open mobile menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
                
                {/* Mobile menu */}
                <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      {showFooter && (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-gray-600 dark:text-gray-300">
                  © {new Date().getFullYear()} FanFrenzy
                </span>
              </div>
              <div className="flex flex-wrap justify-center space-x-6">
                <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  About
                </Link>
                <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  Privacy
                </Link>
                <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  Terms
                </Link>
                <Link href="https://github.com/Dock108/spoil-sports" className="text-gray-600 dark:text-gray-300 hover:text-teamPrimary dark:hover:text-teamPrimary transition-colors">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
} 