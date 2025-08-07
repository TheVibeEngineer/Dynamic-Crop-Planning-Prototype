// =============================================================================
// CAPACITY SERVICE - Land Capacity Management
// =============================================================================

import type { Region, Planting, CapacityInfo } from '@/types';

export const capacityService = {
  calculateLotCapacity: (
    regionId: number, 
    ranchId: number, 
    lotId: number, 
    landStructure: Region[], 
    plantings: Planting[]
  ): CapacityInfo => {
    const region = landStructure.find(r => r.id === regionId);
    const ranch = region?.ranches.find(r => r.id === ranchId);
    const lot = ranch?.lots.find(l => l.id === lotId);
    
    if (!lot) {
      return { totalAcres: 0, usedAcres: 0, availableAcres: 0, plantingCount: 0, plantings: [] };
    }
    
    const lotPlantings = plantings.filter(p => 
      p.assigned && p.uniqueLotId === `${regionId}-${ranchId}-${lotId}`
    );
    
    const usedAcres = lotPlantings.reduce((total, p) => total + p.acres, 0);
    const availableAcres = Math.max(0, lot.acres - usedAcres);
    
    return {
      totalAcres: lot.acres,
      usedAcres: Math.round(usedAcres * 100) / 100,
      availableAcres: Math.round(availableAcres * 100) / 100,
      plantingCount: lotPlantings.length,
      plantings: lotPlantings
    };
  },
  
  getNextSublotDesignation: (
    regionId: number, 
    ranchId: number, 
    lotId: number, 
    plantings: Planting[]
  ): string => {
    const lotPlantings = plantings.filter(p => 
      p.assigned && p.uniqueLotId === `${regionId}-${ranchId}-${lotId}`
    );
    
    const usedSublots = lotPlantings.map(p => p.sublot).filter(Boolean);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < alphabet.length; i++) {
      if (!usedSublots.includes(alphabet[i])) {
        return alphabet[i];
      }
    }
    
    return 'A';
  },
  
  canFitInLot: (
    plantingAcres: number, 
    regionId: number, 
    ranchId: number, 
    lotId: number, 
    landStructure: Region[], 
    plantings: Planting[]
  ): boolean => {
    const capacity = capacityService.calculateLotCapacity(regionId, ranchId, lotId, landStructure, plantings);
    return plantingAcres <= capacity.availableAcres;
  }
};
