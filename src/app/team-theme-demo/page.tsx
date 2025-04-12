'use client';

import Link from 'next/link';
import DefaultLayout from '@/components/layout/DefaultLayout';
import TeamThemeDemo from '@/components/TeamThemeDemo';

export default function TeamThemeDemoPage() {
  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Team Theme System</h1>
          <div className="flex space-x-4">
            <Link
              href="/transition-demo"
              className="text-sm text-accent hover:underline"
            >
              View Transition Demo →
            </Link>
            <Link
              href="/theme-demo"
              className="text-sm text-accent hover:underline"
            >
              ← Back to Theme Demo
            </Link>
          </div>
        </div>
        
        <p className="mb-8 text-foreground text-lg">
          This demo shows how the application can adapt its colors based on team selection.
          Choose a team below to see the theme colors change throughout the interface.
        </p>
        
        <TeamThemeDemo />
        
        <div className="mt-8 p-6 bg-background rounded-lg shadow-medium border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Usage in Components</h2>
          
          <div className="prose prose-sm dark:prose-invert">
            <p>
              Team colors are available as Tailwind classes using:
            </p>
            
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
              <code>
                {`bg-teamPrimary
text-teamSecondary
border-teamAccent
bg-teamOverlay`}
              </code>
            </pre>
            
            <p className="mt-4">
              To apply team theme in your components:
            </p>
            
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
              <code>
                {`import useTeamTheme from '@/hooks/useTeamTheme';

export default function MyComponent() {
  const { setTeamTheme } = useTeamTheme();
  
  return (
    <div>
      <button onClick={() => setTeamTheme('bills')}>
        Buffalo Bills Theme
      </button>
      <div className="bg-teamPrimary text-white">
        This will change color based on team
      </div>
    </div>
  );
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 