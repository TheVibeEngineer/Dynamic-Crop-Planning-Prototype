// =============================================================================
// GANTT FEATURE - Interactive timeline view for plantings
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import type { Planting, Region } from '@/types';
import { Calendar, ChevronLeft, ChevronRight, Filter, SlidersHorizontal, MapPin, User, Leaf } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, parseISO, differenceInDays, addDays, addMonths, subMonths } from 'date-fns';

export interface GanttFeatureProps {
  plantings: Planting[];
  landStructure: Region[];
}

interface TimelineEntry {
  id: string;
  planting: Planting;
  startDate: Date;
  endDate: Date;
  duration: number;
  crop: string;
  variety: string;
  acres: number;
  customer: string;
  location: string;
  color: string;
  groupKey: string;
  sortOrder: number;
}

interface LotGroup {
  key: string;
  displayName: string;
  entries: TimelineEntry[];
  totalAcres: number;
  isUnassigned: boolean;
}

interface FilterState {
  crop: string;
  assigned: 'all' | 'assigned' | 'unassigned';
  customer: string;
}

const CROP_COLORS: Record<string, string> = {
  Romaine: '#10b981', // green
  Iceberg: '#3b82f6', // blue
  Carrots: '#f59e0b', // amber
  Spinach: '#8b5cf6', // violet
  Lettuce: '#10b981', // green
  default: '#6b7280' // gray
};

const getCropColor = (crop: string): string => {
  return CROP_COLORS[crop] || CROP_COLORS.default;
};

export const GanttFeature: React.FC<GanttFeatureProps> = ({ plantings, landStructure }) => {
  const [viewStartDate, setViewStartDate] = useState(() => new Date());
  const [filters, setFilters] = useState<FilterState>({
    crop: 'all',
    assigned: 'all',
    customer: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Calculate timeline data grouped by lots
  const timelineData = useMemo((): TimelineEntry[] => {
    return plantings
      .filter(planting => {
        // Apply filters
        if (filters.crop !== 'all' && planting.crop !== filters.crop) return false;
        if (filters.assigned === 'assigned' && !planting.assigned) return false;
        if (filters.assigned === 'unassigned' && planting.assigned) return false;
        if (filters.customer !== 'all' && planting.customer !== filters.customer) return false;
        
        return planting.plantDate && planting.harvestDate;
      })
      .map(planting => {
        const startDate = parseISO(planting.plantDate);
        const endDate = parseISO(planting.harvestDate);
        const duration = differenceInDays(endDate, startDate);
        
        let location: string;
        let groupKey: string;
        let sortOrder: number;

        if (planting.assigned && planting.displayLotId) {
          location = planting.displayLotId;
          groupKey = planting.uniqueLotId || planting.displayLotId;
          // Sort assigned lots by region, ranch, lot
          const regionOrder = planting.region === 'Salinas' ? 1 : planting.region === 'Yuma' ? 2 : 999;
          const ranchOrder = planting.ranch ? planting.ranch.charCodeAt(0) : 999;
          const lotOrder = planting.lot ? parseInt(planting.lot) || 999 : 999;
          sortOrder = regionOrder * 1000000 + ranchOrder * 1000 + lotOrder;
        } else {
          location = 'Unassigned';
          groupKey = 'unassigned';
          sortOrder = 999999; // Put unassigned at the end
        }

        return {
          id: planting.id,
          planting,
          startDate,
          endDate,
          duration,
          crop: planting.crop,
          variety: planting.variety,
          acres: planting.acres,
          customer: planting.customer,
          location,
          color: getCropColor(planting.crop),
          groupKey,
          sortOrder
        };
      })
      .sort((a, b) => {
        // First sort by group (lot), then by start date within each group
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.startDate.getTime() - b.startDate.getTime();
      });
  }, [plantings, filters]);

  // Group timeline data by lots
  const lotGroups = useMemo((): LotGroup[] => {
    const groups = new Map<string, LotGroup>();
    
    timelineData.forEach(entry => {
      const existing = groups.get(entry.groupKey);
      if (existing) {
        existing.entries.push(entry);
        existing.totalAcres += entry.acres;
      } else {
        groups.set(entry.groupKey, {
          key: entry.groupKey,
          displayName: entry.location,
          entries: [entry],
          totalAcres: entry.acres,
          isUnassigned: entry.groupKey === 'unassigned'
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.isUnassigned && !b.isUnassigned) return 1;
      if (!a.isUnassigned && b.isUnassigned) return -1;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [timelineData]);

  // Calculate months to display
  const months = useMemo(() => {
    const start = startOfMonth(viewStartDate);
    const end = endOfMonth(addMonths(start, 11)); // Show 12 months
    return eachMonthOfInterval({ start, end });
  }, [viewStartDate]);

  // Get unique values for filters
  const uniqueCrops = useMemo(() => {
    return Array.from(new Set(plantings.map(p => p.crop))).sort();
  }, [plantings]);

  const uniqueCustomers = useMemo(() => {
    return Array.from(new Set(plantings.map(p => p.customer))).sort();
  }, [plantings]);

  // Navigation handlers
  const navigatePrevious = useCallback(() => {
    setViewStartDate(prev => subMonths(prev, 1));
  }, []);

  const navigateNext = useCallback(() => {
    setViewStartDate(prev => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setViewStartDate(new Date());
  }, []);

    // Calculate statistics
  const stats = useMemo(() => {
    const totalPlantings = timelineData.length;
    const totalAcres = timelineData.reduce((sum, entry) => sum + entry.acres, 0);
    const assignedCount = timelineData.filter(entry => entry.planting.assigned).length;
    const totalValue = timelineData.reduce((sum, entry) => {
      const pricePerUnit = entry.planting.marketType === 'Fresh Cut' ? 12 : 0.5;
      return sum + ((entry.planting.totalYield || 0) * pricePerUnit);
    }, 0);
    const totalLots = lotGroups.filter(group => !group.isUnassigned).length;

    return {
      totalPlantings,
      totalAcres,
      assignedCount,
      unassignedCount: totalPlantings - assignedCount,
      totalValue,
      totalLots
    };
  }, [timelineData, lotGroups]);

  // Calculate timeline positioning
  const getTimelinePosition = useCallback((entry: TimelineEntry) => {
    const viewStart = startOfMonth(viewStartDate);
    const viewEnd = endOfMonth(addMonths(viewStart, 11));
    const totalDays = differenceInDays(viewEnd, viewStart);
    
    const entryStart = Math.max(0, differenceInDays(entry.startDate, viewStart));
    const entryEnd = Math.min(totalDays, differenceInDays(entry.endDate, viewStart));
    
    const left = (entryStart / totalDays) * 100;
    const width = Math.max(2, ((entryEnd - entryStart) / totalDays) * 100);
    
    return { left, width };
  }, [viewStartDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">📅 Planting Timeline</h2>
          <div className="text-sm text-gray-600 mt-1">
            Interactive Gantt chart with {stats.totalPlantings} plantings
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter size={16} />
            Filters
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select
                value={filters.crop}
                onChange={(e) => setFilters(prev => ({ ...prev, crop: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Crops</option>
                {uniqueCrops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
              <select
                value={filters.assigned}
                onChange={(e) => setFilters(prev => ({ ...prev, assigned: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Plantings</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={filters.customer}
                onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Customers</option>
                {uniqueCustomers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

            {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total Plantings</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.totalPlantings}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Total Acres</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.totalAcres.toFixed(1)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Active Lots</div>
          <div className="text-2xl font-semibold text-blue-600">{stats.totalLots}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Assigned</div>
          <div className="text-2xl font-semibold text-green-600">{stats.assignedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Est. Value</div>
          <div className="text-2xl font-semibold text-gray-900">${stats.totalValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Timeline Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={navigatePrevious}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="text-lg font-semibold text-gray-900">
            {format(viewStartDate, 'yyyy')} Timeline
          </div>
          
          <button
            onClick={navigateNext}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Month Headers */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="flex border-b bg-gray-50">
              {months.map(month => (
                <div key={month.toISOString()} className="flex-1 min-w-24 p-3 text-center text-sm font-medium text-gray-700">
                  {format(month, 'MMM')}
              </div>
              ))}
            </div>

            {/* Timeline Content */}
            <div className="relative">
              {lotGroups.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium">No plantings found</div>
                  <div className="text-sm">Try adjusting your filters or add some plantings</div>
                </div>
              ) : (
                <div className="space-y-6 p-4">
                  {lotGroups.map((group) => (
                    <div key={group.key} className="space-y-2">
                      {/* Lot Group Header */}
                      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className={group.isUnassigned ? "text-orange-500" : "text-blue-500"} />
                          <span className="font-medium text-gray-900">{group.displayName}</span>
                          <span className="text-sm text-gray-500">
                            ({group.entries.length} plantings, {group.totalAcres.toFixed(1)} acres)
                          </span>
                        </div>
                        {group.isUnassigned && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Needs Assignment
                          </span>
                        )}
                      </div>

                      {/* Plantings in this lot */}
                      <div className="space-y-1 ml-4">
                        {group.entries.map((entry, index) => {
                          const { left, width } = getTimelinePosition(entry);
                          
                          return (
                            <div key={entry.id} className="relative h-10">
                              {/* Timeline Row Background */}
                              <div className="absolute inset-x-0 top-0 h-10 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors" />
                              
                              {/* Planting Bar */}
                              <div
                                className="absolute top-1 h-8 rounded-md shadow-sm border cursor-pointer transition-all hover:shadow-md z-20"
                                style={{
                                  left: `${left}%`,
                                  width: `${width}%`,
                                  backgroundColor: entry.color,
                                  minWidth: '60px'
                                }}
                                title={`${entry.crop} ${entry.variety} - ${entry.customer} (${entry.acres} acres)\nPlant: ${format(entry.startDate, 'MMM dd, yyyy')}\nHarvest: ${format(entry.endDate, 'MMM dd, yyyy')}`}
                              >
                                <div className="flex items-center h-full px-2 text-white text-xs font-medium truncate">
                                  <div className="flex-1 truncate">
                                    {entry.crop} - {entry.variety}
                                  </div>
                                  <div className="text-white/90 text-xs">
                                    {entry.acres}a
                                  </div>
                                </div>
                              </div>

                              {/* Customer Info */}
                              <div className="absolute left-2 top-0 h-10 flex items-center pointer-events-none z-10">
                                <div className="bg-white px-2 py-1 rounded shadow-sm border text-xs max-w-32">
                                  <div className="flex items-center gap-1 font-medium text-gray-900 truncate">
                                    <User size={10} />
                                    {entry.customer}
            </div>
          </div>
        </div>

                              {/* Date Labels */}
                              <div className="absolute right-2 top-0 h-10 flex items-center pointer-events-none z-10">
                                <div className="bg-gray-50 px-2 py-1 rounded shadow-sm border text-xs">
                                  <div className="text-gray-600">
                                    {format(entry.startDate, 'MMM dd')} → {format(entry.endDate, 'MMM dd')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
              </div>
            </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Crop Legend</h3>
        <div className="flex flex-wrap gap-3">
          {uniqueCrops.map(crop => (
            <div key={crop} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getCropColor(crop) }}
              />
              <span className="text-sm text-gray-700">{crop}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};