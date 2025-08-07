// =============================================================================
// OPTIMIZATION ENGINE - Smart crop placement and optimization logic
// =============================================================================

import type { Planting, Lot, Region, Ranch, SplitNotification, SmartSuggestion } from '@/types';
import { capacityService, plantingService } from './';
import { CROP_ROTATION_RULES } from '../constants';

export interface OptimizationAssignment {
  type: 'assign' | 'split';
  original: Planting;
  assigned: Planting;
  remainder?: Planting;
  lot: Lot;
  score: number;
}

export const optimizationEngine = {
  // Score a lot for a specific planting (higher = better)
  scoreLotForPlanting: (
    planting: Planting, 
    lot: Lot, 
    region: Region, 
    ranch: Ranch, 
    landStructure: Region[], 
    plantings: Planting[]
  ): number => {
    let score = 0;
    const capacity = capacityService.calculateLotCapacity(region.id, ranch.id, lot.id, landStructure, plantings);
    
    // Base capacity score (0-100)
    if (capacity.availableAcres >= planting.acres) {
      // Perfect fit gets highest score
      const utilizationAfter = (capacity.usedAcres + planting.acres) / capacity.totalAcres;
      if (utilizationAfter >= 0.85 && utilizationAfter <= 1.0) {
        score += 100; // Near-perfect utilization
      } else if (utilizationAfter >= 0.7) {
        score += 80; // Good utilization
      } else if (utilizationAfter >= 0.5) {
        score += 60; // Decent utilization
      } else {
        score += 40; // Low utilization but fits
      }
    } else if (capacity.availableAcres > 0) {
      // Partial fit - will require splitting
      score += 30; // Some points for partial fit
    } else {
      return -1; // No capacity = invalid
    }
    
    // Crop rotation bonus/penalty (-50 to +20)
    const rotationScore = optimizationEngine.evaluateCropRotation(planting.crop, lot);
    score += rotationScore;
    
    // Microclimate matching bonus (0-15)
    const climateScore = optimizationEngine.evaluateMicroclimate(planting, lot);
    score += climateScore;
    
    // Soil type compatibility (0-10)
    const soilScore = optimizationEngine.evaluateSoilMatch(planting, lot);
    score += soilScore;
    
    // Proximity bonus for same customer (0-5)
    const proximityScore = optimizationEngine.evaluateProximity(planting, lot, plantings);
    score += proximityScore;
    
    return Math.max(0, score);
  },
  
  evaluateCropRotation: (cropName: string, lot: Lot): number => {
    if (!lot.lastCrop || !lot.lastPlantDate) return 0;
    
    const lastPlantDate = new Date(lot.lastPlantDate);
    const daysSinceLastPlant = (Date.now() - lastPlantDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Check if crops conflict
    const conflicts = CROP_ROTATION_RULES.rotationConflicts[cropName] || [];
    if (conflicts.includes(lot.lastCrop)) {
      const minimumDays = CROP_ROTATION_RULES.minimumRotationDays[cropName] || 90;
      if (daysSinceLastPlant < minimumDays) {
        return -50; // Strong penalty for recent rotation conflict
      } else if (daysSinceLastPlant < minimumDays * 1.5) {
        return -20; // Mild penalty for marginal rotation
      } else {
        return 5; // Small bonus for proper rotation timing
      }
    }
    
    // Different crop family is good
    if (lot.lastCrop !== cropName) {
      return Math.min(20, daysSinceLastPlant / 10); // Bonus based on time elapsed
    }
    
    return 0;
  },
  
  evaluateMicroclimate: (planting: Planting, lot: Lot): number => {
    // Simple climate preferences (could be expanded)
    const preferences: { [crop: string]: string[] } = {
      'Romaine': ['Cool', 'Moderate'],
      'Iceberg': ['Cool', 'Moderate'], 
      'Carrots': ['Cool', 'Moderate', 'Warm'],
      'Broccoli': ['Cool'],
      'Cauliflower': ['Cool']
    };
    
    const preferred = preferences[planting.crop] || [];
    if (preferred.includes(lot.microclimate)) {
      return 15; // Bonus for ideal climate
    } else if (preferred.length === 0) {
      return 5; // Neutral if no preference
    }
    return 0;
  },
  
  evaluateSoilMatch: (planting: Planting, lot: Lot): number => {
    // Simple soil preferences
    const preferences: { [crop: string]: string[] } = {
      'Romaine': ['Sandy Loam', 'Loam'],
      'Iceberg': ['Sandy Loam', 'Loam'],
      'Carrots': ['Sandy Loam', 'Sandy'],
      'Broccoli': ['Loam', 'Clay Loam'],
      'Cauliflower': ['Loam', 'Clay Loam']
    };
    
    const preferred = preferences[planting.crop] || [];
    return preferred.includes(lot.soilType) ? 10 : 0;
  },
  
  evaluateProximity: (planting: Planting, lot: Lot, plantings: Planting[]): number => {
    // Small bonus if same customer already has plantings in this lot
    const customerPlantingsInLot = plantings.filter(p => 
      p.assigned && 
      p.customer === planting.customer &&
      p.lot === lot.number
    );
    return customerPlantingsInLot.length > 0 ? 5 : 0;
  },
  
  // Find the best lot suggestions for a planting
  findBestLots: (
    planting: Planting, 
    landStructure: Region[], 
    plantings: Planting[], 
    limit: number = 3
  ): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    
    landStructure.forEach(region => {
      region.ranches.forEach(ranch => {
        ranch.lots.forEach(lot => {
          const capacity = capacityService.calculateLotCapacity(region.id, ranch.id, lot.id, landStructure, plantings);
          
          if (capacity.availableAcres > 0) {
            const score = optimizationEngine.scoreLotForPlanting(planting, lot, region, ranch, landStructure, plantings);
            
            if (score > 0) {
              const fitType = capacity.availableAcres >= planting.acres ? 'perfect' : 'split';
              
              suggestions.push({
                lotId: `${region.id}-${ranch.id}-${lot.id}`,
                score,
                reasons: optimizationEngine.generateScoreReasons(planting, lot, capacity, fitType),
                location: `${region.region} > ${ranch.name} > Lot ${lot.number}`,
                region,
                ranch,
                lot,
                capacity,
                fitType
              } as any);
            }
          }
        });
      });
    });
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
  
  generateScoreReasons: (planting: Planting, lot: Lot, capacity: any, fitType: string): string[] => {
    const reasons: string[] = [];
    
    if (fitType === 'perfect') {
      reasons.push('Perfect fit for available space');
    } else {
      reasons.push(`Partial fit - ${capacity.availableAcres} acres available`);
    }
    
    const rotationScore = optimizationEngine.evaluateCropRotation(planting.crop, lot);
    if (rotationScore > 10) {
      reasons.push('Excellent crop rotation timing');
    } else if (rotationScore < -10) {
      reasons.push('⚠️ Recent rotation conflict');
    }
    
    const climateScore = optimizationEngine.evaluateMicroclimate(planting, lot);
    if (climateScore > 10) {
      reasons.push('Ideal microclimate match');
    }
    
    const soilScore = optimizationEngine.evaluateSoilMatch(planting, lot);
    if (soilScore > 5) {
      reasons.push('Good soil type compatibility');
    }
    
    return reasons;
  },
  
  // Optimize all unassigned plantings
  optimizeAllPlantings: (
    plantings: Planting[], 
    landStructure: Region[], 
    onSplitNotification: (notification: SplitNotification) => void
  ): OptimizationAssignment[] => {
    const unassigned = plantings.filter(p => !p.assigned);
    const optimizedAssignments: OptimizationAssignment[] = [];
    let tempPlantings = [...plantings]; // Work with a copy
    
    // Sort plantings by size (largest first) for better packing
    const sortedUnassigned = unassigned.sort((a, b) => b.acres - a.acres);
    
    sortedUnassigned.forEach(planting => {
      const suggestions = optimizationEngine.findBestLots(planting, landStructure, tempPlantings, 1);
      
      if (suggestions.length > 0) {
        const best = suggestions[0] as any;
        
        if (best.fitType === 'perfect') {
          // Simple assignment
          const sublot = capacityService.getNextSublotDesignation(best.region.id, best.ranch.id, best.lot.id, tempPlantings);
          const assignedPlanting = {
            ...planting,
            assigned: true,
            region: best.region.region,
            ranch: best.ranch.name,
            lot: best.lot.number,
            sublot,
            uniqueLotId: `${best.region.id}-${best.ranch.id}-${best.lot.id}`,
            displayLotId: `${best.region.region} > ${best.ranch.name} > Lot ${best.lot.number}${sublot ? `-${sublot}` : ''}`
          };
          
          optimizedAssignments.push({
            type: 'assign',
            original: planting,
            assigned: assignedPlanting,
            lot: best.lot,
            score: best.score
          });
          
          // Update temp plantings for next iteration
          tempPlantings = tempPlantings.map(p => 
            p.id === planting.id ? assignedPlanting : p
          );
          
        } else if (best.fitType === 'split' && best.capacity.availableAcres > 0) {
          // Split assignment
          const { assignedPortion, unassignedRemainder } = plantingService.splitPlanting(planting, best.capacity.availableAcres);
          const sublot = capacityService.getNextSublotDesignation(best.region.id, best.ranch.id, best.lot.id, tempPlantings);
          const assignedWithLocation = {
            ...assignedPortion,
            assigned: true,
            region: best.region.region,
            ranch: best.ranch.name,
            lot: best.lot.number,
            sublot,
            uniqueLotId: `${best.region.id}-${best.ranch.id}-${best.lot.id}`,
            displayLotId: `${best.region.region} > ${best.ranch.name} > Lot ${best.lot.number}${sublot ? `-${sublot}` : ''}`
          };
          
          optimizedAssignments.push({
            type: 'split',
            original: planting,
            assigned: assignedWithLocation,
            remainder: unassignedRemainder,
            lot: best.lot,
            score: best.score
          });
          
          // Update temp plantings
          tempPlantings = [
            ...tempPlantings.filter(p => p.id !== planting.id),
            assignedWithLocation,
            unassignedRemainder
          ];
        }
      }
    });
    
    return optimizedAssignments;
  }
};
