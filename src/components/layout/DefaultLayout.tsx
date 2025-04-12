'use client';

import React from 'react';
import AppShell from './AppShell';

interface DefaultLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * Default layout with AppShell for consistent page structure
 */
export default function DefaultLayout({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: DefaultLayoutProps) {
  return (
    <AppShell showHeader={showHeader} showFooter={showFooter}>
      {children}
    </AppShell>
  );
} 