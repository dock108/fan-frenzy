'use client';

import { useState } from 'react';
import useTeamTheme, { TEAM_THEMES } from '@/hooks/useTeamTheme';

export default function TeamThemeDemo() {
  const { currentTeam, setTeamTheme, resetTeamTheme, availableTeams } = useTeamTheme();
  const [showAllTeams, setShowAllTeams] = useState(false);
  
  const displayedTeams = showAllTeams 
    ? availableTeams 
    : availableTeams.slice(0, 5); // Only show first few by default
  
  return (
    <div className="p-6 bg-background rounded-lg shadow-medium border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Team Theme Demo</h2>
      
      <div className="mb-6">
        <p className="text-foreground mb-2">
          Current team: <span className="font-medium text-teamPrimary">{currentTeam}</span>
        </p>
        
        <button 
          onClick={resetTeamTheme}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Reset to Default
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-foreground">Select a Team</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {displayedTeams.map(team => (
            <button
              key={team}
              onClick={() => setTeamTheme(team)}
              className={`px-3 py-2 rounded-md border transition-colors ${
                currentTeam === team 
                  ? 'bg-teamPrimary text-white border-teamPrimary' 
                  : 'bg-background text-foreground border-gray-200 dark:border-gray-700 hover:border-teamPrimary'
              }`}
            >
              {team.charAt(0).toUpperCase() + team.slice(1)}
            </button>
          ))}
          
          {!showAllTeams && availableTeams.length > 5 && (
            <button
              onClick={() => setShowAllTeams(true)}
              className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-foreground hover:border-accent"
            >
              + {availableTeams.length - 5} more
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-2 text-foreground">Preview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-teamPrimary text-white rounded-md">
            Primary Color
          </div>
          <div className="p-4 bg-teamSecondary text-white rounded-md">
            Secondary Color
          </div>
          <div className="p-4 bg-teamAccent text-white rounded-md">
            Accent Color
          </div>
        </div>
        
        <div className="p-4 border border-teamPrimary rounded-md bg-teamOverlay text-foreground">
          Overlay Background with Primary Border
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-teamPrimary text-white rounded-md hover:bg-opacity-90 transition-colors">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-teamSecondary text-white rounded-md hover:bg-opacity-90 transition-colors">
            Secondary Button
          </button>
          <button className="px-4 py-2 border border-teamPrimary text-teamPrimary rounded-md hover:bg-teamOverlay transition-colors">
            Outlined Button
          </button>
        </div>
      </div>
    </div>
  );
} 