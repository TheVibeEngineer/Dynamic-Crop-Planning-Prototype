// =============================================================================
// APP LAYOUT - Main application layout with navigation and state
// =============================================================================

'use client';

import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { AppProvider, useAppContext } from './AppContext';

export interface AppLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the context
const AppLayoutInner: React.FC<AppLayoutProps> = ({ children }) => {
  const { generatePlantings, handleExportCSV } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onGeneratePlantings={generatePlantings}
        onExportCSV={handleExportCSV}
      />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// Main layout component with context provider
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <AppProvider>
      <AppLayoutInner>
        {children}
      </AppLayoutInner>
    </AppProvider>
  );
};
