'use client';

import { useState } from 'react';
import Link from 'next/link';
import TransitionLayout from '@/components/layout/TransitionLayout';
import PageTransition from '@/components/layout/PageTransition';
import TeamTransition from '@/components/layout/TeamTransition';

export default function TransitionDemoPage() {
  const [transitionMode, setTransitionMode] = useState<'default' | 'slide-up' | 'slide-left' | 'fade' | 'none'>('default');
  const [content, setContent] = useState(1);
  const [showTeamTransition, setShowTeamTransition] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  
  const teams = [
    { code: 'bills', name: 'Buffalo Bills', color: '#00338d' },
    { code: 'patriots', name: 'New England Patriots', color: '#002244' },
    { code: 'jets', name: 'New York Jets', color: '#125740' },
    { code: 'dolphins', name: 'Miami Dolphins', color: '#008e97' },
  ];
  
  const triggerTeamTransition = (team: { code: string, color: string }) => {
    setTeamCode(team.code);
    setShowTeamTransition(true);
    
    // Reset after animation completes
    setTimeout(() => setShowTeamTransition(false), 1000);
  };
  
  const changeContent = () => {
    setContent(prev => (prev % 3) + 1);
  };
  
  return (
    <TransitionLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Transition System Demo</h1>
          <Link
            href="/team-theme-demo"
            className="text-sm text-accent hover:underline"
          >
            ← Back to Team Theme Demo
          </Link>
        </div>
        
        <p className="mb-8 text-foreground text-lg">
          This demo shows how the application uses smooth transitions between pages and states.
          Select different transition types below and see them in action.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Page Transition Demo */}
          <div className="bg-background rounded-lg shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-foreground">Page Transitions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select a transition type and click 'Change Content' to see it in action
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setTransitionMode('default')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    transitionMode === 'default' 
                      ? 'bg-teamPrimary text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Default
                </button>
                <button 
                  onClick={() => setTransitionMode('slide-up')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    transitionMode === 'slide-up' 
                      ? 'bg-teamPrimary text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Slide Up
                </button>
                <button 
                  onClick={() => setTransitionMode('slide-left')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    transitionMode === 'slide-left' 
                      ? 'bg-teamPrimary text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Slide Left
                </button>
                <button 
                  onClick={() => setTransitionMode('fade')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    transitionMode === 'fade' 
                      ? 'bg-teamPrimary text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Fade
                </button>
              </div>
              
              <button
                onClick={changeContent}
                className="w-full py-2 bg-accent hover:bg-opacity-90 text-white rounded-md transition-colors"
              >
                Change Content
              </button>
              
              <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                <PageTransition key={content} mode={transitionMode}>
                  {content === 1 && (
                    <div className="text-center p-4">
                      <h3 className="text-xl text-teamPrimary font-bold">Content One</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        This content animates with the <span className="font-medium">{transitionMode}</span> transition
                      </p>
                    </div>
                  )}
                  {content === 2 && (
                    <div className="text-center p-4">
                      <h3 className="text-xl text-teamSecondary font-bold">Content Two</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        See how smooth the transitions are between states
                      </p>
                    </div>
                  )}
                  {content === 3 && (
                    <div className="text-center p-4">
                      <h3 className="text-xl text-accent font-bold">Content Three</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Try different transition types using the buttons above
                      </p>
                    </div>
                  )}
                </PageTransition>
              </div>
            </div>
          </div>
          
          {/* Team Transition Demo */}
          <div className="bg-background rounded-lg shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-foreground">Team Entry Transitions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Click a team to see a full-screen color transition (placeholder)
              </p>
            </div>
            
            <div className="p-4">
              <TeamTransition teamCode={teamCode} isActive={showTeamTransition}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {teams.map(team => (
                      <button
                        key={team.code}
                        onClick={() => triggerTeamTransition(team)}
                        className="py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-md hover:border-teamPrimary transition-colors text-left"
                        style={{ borderLeftColor: team.color, borderLeftWidth: '4px' }}
                      >
                        <span className="font-medium block">{team.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Click to preview transition
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                    <p>
                      In a real application, these transitions would occur when navigating 
                      from team selection to game pages, creating an immersive "entering 
                      team territory" feeling.
                    </p>
                  </div>
                </div>
              </TeamTransition>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-background rounded-lg shadow-medium border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Usage in Code</h2>
          
          <div className="prose prose-sm dark:prose-invert">
            <p>
              Use the TransitionLayout component to add transitions to your pages:
            </p>
            
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
              <code>
                {`import TransitionLayout from '@/components/layout/TransitionLayout';

export default function MyPage() {
  return (
    <TransitionLayout transitionMode="slide-up">
      <div>
        <h1>My Page Content</h1>
        {/* Page content here */}
      </div>
    </TransitionLayout>
  );
}`}
              </code>
            </pre>
            
            <p className="mt-4">
              For component-level transitions:
            </p>
            
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
              <code>
                {`import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';

export default function MyComponent() {
  const [step, setStep] = useState(1);
  
  return (
    <div>
      <PageTransition key={step} mode="fade">
        {step === 1 && <StepOne />}
        {step === 2 && <StepTwo />}
        {step === 3 && <StepThree />}
      </PageTransition>
      
      <button onClick={() => setStep(prev => Math.min(prev + 1, 3))}>
        Next Step
      </button>
    </div>
  );
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </TransitionLayout>
  );
} 