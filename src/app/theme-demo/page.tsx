'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { setTeamColors, teamColors } from '@/utils/themeUtils';
import Link from 'next/link';
import DefaultLayout from '@/components/layout/DefaultLayout';

export default function ThemeDemo() {
  const { theme, setTheme } = useTheme();
  const [selectedTeam, setSelectedTeam] = useState('default');

  const handleTeamChange = (teamCode: string) => {
    setSelectedTeam(teamCode);
    setTeamColors(teamCode);
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-teamPrimary">Theme System Demo</h1>
        
        <div className="mb-6 flex items-center">
          <Link 
            href="/team-theme-demo" 
            className="text-accent hover:underline"
          >
            View New Enhanced Team Theming →
          </Link>
        </div>
        
        <div className="mb-8 p-6 bg-background rounded-lg shadow-medium border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Light/Dark Mode</h2>
          <p className="mb-4 text-foreground">
            Current theme: <span className="font-medium">{theme}</span>
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-md ${
                theme === 'light' 
                  ? 'bg-teamPrimary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-md ${
                theme === 'dark' 
                  ? 'bg-teamPrimary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`px-4 py-2 rounded-md ${
                theme === 'system' 
                  ? 'bg-teamPrimary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              System
            </button>
          </div>
        </div>
        
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Team Colors</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Select a team to see its colors applied:
          </p>
          <div className="flex space-x-4 mb-6">
            {Object.keys(teamColors).map((teamCode) => (
              <button
                key={teamCode}
                onClick={() => handleTeamChange(teamCode)}
                className={`px-4 py-2 rounded-md ${
                  selectedTeam === teamCode 
                    ? 'bg-teamPrimary text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {teamCode}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-teamPrimary text-white rounded-md">
              Primary Color
            </div>
            <div className="p-4 bg-teamAccent text-white rounded-md">
              Accent Color
            </div>
            <div className="p-4 bg-teamOverlay text-gray-800 dark:text-white rounded-md">
              Overlay Color
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Component Examples</h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-lg font-medium mb-2 text-teamPrimary">Button Examples</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-teamPrimary hover:bg-teamAccent text-white rounded-md transition-colors">
                  Primary Button
                </button>
                <button className="px-4 py-2 border border-teamPrimary text-teamPrimary hover:bg-teamOverlay rounded-md transition-colors">
                  Outlined Button
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Neutral Button
                </button>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-lg font-medium mb-2 text-teamPrimary">Card Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 border border-teamPrimary rounded-md shadow-sm">
                  <h4 className="font-medium text-teamPrimary">Bordered Card</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Card with team color border</p>
                </div>
                <div className="p-4 bg-teamOverlay border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                  <h4 className="font-medium text-teamPrimary">Background Card</h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm mt-2">Card with team overlay background</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-teamPrimary hover:text-teamAccent underline">
            Back to Homepage
          </Link>
        </div>
      </div>
    </DefaultLayout>
  );
} 