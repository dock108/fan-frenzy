'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamTransitionProps {
  children: React.ReactNode;
  teamCode?: string;
  isActive?: boolean;
  teamColor?: string;
}

/**
 * TeamTransition component - creates immersive team-based entry animations
 * This is a placeholder for future implementation that will show full-screen
 * color fades when a user selects a team
 */
const TeamTransition = ({ 
  children, 
  teamCode = '',
  isActive = false,
  teamColor = ''
}: TeamTransitionProps) => {
  const [showTransition, setShowTransition] = useState(isActive);
  const [color] = useState(teamColor || '#000000');
  
  // Effect to handle color changes when team changes
  useEffect(() => {
    if (teamCode && isActive) {
      // This would be expanded in future to lookup real team colors
      // For now it's just a placeholder
      setShowTransition(true);
      
      // Simulate transition end
      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [teamCode, isActive]);

  return (
    <>
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: color,
              zIndex: 100
            }}
          />
        )}
      </AnimatePresence>
      
      {children}
    </>
  );
};

export default TeamTransition; 