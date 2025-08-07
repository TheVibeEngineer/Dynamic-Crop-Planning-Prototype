// =============================================================================
// USE PLANTINGS HOOK - Plantings state management with optimization
// =============================================================================

import { useState, useEffect } from 'react';
import type { Planting } from '@/types/planning';
import type { Order } from '@/types/orders';
import type { Commodity } from '@/types/commodities';
import type { Region, Ranch, Lot } from '@/types/land';
import type { SplitNotification, OptimizationResults, PlantingsActions } from '@/types/planning';
import { persistenceService } from '@/lib/services/persistence';
import { STORAGE_KEYS } from '@/lib/constants';
import { plantingGenerationService } from '@/lib/services/plantingGeneration';
import { optimizationEngine } from '@/lib/services/optimization';
import { capacityService } from '@/lib/services/capacity';

export const usePlantings = (
  orders: Order[], 
  commodities: Commodity[], 
  landStructure: Region[]
): PlantingsActions & { plantings: Planting[] } => {
  // Initialize with saved data or empty array
  const [plantings, setPlantings] = useState<Planting[]>(() => {
    return persistenceService.load(STORAGE_KEYS.PLANTINGS, []);
  });

  // Auto-save plantings when they change
  useEffect(() => {
    persistenceService.save(STORAGE_KEYS.PLANTINGS, plantings);
  }, [plantings]);

  const generatePlantings = () => {
    console.log('🌱 Generating plantings from', orders.length, 'orders and', commodities.length, 'commodities');
    
    const newPlantings = plantingGenerationService.generateFromOrders(orders, commodities);
    console.log('✅ Generated', newPlantings.length, 'plantings');
    
    setPlantings(newPlantings);
  };

  const assignPlantingToLot = (
    plantingId: string, 
    regionId: number, 
    ranchId: number, 
    lotId: number
  ) => {
    const planting = plantings.find(p => p.id === plantingId);
    if (!planting) {
      return { success: false, type: 'not_found' };
    }
    
    const region = landStructure.find(r => r.id === regionId);
    const ranch = region?.ranches.find(r => r.id === ranchId);
    const lot = ranch?.lots.find(l => l.id === lotId);
    
    if (!region || !ranch || !lot) {
      return { success: false, type: 'location_not_found' };
    }
    
    const canFit = capacityService.canFitInLot(
      planting.acres, 
      regionId, 
      ranchId, 
      lotId, 
      landStructure, 
      plantings
    );
    
    if (canFit) {
      const sublot = capacityService.getNextSublotDesignation(regionId, ranchId, lotId, plantings);
      const assignedPlanting: Planting = {
        ...planting,
        assigned: true,
        region: region.region,
        ranch: ranch.name,
        lot: lot.number,
        sublot,
        uniqueLotId: `${regionId}-${ranchId}-${lotId}`,
        displayLotId: `${region.region} > ${ranch.name} > Lot ${lot.number}${sublot ? `-${sublot}` : ''}`,
        assignedLot: {
          regionId,
          ranchId,
          lotId,
          sublot
        }
      };
      
      setPlantings(prev => prev.map(p => 
        p.id === plantingId ? assignedPlanting : p
      ));
      
      return { success: true, type: 'assigned' };
    } else {
      // Check if partial assignment is possible
      const capacity = capacityService.calculateLotCapacity(regionId, ranchId, lotId, landStructure, plantings);
      
      if (capacity.availableAcres > 0) {
        return { 
          success: false, 
          type: 'partial_fit',
          availableAcres: capacity.availableAcres,
          message: `Only ${capacity.availableAcres} acres available (${capacity.usedAcres}/${capacity.totalAcres} acres used)`
        };
      } else {
        return { 
          success: false, 
          type: 'no_capacity',
          message: `No available capacity (${capacity.usedAcres}/${capacity.totalAcres} acres used)`
        };
      }
    }
  };

  const unassignPlanting = (plantingId: string) => {
    const planting = plantings.find(p => p.id === plantingId);
    if (!planting || !planting.assigned) {
      return { success: false, type: 'not_found_or_unassigned' };
    }
    
    const unassignedPlanting: Planting = {
      ...planting,
      assigned: false,
      region: undefined,
      ranch: undefined,
      lot: undefined,
      sublot: undefined,
      uniqueLotId: undefined,
      displayLotId: undefined,
      assignedLot: undefined
    };
    
    setPlantings(prev => prev.map(p => 
      p.id === plantingId ? unassignedPlanting : p
    ));
    
    return { success: true, type: 'unassigned' };
  };

  // Bulk optimization function
  const optimizeAllPlantings = (
    onSplitNotification?: (notification: SplitNotification) => void, 
    onOptimizationComplete?: (results: OptimizationResults) => void
  ) => {
    const assignments = optimizationEngine.optimizeAllPlantings(
      plantings, 
      landStructure, 
      onSplitNotification || (() => {})
    );
    
    // Apply all assignments
    let updatedPlantings = [...plantings];
    
    assignments.forEach(assignment => {
      if (assignment.type === 'assign') {
        updatedPlantings = updatedPlantings.map(p => 
          p.id === assignment.original.id ? assignment.assigned : p
        );
      } else if (assignment.type === 'split') {
        updatedPlantings = [
          ...updatedPlantings.filter(p => p.id !== assignment.original.id),
          assignment.assigned,
          assignment.remainder!
        ];
        
        // Show split notification for each split
        if (onSplitNotification) {
          setTimeout(() => {
            onSplitNotification({
              plantingId: assignment.original.id,
              crop: assignment.original.crop,
              variety: assignment.original.variety,
              originalAcres: assignment.original.acres,
              assignedAcres: assignment.assigned.acres,
              remainingAcres: assignment.remainder!.acres,
              lotLocation: assignment.lot.number
            });
          }, 100);
        }
      }
    });
    
    setPlantings(updatedPlantings);
    
    // Report optimization results
    if (onOptimizationComplete) {
      const totalPlantings = assignments.length;
      const assignedCount = assignments.filter(a => a.type === 'assign').length;
      const splitCount = assignments.filter(a => a.type === 'split').length;
      const avgScore = totalPlantings > 0 
        ? assignments.reduce((sum, a) => sum + a.score, 0) / totalPlantings 
        : 0;
      
      onOptimizationComplete({ 
        assignments: assignments.map(a => ({
          plantingId: a.original.id,
          crop: a.original.crop,
          variety: a.original.variety,
          acres: a.assigned.acres,
          recommendedLot: {
            regionId: a.assigned.assignedLot?.regionId || 0,
            ranchId: a.assigned.assignedLot?.ranchId || 0,
            lotId: a.assigned.assignedLot?.lotId || 0,
            sublot: a.assigned.sublot || '',
            location: a.assigned.displayLotId || ''
          },
          score: a.score,
          reasons: [`Score: ${a.score}`, a.type === 'split' ? 'Split required' : 'Perfect fit']
        })),
        summary: { 
          totalPlantings,
          successfulAssignments: assignedCount + splitCount,
          totalAcresOptimized: assignments.reduce((sum, a) => sum + a.assigned.acres, 0),
          averageScore: Math.round(avgScore * 100) / 100
        } 
      });
    }
    
    return assignments;
  };

  return { plantings, generatePlantings, assignPlantingToLot, unassignPlanting, optimizeAllPlantings };
};
