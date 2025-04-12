'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {showHeader && (
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
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
                <Link href="/" className="text-gray-600 hover:text-teamPrimary transition-colors">
                  Home
                </Link>
                <Link href="/daily" className="text-gray-600 hover:text-teamPrimary transition-colors">
                  Daily Challenge
                </Link>
              </nav>
              
              {/* Mobile menu toggle */}
              <div className="flex items-center space-x-3">
                
                {/* Mobile menu toggle */}
                <button 
                  onClick={() => setMobileMenuOpen(true)} 
                  className="md:hidden w-8 h-8 flex items-center justify-center text-gray-600"
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
      
      {/* Main content - Reduced vertical padding */}
      <main className="flex-grow container mx-auto px-4 py-4">
        {children}
      </main>
      
      {/* Footer */}
      {showFooter && (
        <footer className="bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} FanFrenzy - Powered by Dock108
            </div>
          </div>
        </footer>
      )}
    </div>
  );
} 