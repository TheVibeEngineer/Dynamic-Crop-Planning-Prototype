// =============================================================================
// USE PLANTINGS HOOK - Plantings state management with optimization
// =============================================================================

import { useState, useEffect, useRef } from 'react';
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
import { plantingService } from '@/lib/services/planting';

export const usePlantings = (
  orders: Order[], 
  commodities: Commodity[], 
  landStructure?: Region[]
): PlantingsActions & { 
  plantings: Planting[];
  setLandStructure: (landStructure: Region[]) => void;
} => {
  // Store landStructure in a ref so it can be updated externally
  const landStructureRef = useRef<Region[]>(landStructure || []);
  // Initialize with saved data or empty array
  const [plantings, setPlantings] = useState<Planting[]>(() => {
    return persistenceService.load(STORAGE_KEYS.PLANTINGS, []);
  });

  // Auto-save plantings when they change
  useEffect(() => {
    persistenceService.save(STORAGE_KEYS.PLANTINGS, plantings);
  }, [plantings]);

  // Function to update land structure reference
  const setLandStructure = (newLandStructure: Region[]) => {
    landStructureRef.current = newLandStructure;
  };

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
    lotId: number,
    onSplitNotification?: (notification: SplitNotification) => void
  ) => {
    const planting = plantings.find(p => p.id === plantingId);
    if (!planting) {
      return { success: false, type: 'not_found' };
    }
    
    const currentLandStructure = landStructureRef.current;
    if (!currentLandStructure || currentLandStructure.length === 0) {
      return { success: false, type: 'no_land_structure' };
    }
    
    const region = currentLandStructure.find(r => r.id === regionId);
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
      currentLandStructure, 
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
      const capacity = capacityService.calculateLotCapacity(regionId, ranchId, lotId, currentLandStructure, plantings);
      
      if (capacity.availableAcres > 0) {
        // Split the planting - assign what fits, keep remainder unassigned
        const { assignedPortion, unassignedRemainder } = plantingService.splitPlanting(
          planting, 
          capacity.availableAcres
        );
        
        const sublot = capacityService.getNextSublotDesignation(regionId, ranchId, lotId, plantings);
        const assignedWithLocation: Planting = {
          ...assignedPortion,
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
        
        // Update plantings: remove original, add assigned portion and unassigned remainder
        setPlantings(prev => [
          ...prev.filter(p => p.id !== plantingId),
          assignedWithLocation,
          unassignedRemainder
        ]);
        
        // Notify about the split
        if (onSplitNotification) {
          onSplitNotification({
            plantingId: planting.id,
            crop: planting.crop,
            variety: planting.variety,
            originalAcres: planting.acres,
            assignedAcres: assignedWithLocation.acres,
            remainingAcres: unassignedRemainder.acres,
            lotLocation: `${region.region} > ${ranch.name} > Lot ${lot.number}`
          });
        }
        
        return { 
          success: true, 
          type: 'split',
          assignedAcres: assignedWithLocation.acres,
          remainingAcres: unassignedRemainder.acres
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

  const unassignPlanting = (plantingId: string, onRecombineNotification?: (notification: any) => void) => {
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
    
    // Update plantings with the unassigned planting
    setPlantings(prev => {
      const updatedPlantings = prev.map(p => 
        p.id === plantingId ? unassignedPlanting : p
      );
      
      // Check if this creates an opportunity to recombine split plantings
      const { recombined, recombinations } = plantingService.recombineSplitPlantings(updatedPlantings);
      
      // If any recombinations occurred, notify and return the recombined plantings
      if (recombinations.length > 0) {
        recombinations.forEach(recombination => {
          if (onRecombineNotification) {
            onRecombineNotification({
              type: 'recombined',
              parentId: recombination.parentId,
              combinedAcres: recombination.combinedAcres,
              splitCount: recombination.splitCount,
              crop: unassignedPlanting.crop,
              variety: unassignedPlanting.variety
            });
          }
        });
        
        console.log(`🔄 Recombined ${recombinations.length} split plantings`);
        return recombined;
      }
      
      return updatedPlantings;
    });
    
    return { success: true, type: 'unassigned' };
  };

  // Bulk optimization function
  const optimizeAllPlantings = (
    onSplitNotification?: (notification: SplitNotification) => void, 
    onOptimizationComplete?: (results: OptimizationResults) => void
  ) => {
    const currentLandStructure = landStructureRef.current;
    if (!currentLandStructure || currentLandStructure.length === 0) {
      console.warn('Cannot optimize: no land structure available');
      return [];
    }
    
    const assignments = optimizationEngine.optimizeAllPlantings(
      plantings, 
      currentLandStructure, 
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

  return { plantings, generatePlantings, assignPlantingToLot, unassignPlanting, optimizeAllPlantings, setLandStructure };
};
