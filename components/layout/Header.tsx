// =============================================================================
// HEADER COMPONENT - Main app header
// =============================================================================

import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { Button } from '../common';

export interface HeaderProps {
  onGeneratePlantings: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGeneratePlantings, onExportCSV }) => {
  const handleGenerateClick = () => {
    if (onGeneratePlantings) {
      onGeneratePlantings();
    } else {
      console.error('❌ onGeneratePlantings function is undefined!');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Dynamic Crop Planning System
          </h1>
          <div className="flex gap-2">
            <Button onClick={handleGenerateClick}>
              <Calendar size={16} />
              Generate Plantings
            </Button>
            <Button variant="secondary" onClick={onExportCSV}>
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
