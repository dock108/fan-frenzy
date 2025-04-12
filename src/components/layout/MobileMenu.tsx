'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  
  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);
  
  // Close menu when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-75 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold text-lg text-teamPrimary">Menu</p>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex flex-col space-y-4">
          <Link 
            href="/" 
            className={`px-4 py-2 rounded-md ${pathname === '/' ? 'bg-teamOverlay text-teamPrimary' : 'text-gray-600 dark:text-gray-300'} hover:bg-teamOverlay hover:text-teamPrimary transition-colors`}
          >
            Home
          </Link>
          <Link 
            href="/daily" 
            className={`px-4 py-2 rounded-md ${pathname === '/daily' ? 'bg-teamOverlay text-teamPrimary' : 'text-gray-600 dark:text-gray-300'} hover:bg-teamOverlay hover:text-teamPrimary transition-colors`}
          >
            Daily Challenge
          </Link>
          <Link 
            href="/rewind" 
            className={`px-4 py-2 rounded-md ${pathname === '/rewind' ? 'bg-teamOverlay text-teamPrimary' : 'text-gray-600 dark:text-gray-300'} hover:bg-teamOverlay hover:text-teamPrimary transition-colors`}
          >
            Team Rewind
          </Link>
          <Link 
            href="/shuffle" 
            className={`px-4 py-2 rounded-md ${pathname === '/shuffle' ? 'bg-teamOverlay text-teamPrimary' : 'text-gray-600 dark:text-gray-300'} hover:bg-teamOverlay hover:text-teamPrimary transition-colors`}
          >
            Shuffle Mode
          </Link>
          <Link 
            href="/leaderboard" 
            className={`px-4 py-2 rounded-md ${pathname === '/leaderboard' ? 'bg-teamOverlay text-teamPrimary' : 'text-gray-600 dark:text-gray-300'} hover:bg-teamOverlay hover:text-teamPrimary transition-colors`}
          >
            Leaderboard
          </Link>
          <Link 
            href="/theme-demo" 
            className={`px-4 py-2 rounded-md ${pathname === '/theme-demo' ? 'bg-teamOverlay text-teamPrimary' : 'text-gray-600 dark:text-gray-300'} hover:bg-teamOverlay hover:text-teamPrimary transition-colors`}
          >
            Theme Demo
          </Link>
        </nav>
      </div>
    </div>
  );
} 