// =============================================================================
// PLANNING FEATURE - Crop planning overview and analytics
// =============================================================================

import React from 'react';
import type { Planting } from '@/types';

export interface PlanningFeatureProps {
  plantings: Planting[];
}

export const PlanningFeature: React.FC<PlanningFeatureProps> = ({ plantings }) => {
  const totalPlantings = plantings.length;
  const assignedPlantings = plantings.filter(p => p.assigned);
  const unassignedPlantings = plantings.filter(p => !p.assigned);
  
  const totalAcres = assignedPlantings.reduce((sum, p) => sum + p.acres, 0);
  const utilizationRate = totalPlantings > 0 ? (assignedPlantings.length / totalPlantings) * 100 : 0;

  // Group plantings by crop
  const cropStats = assignedPlantings.reduce((acc, planting) => {
    if (!acc[planting.crop]) {
      acc[planting.crop] = { count: 0, acres: 0, customers: new Set() };
    }
    acc[planting.crop].count += 1;
    acc[planting.crop].acres += planting.acres;
    acc[planting.crop].customers.add(planting.customer);
    return acc;
  }, {} as Record<string, { count: number; acres: number; customers: Set<string> }>);

  // Group by customer
  const customerStats = assignedPlantings.reduce((acc, planting) => {
    if (!acc[planting.customer]) {
      acc[planting.customer] = { count: 0, acres: 0, crops: new Set() };
    }
    acc[planting.customer].count += 1;
    acc[planting.customer].acres += planting.acres;
    acc[planting.customer].crops.add(planting.crop);
    return acc;
  }, {} as Record<string, { count: number; acres: number; crops: Set<string> }>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">📊 Crop Planning Overview</h2>
        <p className="text-gray-600 mt-1">Analytics and insights for your crop planning operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total Plantings</div>
          <div className="text-2xl font-semibold text-gray-900">{totalPlantings}</div>
          <div className="text-xs text-gray-600 mt-1">
            {assignedPlantings.length} assigned • {unassignedPlantings.length} unassigned
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total Acres</div>
          <div className="text-2xl font-semibold text-gray-900">{totalAcres.toFixed(1)}</div>
          <div className="text-xs text-gray-600 mt-1">Assigned plantings only</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Utilization Rate</div>
          <div className="text-2xl font-semibold text-gray-900">{utilizationRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-600 mt-1">Plantings assigned to lots</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Unique Crops</div>
          <div className="text-2xl font-semibold text-gray-900">{Object.keys(cropStats).length}</div>
          <div className="text-xs text-gray-600 mt-1">Different crop types</div>
        </div>
      </div>

      {/* Crop Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Crop Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(cropStats).map(([crop, stats]) => (
                <div key={crop} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{crop}</div>
                    <div className="text-sm text-gray-600">
                      {stats.count} plantings • {stats.customers.size} customers
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{stats.acres.toFixed(1)} acres</div>
                    <div className="text-sm text-gray-600">
                      {((stats.acres / totalAcres) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(cropStats).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No assigned plantings yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Customer Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(customerStats).map(([customer, stats]) => (
                <div key={customer} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{customer}</div>
                    <div className="text-sm text-gray-600">
                      {stats.count} plantings • {stats.crops.size} crop types
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{stats.acres.toFixed(1)} acres</div>
                    <div className="text-sm text-gray-600">
                      {((stats.acres / totalAcres) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(customerStats).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No assigned plantings yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unassigned Plantings Alert */}
      {unassignedPlantings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">⚠️</div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900">Unassigned Plantings</h3>
              <div className="text-sm text-yellow-700 mt-1">
                You have {unassignedPlantings.length} plantings that haven't been assigned to lots yet. 
                Visit the Land Management section to assign them or use the auto-optimization feature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
