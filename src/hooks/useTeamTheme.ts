'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// Define interface for team theme colors
export interface TeamTheme {
  primary: string;
  secondary: string;
  accent?: string;
  overlay?: string;
}

// Team theme map with NFL team colors
export const TEAM_THEMES: Record<string, TeamTheme> = {
  // Default theme will fallback to the CSS variables already set
  default: {
    primary: '',
    secondary: '',
    accent: '',
    overlay: '',
  },
  
  // AFC East
  bills: { 
    primary: '#00338d', 
    secondary: '#c60c30', 
    accent: '#ffffff', 
    overlay: 'rgba(0, 51, 141, 0.1)' 
  },
  dolphins: { 
    primary: '#008e97', 
    secondary: '#fc4c02', 
    accent: '#005778', 
    overlay: 'rgba(0, 142, 151, 0.1)' 
  },
  patriots: { 
    primary: '#002244', 
    secondary: '#c60c30', 
    accent: '#b0b7bc', 
    overlay: 'rgba(0, 34, 68, 0.1)' 
  },
  jets: { 
    primary: '#125740', 
    secondary: '#000000', 
    accent: '#ffffff', 
    overlay: 'rgba(18, 87, 64, 0.1)' 
  },
  
  // AFC North
  ravens: { 
    primary: '#241773', 
    secondary: '#000000', 
    accent: '#9e7c0c', 
    overlay: 'rgba(36, 23, 115, 0.1)' 
  },
  bengals: { 
    primary: '#fb4f14', 
    secondary: '#000000', 
    accent: '#ffffff', 
    overlay: 'rgba(251, 79, 20, 0.1)' 
  },
  browns: { 
    primary: '#311d00', 
    secondary: '#ff3c00', 
    accent: '#ffffff', 
    overlay: 'rgba(49, 29, 0, 0.1)' 
  },
  steelers: { 
    primary: '#000000', 
    secondary: '#ffb612', 
    accent: '#c60c30', 
    overlay: 'rgba(0, 0, 0, 0.1)' 
  },
  
  // Add more teams as needed...
};

/**
 * Hook to manage team theming by setting CSS variables
 */
export default function useTeamTheme() {
  const { theme } = useTheme();
  const [currentTeam, setCurrentTeam] = useState<string>('default');
  
  // Apply team colors when team or theme changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Get the team colors (or default if not found)
    const teamColors = TEAM_THEMES[currentTeam] || TEAM_THEMES.default;
    const isDark = theme === 'dark';
    
    // Set CSS variables
    const root = document.documentElement;
    
    // Only set if the value exists (to avoid overriding defaults)
    if (teamColors.primary) {
      root.style.setProperty('--team-primary', teamColors.primary);
    }
    
    if (teamColors.secondary) {
      root.style.setProperty('--team-secondary', teamColors.secondary);
    }
    
    if (teamColors.accent) {
      root.style.setProperty('--team-accent', teamColors.accent);
    }
    
    if (teamColors.overlay) {
      root.style.setProperty('--team-overlay', teamColors.overlay);
    }
    
    // Apply team class for more specific styling
    root.classList.forEach(className => {
      if (className.startsWith('team-')) {
        root.classList.remove(className);
      }
    });
    
    if (currentTeam !== 'default') {
      root.classList.add(`team-${currentTeam}`);
    }
    
  }, [currentTeam, theme]);
  
  // Set the team theme
  const setTeamTheme = (teamCode: string) => {
    const normalized = teamCode.toLowerCase();
    setCurrentTeam(TEAM_THEMES[normalized] ? normalized : 'default');
  };
  
  // Reset to default
  const resetTeamTheme = () => {
    setCurrentTeam('default');
    
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.forEach(className => {
        if (className.startsWith('team-')) {
          root.classList.remove(className);
        }
      });
      
      // Clear the custom properties
      root.style.removeProperty('--team-primary');
      root.style.removeProperty('--team-secondary');
      root.style.removeProperty('--team-accent');
      root.style.removeProperty('--team-overlay');
    }
  };
  
  return {
    currentTeam,
    setTeamTheme,
    resetTeamTheme,
    availableTeams: Object.keys(TEAM_THEMES),
  };
} 