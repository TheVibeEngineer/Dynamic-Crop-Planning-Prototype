// =============================================================================
// GANTT FEATURE - Timeline view for plantings
// =============================================================================

import React from 'react';
import type { Planting, Region } from '@/types';
import { Calendar } from 'lucide-react';

export interface GanttFeatureProps {
  plantings: Planting[];
  landStructure: Region[];
}

export const GanttFeature: React.FC<GanttFeatureProps> = ({ plantings, landStructure }) => {
  const assignedPlantings = plantings.filter(p => p.assigned);
  const totalAcres = assignedPlantings.reduce((sum, p) => sum + p.acres, 0);
  const totalValue = assignedPlantings.reduce((sum, p) => {
    const plantingYield = p.totalYield || 0;
    // Estimate value based on market type
    const pricePerUnit = p.marketType === 'Fresh Cut' ? 12 : 0.5;
    return sum + (plantingYield * pricePerUnit);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">📅 Planting Timeline View</h2>
          <div className="text-sm text-gray-600 mt-1">
            Enhanced timeline visualization (under development)
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="text-blue-600 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Timeline View Coming Soon</h3>
            <div className="text-sm text-blue-700 mt-1 space-y-1">
              <div>The enhanced Gantt chart with timeline visualization will be available shortly.</div>
              <div>Current features include smart optimization and lot management.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Plantings</div>
              <div className="text-2xl font-semibold text-gray-900">{assignedPlantings.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">🏞️</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Acres</div>
              <div className="text-2xl font-semibold text-gray-900">{totalAcres.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Estimated Value</div>
              <div className="text-2xl font-semibold text-gray-900">${totalValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
