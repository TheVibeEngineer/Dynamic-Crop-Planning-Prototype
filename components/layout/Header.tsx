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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🥬</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dynamic Crop Planning
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGenerateClick} className="shadow-sm">
              <Calendar size={16} />
              Generate Plantings
            </Button>
            <Button variant="secondary" onClick={onExportCSV} className="shadow-sm">
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
