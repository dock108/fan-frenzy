'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import DefaultLayout from '@/components/layout/DefaultLayout';
import PageTransition from '@/components/layout/PageTransition';

interface TransitionLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  transitionMode?: 'default' | 'slide-up' | 'slide-left' | 'fade' | 'none';
}

/**
 * Layout component that wraps content with page transitions
 */
const TransitionLayout = ({
  children,
  showHeader = true,
  showFooter = true,
  transitionMode = 'default'
}: TransitionLayoutProps) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  // Prevent hydration issues by only showing animations on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <DefaultLayout showHeader={showHeader} showFooter={showFooter}>
      {isClient ? (
        <AnimatePresence mode="wait">
          <PageTransition key={pathname} mode={transitionMode}>
            {children}
          </PageTransition>
        </AnimatePresence>
      ) : (
        // During SSR or hydration, render without animations
        children
      )}
    </DefaultLayout>
  );
};

export default TransitionLayout; 