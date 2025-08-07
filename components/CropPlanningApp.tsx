"use client";

import React, { useState, useEffect, ChangeEvent, ReactNode } from 'react';
import { Calendar, Download, AlertTriangle, CheckCircle, Scissors, ArrowRight, Zap, Target, Brain, RefreshCw, Star, AlertCircle } from 'lucide-react';

// =============================================================================
// TYPESCRIPT INTERFACES AND TYPES
// =============================================================================

interface CropRotationRules {
  rotationConflicts: { [crop: string]: string[] };
  minimumRotationDays: { [crop: string]: number };
}

interface Lot {
  id: number;
  number: string;
  acres: number;
  soilType: string;
  lastCrop?: string;
  lastPlantDate?: string;
  microclimate: string;
}

interface Ranch {
  id: number;
  name: string;
  lots: Lot[];
}

interface Region {
  id: number;
  region: string;
  ranches: Ranch[];
}

interface Order {
  id: number;
  customer: string;
  commodity: string;
  volume: number;
  marketType: string;
  deliveryDate: string;
  isWeekly: boolean;
}

interface Variety {
  id: number;
  name: string;
  growingWindow: { start: string; end: string };
  daysToHarvest: number;
  bedSize: string;
  spacing: string;
  plantType: string;
  idealStand: number;
  marketTypes: string[];
  budgetYieldPerAcre: { [marketType: string]: number };
  preferences: { [month: string]: number };
}

interface Commodity {
  id: number;
  name: string;
  varieties: Variety[];
}

interface Planting {
  id: string;
  crop: string;
  variety: string;
  acres: number;
  plantDate: string;
  harvestDate: string;
  marketType: string;
  customer: string;
  volumeOrdered?: number;
  totalYield?: number;
  budgetYieldPerAcre?: number;
  splitSequence?: number;
  parentPlantingId?: string;
  splitTimestamp?: string;
  assigned?: boolean;
  region?: string;
  ranch?: string;
  lot?: string;
  sublot?: string;
  displayLotId?: string;
  uniqueLotId?: string;
  wetDate?: string;
  originalOrderId?: string;
  budgetedDaysToHarvest?: number;
  bedSize?: string;
  spacing?: string;
  budgetedHarvestDate?: string;
  idealStandPerAcre?: number;
  assignedLot?: {
    regionId: number;
    ranchId: number;
    lotId: number;
    sublot?: string;
  };
}

interface CapacityInfo {
  totalAcres: number;
  usedAcres: number;
  availableAcres: number;
  plantingCount?: number;
  plantings?: Planting[];
}

interface OptimizationAssignment {
  planting: Planting;
  lot: Lot;
  region: Region;
  ranch: Ranch;
  score: number;
  reason: string;
}

interface OptimizationResults {
  assignments: OptimizationAssignment[];
  unassigned: Planting[];
  summary: {
    total: number;
    assigned: number;
    unassigned: number;
    avgScore: number;
  };
}

interface SplitNotification {
  plantingId: string;
  originalAcres: number;
  assignedAcres: number;
  remainingAcres: number;
  lot: string;
}

interface Suggestion {
  lot: Lot;
  region: Region;
  ranch: Ranch;
  score: number;
  reason: string;
  capacity?: CapacityInfo;
  fitType?: string;
  rotationWarning?: boolean;
}

interface DragHandlers {
  onDragStart: (e: React.DragEvent, planting: Planting) => void;
  onDragOver: (e: React.DragEvent, regionId: number, ranchId: number, lotId: number) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

interface LandManagementFunctions {
  addRanch: (regionId: number, ranchData: Partial<Ranch>) => void;
  updateRanch: (regionId: number, ranchId: number, ranchData: Partial<Ranch>) => void;
  deleteRanch: (regionId: number, ranchId: number) => void;
  addLot: (regionId: number, ranchId: number, lotData: Partial<Lot>) => void;
  updateLot: (regionId: number, ranchId: number, lotId: number, lotData: Partial<Lot>) => void;
  deleteLot: (regionId: number, ranchId: number, lotId: number) => void;
}

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

interface TableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any, index: number) => ReactNode;
}

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NotificationProps {
  notification: SplitNotification;
  onClose: () => void;
}

interface SuggestionsDisplayProps {
  suggestions: Suggestion[];
  draggedPlanting: Planting | null;
}

interface OptimizationResultsModalProps {
  results: OptimizationResults;
  onClose: () => void;
  onApply: () => void;
}

interface CapacityIndicatorProps {
  capacity: CapacityInfo;
}

interface PreviewScoreProps {
  preview: { score: number; reason: string } | null;
  draggedPlanting: Planting | null;
}

interface OrdersManagementProps {
  orders: Order[];
  onAddOrder: (orderData: Partial<Order>) => void;
  onUpdateOrder: (id: number, orderData: Partial<Order>) => void;
  onDeleteOrder: (id: number) => void;
  commodities: Commodity[];
}

interface CommoditiesManagementProps {
  commodities: Commodity[];
  onAddVariety: (commodityId: number, varietyData: Partial<Variety>) => void;
  onUpdateVariety: (commodityId: number, varietyId: number, varietyData: Partial<Variety>) => void;
  onDeleteVariety: (commodityId: number, varietyId: number) => void;
}

interface LandPlanningViewProps {
  landStructure: Region[];
  plantings: Planting[];
  dragHandlers: DragHandlers;
  landManagement: LandManagementFunctions;
  splitNotification: SplitNotification | null;
  clearSplitNotification: () => void;
}

interface LandFeatureProps {
  landStructure: Region[];
  plantings: Planting[];
  dragHandlers: any;
  landManagement: any;
  splitNotification: SplitNotification | null;
  clearSplitNotification: () => void;
  optimizeAllPlantings: () => void;
  optimizationResults: OptimizationResults | null;
  clearOptimizationResults: () => void;
  isOptimizing?: boolean;
  setIsOptimizing?: (value: boolean) => void;
}

// =============================================================================
// SMART OPTIMIZATION ENGINE - NEW!
// =============================================================================

const cropRotationRules: CropRotationRules = {
  // Crop families that shouldn't follow each other
  rotationConflicts: {
    'Lettuce': ['Romaine', 'Iceberg', 'Lettuce'],
    'Romaine': ['Romaine', 'Iceberg', 'Lettuce'], 
    'Iceberg': ['Romaine', 'Iceberg', 'Lettuce'],
    'Carrots': ['Carrots', 'Parsnips'],
    'Broccoli': ['Broccoli', 'Cauliflower', 'Cabbage', 'Kale'],
    'Cauliflower': ['Broccoli', 'Cauliflower', 'Cabbage', 'Kale'],
  },
  
  // Days to wait before replanting same family
  minimumRotationDays: {
    'Lettuce': 90,
    'Romaine': 90,
    'Iceberg': 90,
    'Carrots': 120,
    'Broccoli': 180,
    'Cauliflower': 180,
  }
};

const optimizationEngine = {
  // Score a lot for a specific planting (higher = better)
  scoreLotForPlanting: (planting: Planting, lot: Lot, region: Region, ranch: Ranch, landStructure: Region[], plantings: Planting[]) => {
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
  
  evaluateCropRotation: (cropName: string, lot: Lot) => {
    if (!lot.lastCrop || !lot.lastPlantDate) return 0;
    
    const lastPlantDate = new Date(lot.lastPlantDate);
    const daysSinceLastPlant = (Date.now() - lastPlantDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Check if crops conflict
    const conflicts = cropRotationRules.rotationConflicts[cropName] || [];
    if (conflicts.includes(lot.lastCrop)) {
      const minimumDays = cropRotationRules.minimumRotationDays[cropName] || 90;
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
  
  evaluateMicroclimate: (planting: Planting, lot: Lot) => {
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
  
  evaluateSoilMatch: (planting: Planting, lot: Lot) => {
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
  
  evaluateProximity: (planting: Planting, lot: Lot, plantings: Planting[]) => {
    // Small bonus if same customer already has plantings in this lot
    const customerPlantingsInLot = plantings.filter(p => 
      p.assigned && 
      p.customer === planting.customer &&
      p.lot === lot.number
    );
    return customerPlantingsInLot.length > 0 ? 5 : 0;
  },
  
  // Find the best lot suggestions for a planting
  findBestLots: (planting: Planting, landStructure: Region[], plantings: Planting[], limit = 3): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    
    landStructure.forEach(region => {
      region.ranches.forEach(ranch => {
        ranch.lots.forEach(lot => {
          const score = optimizationEngine.scoreLotForPlanting(
            planting, lot, region, ranch, landStructure, plantings
          );
          
          if (score >= 0) {
            const capacity = capacityService.calculateLotCapacity(region.id, ranch.id, lot.id, landStructure, plantings);
            const fitCheck = capacityService.canFitInLot(planting.acres, region.id, ranch.id, lot.id, landStructure, plantings);
            
            suggestions.push({
              score,
              reason: `Score: ${score.toFixed(1)} - ${fitCheck.canFit ? 'Perfect fit' : fitCheck.willRequireSplit ? 'Requires split' : 'No capacity'}`,
              region,
              ranch, 
              lot,
              capacity,
              fitType: fitCheck.canFit ? 'perfect' : fitCheck.willRequireSplit ? 'split' : 'none',
              rotationWarning: optimizationEngine.evaluateCropRotation(planting.crop, lot) < -10
            });
          }
        });
      });
    });
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
  
  // Optimize all unassigned plantings
  optimizeAllPlantings: (plantings: Planting[], landStructure: Region[], onSplitNotification: (notification: SplitNotification) => void): any[] => {
    const unassigned = plantings.filter(p => !p.assigned);
    const optimizedAssignments: any[] = [];
    let tempPlantings = [...plantings]; // Work with a copy
    
    // Sort plantings by size (largest first) for better packing
    const sortedUnassigned = unassigned.sort((a, b) => b.acres - a.acres);
    
    sortedUnassigned.forEach(planting => {
      const suggestions = optimizationEngine.findBestLots(planting, landStructure, tempPlantings, 1);
      
      if (suggestions.length > 0) {
        const best = suggestions[0];
        
        if (best.fitType === 'perfect') {
          // Simple assignment
          const sublot = capacityService.getNextSublotDesignation(best.region.id, best.ranch.id, best.lot.id, tempPlantings);
          const assignedPlanting = plantingService.assignToLot(planting, best.region, best.ranch, best.lot, sublot);
          
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
          const assignedWithLocation = plantingService.assignToLot(assignedPortion, best.region, best.ranch, best.lot, sublot);
          
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

// =============================================================================
// SERVICES - Business Logic Layer (Enhanced)
// =============================================================================

const plantingService = {
  generateFromOrders: (orders: Order[], commodities: Commodity[]) => {
    const plantings: Planting[] = [];
    let plantingId = 1;
    
    orders.forEach(order => {
      const commodity = commodities.find(c => c.name === order.commodity);
      
      if (commodity) {
        const suitableVarieties = commodity.varieties.filter(v => 
          v.marketTypes.includes(order.marketType) && 
          v.budgetYieldPerAcre[order.marketType] > 0
        );
        
        if (suitableVarieties.length > 0) {
          const variety = suitableVarieties[0];
          const yieldPerAcre = variety.budgetYieldPerAcre[order.marketType];
          const acresNeeded = Math.ceil(order.volume / yieldPerAcre * 100) / 100;
          
          const deliveryDate = new Date(order.deliveryDate);
          const plantingDate = new Date(deliveryDate);
          plantingDate.setDate(plantingDate.getDate() - variety.daysToHarvest);
          
          const originalOrderId = `ORD-${order.id}`;
          
          const basePlanting = {
            id: `${order.id}-${commodity.id}-${variety.id}-${plantingId++}`,
            customer: order.customer,
            plantDate: plantingDate.toISOString().split('T')[0],
            harvestDate: deliveryDate.toString(),
            region: '',
            ranch: '',
            lot: '',
            sublot: '',
            displayLotId: '',
            marketType: order.marketType,
            crop: commodity.name,
            variety: variety.name,
            volumeOrdered: order.volume,
            acres: acresNeeded,
            wetDate: plantingDate.toISOString().split('T')[0],
            budgetedDaysToHarvest: variety.daysToHarvest,
            bedSize: variety.bedSize,
            spacing: variety.spacing,
            budgetedHarvestDate: order.deliveryDate,
            idealStandPerAcre: variety.idealStand,
            budgetYieldPerAcre: yieldPerAcre,
            totalYield: Math.round(acresNeeded * yieldPerAcre),
            assigned: false,
            originalOrderId: originalOrderId,
            parentPlantingId: undefined,
            splitSequence: 1,
            splitTimestamp: undefined
          };
          
          plantings.push(basePlanting);
          
          if (order.isWeekly) {
            for (let week = 1; week < 12; week++) {
              const weeklyDeliveryDate = new Date(deliveryDate);
              weeklyDeliveryDate.setDate(weeklyDeliveryDate.getDate() + (week * 7));
              
              const weeklyPlantingDate = new Date(weeklyDeliveryDate);
              weeklyPlantingDate.setDate(weeklyPlantingDate.getDate() - variety.daysToHarvest);
              
              plantings.push({
                ...basePlanting,
                id: plantingId++,
                wetDate: weeklyPlantingDate.toISOString().split('T')[0],
                budgetedHarvestDate: weeklyDeliveryDate.toISOString().split('T')[0],
                originalOrderId: `${originalOrderId}-W${week + 1}`,
                assigned: false
              });
            }
          }
        }
      }
    });
    
    return plantings;
  },
  
  assignToLot: (planting: Planting, region: Region, ranch: Ranch, lot: Lot, sublot?: string) => {
    const uniqueLotId = `${region.id}-${ranch.id}-${lot.id}`;
    const displayLotId = `${lot.number}-${sublot}`;
    
    return {
      ...planting,
      region: region.region,
      ranch: ranch.name,
      lot: lot.number,
      sublot: sublot,
      displayLotId: displayLotId,
      uniqueLotId,
      assigned: true
    };
  },

  splitPlanting: (originalPlanting: Planting, maxAcres: number) => {
    const remainingAcres = Math.round((originalPlanting.acres - maxAcres) * 100) / 100;
    const acreRatio = maxAcres / originalPlanting.acres;
    
    const assignedVolume = Math.round((originalPlanting.volumeOrdered || 0) * acreRatio);
    const remainingVolume = (originalPlanting.volumeOrdered || 0) - assignedVolume;
    
    const assignedTotalYield = Math.round(maxAcres * (originalPlanting.budgetYieldPerAcre || 0));
    const remainingTotalYield = Math.round(remainingAcres * (originalPlanting.budgetYieldPerAcre || 0));
    
    const assignedPortion = {
      ...originalPlanting,
      id: `${Date.now()}-${Math.random()}`,
      acres: maxAcres,
      volumeOrdered: assignedVolume,
      totalYield: assignedTotalYield,
      parentPlantingId: originalPlanting.id,
      splitSequence: (originalPlanting.splitSequence || 1) + 1,
      splitTimestamp: new Date().toISOString()
    };
    
    const unassignedRemainder = {
      ...originalPlanting,
      id: `${Date.now()}-${Math.random()}-1`,
      acres: remainingAcres,
      volumeOrdered: remainingVolume,
      totalYield: remainingTotalYield,
      assigned: false,
      region: '',
      ranch: '',
      lot: '',
      sublot: '',
      displayLotId: '',
      uniqueLotId: '',
      parentPlantingId: originalPlanting.id,
      splitSequence: (originalPlanting.splitSequence || 1) + 2,
      splitTimestamp: new Date().toISOString()
    };
    
    return { assignedPortion, unassignedRemainder };
  }
};

const capacityService = {
  calculateLotCapacity: (regionId: number, ranchId: number, lotId: number, landStructure: Region[], plantings: Planting[]): CapacityInfo => {
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
  
  getNextSublotDesignation: (regionId: number, ranchId: number, lotId: number, plantings: Planting[]): string => {
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
  
  canFitInLot: (plantingAcres: number, regionId: number, ranchId: number, lotId: number, landStructure: Region[], plantings: Planting[]) => {
    const capacity = capacityService.calculateLotCapacity(regionId, ranchId, lotId, landStructure, plantings);
    return {
      canFit: plantingAcres <= capacity.availableAcres,
      availableAcres: capacity.availableAcres,
      wouldExceedBy: Math.max(0, plantingAcres - capacity.availableAcres),
      willRequireSplit: plantingAcres > capacity.availableAcres && capacity.availableAcres > 0
    };
  }
};

const csvService = {
  exportPlantings: (plantings: Planting[]) => {
    try {
      const headers = ['Customer', 'Region', 'Ranch', 'Lot', 'Sublot', 'Full Lot ID', 'Market Type', 'Crop', 'Variety', 'Volume Ordered', 'Acres', 'Wet Date', 'Budgeted Days to Harvest', 'Bed Size', 'Spacing', 'Budgeted Harvest Date', 'Ideal Stand / Acre', 'Budget Yield / Acre', 'Total Yield', 'Original Order ID', 'Split Info'];
      
      const rows = plantings.map(p => [
        p.customer || '', 
        p.region || '', 
        p.ranch || '', 
        p.lot || '', 
        p.sublot || '',
        p.displayLotId || '',
        p.marketType || '', 
        p.crop || '', 
        p.variety || '', 
        p.volumeOrdered ? `${p.volumeOrdered} ${p.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}` : '',
        p.acres || '', 
        p.wetDate || '', 
        p.budgetedDaysToHarvest || '', 
        p.bedSize || '', 
        p.spacing || '', 
        p.budgetedHarvestDate || '', 
        p.idealStandPerAcre || '', 
        p.budgetYieldPerAcre ? `${p.budgetYieldPerAcre} ${p.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}/acre` : '',
        p.totalYield ? `${p.totalYield} ${p.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}` : '',
        p.originalOrderId || '',
        p.parentPlantingId ? `Split from Planting ${p.parentPlantingId} (Sequence: ${p.splitSequence})` : ''
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      
      try {
        const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'crop-plan.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (blobError) {
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = 'crop-plan.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('CSV export failed:', errorMessage);
      alert(`CSV export failed: ${errorMessage}`);
    }
  }
};

// =============================================================================
// PERSISTENCE UTILITIES - Data Storage Layer
// =============================================================================

const persistenceService = {
  // Save data to localStorage with error handling
  save: (key: string, data: any): boolean => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  },

  // Load data from localStorage with validation
  load: (key: string, defaultValue: any): any => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return defaultValue;
      
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  // Clear specific data
  clear: (key: string): boolean => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to clear ${key} from localStorage:`, error);
      return false;
    }
  },

  // Clear all app data
  clearAll: () => {
    const keys = ['cropPlanning_orders', 'cropPlanning_commodities', 'cropPlanning_landStructure', 
                  'cropPlanning_plantings', 'cropPlanning_activeTab'];
    keys.forEach(key => persistenceService.clear(key));
  }
};

// =============================================================================
// CUSTOM HOOKS - State Management Layer  
// =============================================================================

const useOrders = () => {
  // Default orders data
  const defaultOrders = [
    { id: 1, customer: 'Fresh Farms Co', commodity: 'Romaine', volume: 10000, marketType: 'Fresh Cut', deliveryDate: '2025-09-15', isWeekly: false },
    { id: 2, customer: 'Valley Produce', commodity: 'Carrots', volume: 50000, marketType: 'Bulk', deliveryDate: '2025-10-01', isWeekly: true },
    { id: 3, customer: 'Premium Greens', commodity: 'Iceberg', volume: 7500, marketType: 'Fresh Cut', deliveryDate: '2025-08-20', isWeekly: false },
    { id: 4, customer: 'Green Valley Co', commodity: 'Romaine', volume: 8000, marketType: 'Fresh Cut', deliveryDate: '2025-08-30', isWeekly: false },
    { id: 5, customer: 'Desert Fresh', commodity: 'Carrots', volume: 30000, marketType: 'Bulk', deliveryDate: '2025-11-15', isWeekly: false },
    { id: 6, customer: 'Coastal Greens', commodity: 'Iceberg', volume: 12000, marketType: 'Fresh Cut', deliveryDate: '2025-09-01', isWeekly: false }
  ];

  // Initialize with saved data or default
  const [orders, setOrders] = useState(() => {
    return persistenceService.load('cropPlanning_orders', defaultOrders);
  });

  // Auto-save orders when they change
  useEffect(() => {
    persistenceService.save('cropPlanning_orders', orders);
  }, [orders]);

  const addOrder = (orderData: Partial<Order>) => {
    const order = {
      id: Date.now(),
      ...orderData,
      volume: parseFloat(orderData.volume?.toString() || '0')
    };
    setOrders((prev: Order[]) => [...prev, order]);
  };

  const updateOrder = (id: number, orderData: Partial<Order>) => {
    setOrders((prev: Order[]) => prev.map((order: Order) => 
      order.id === id ? { ...orderData, id, volume: parseFloat(orderData.volume?.toString() || '0') } : order
    ));
  };

  const deleteOrder = (id: number) => {
    setOrders((prev: Order[]) => prev.filter((order: Order) => order.id !== id));
  };

  return { orders, addOrder, updateOrder, deleteOrder };
};

const useCommodities = () => {
  // Default commodities data
  const defaultCommodities = [
    {
      id: 1,
      name: 'Romaine',
      varieties: [
        { 
          id: 1, name: 'Green Forest', growingWindow: { start: 'Mar', end: 'Nov' }, daysToHarvest: 60,
          bedSize: '38-2', spacing: '12in', plantType: 'transplant', idealStand: 30000,
          marketTypes: ['Fresh Cut'], budgetYieldPerAcre: { 'Fresh Cut': 1200, 'Bulk': 0 },
          preferences: { Jan: 0, Feb: 0, Mar: 10, Apr: 15, May: 20, Jun: 20, Jul: 15, Aug: 10, Sep: 5, Oct: 5, Nov: 0, Dec: 0 }
        },
        { 
          id: 2, name: 'Parris Island Cos', growingWindow: { start: 'Apr', end: 'Oct' }, daysToHarvest: 58,
          bedSize: '38-2', spacing: '12in', plantType: 'transplant', idealStand: 32000,
          marketTypes: ['Fresh Cut', 'Bulk'], budgetYieldPerAcre: { 'Fresh Cut': 1100, 'Bulk': 25000 },
          preferences: { Jan: 0, Feb: 0, Mar: 5, Apr: 20, May: 25, Jun: 25, Jul: 15, Aug: 10, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    },
    {
      id: 2, name: 'Iceberg',
      varieties: [
        { 
          id: 3, name: 'Great Lakes', growingWindow: { start: 'Apr', end: 'Oct' }, daysToHarvest: 65,
          bedSize: '38-2', spacing: '12in', plantType: 'transplant', idealStand: 28000,
          marketTypes: ['Fresh Cut'], budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
          preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 20, May: 25, Jun: 25, Jul: 20, Aug: 10, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    },
    {
      id: 3, name: 'Carrots',
      varieties: [
        { 
          id: 4, name: 'Nantes', growingWindow: { start: 'Feb', end: 'Nov' }, daysToHarvest: 90,
          bedSize: '38-2', spacing: '2in', plantType: 'direct seed', idealStand: 500000,
          marketTypes: ['Bulk'], budgetYieldPerAcre: { 'Fresh Cut': 0, 'Bulk': 45000 },
          preferences: { Jan: 0, Feb: 10, Mar: 15, Apr: 15, May: 15, Jun: 15, Jul: 15, Aug: 10, Sep: 5, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    }
  ];

  // Initialize with saved data or default
  const [commodities, setCommodities] = useState(() => {
    return persistenceService.load('cropPlanning_commodities', defaultCommodities);
  });

  // Auto-save commodities when they change
  useEffect(() => {
    persistenceService.save('cropPlanning_commodities', commodities);
  }, [commodities]);

  const addVariety = (commodityId: number, varietyData: Partial<Variety>) => {
    const varietyWithId = { ...varietyData, id: Date.now() };
    setCommodities((prev: Commodity[]) => prev.map((c: Commodity) => 
      c.id === commodityId 
        ? { ...c, varieties: [...c.varieties, varietyWithId] }
        : c
    ));
  };

  const updateVariety = (commodityId: number, varietyId: number, varietyData: Partial<Variety>) => {
    setCommodities((prev: Commodity[]) => prev.map((c: Commodity) => 
      c.id === commodityId 
        ? { 
            ...c, 
            varieties: c.varieties.map((v: Variety) => 
              v.id === varietyId ? { ...varietyData, id: varietyId } : v
            )
          }
        : c
    ));
  };

  const deleteVariety = (commodityId: number, varietyId: number) => {
    setCommodities((prev: Commodity[]) => prev.map((c: Commodity) => 
      c.id === commodityId 
        ? { ...c, varieties: c.varieties.filter((v: Variety) => v.id !== varietyId) }
        : c
    ));
  };

  return { commodities, addVariety, updateVariety, deleteVariety };
};

const useLandManagement = () => {
  // Default land structure data
  const defaultLandStructure = [
    {
      id: 1, region: 'Salinas',
      ranches: [
        {
          id: 1, name: 'North Ranch',
          lots: [
            { id: 1, number: '1', acres: 25, soilType: 'Sandy Loam', lastCrop: 'Lettuce', lastPlantDate: '2024-08-15', microclimate: 'Cool' },
            { id: 2, number: '2', acres: 30, soilType: 'Clay Loam', lastCrop: 'Carrots', lastPlantDate: '2024-06-01', microclimate: 'Cool' },
            { id: 3, number: '3', acres: 20, soilType: 'Sandy Loam', lastCrop: 'Broccoli', lastPlantDate: '2024-07-10', microclimate: 'Moderate' }
          ]
        },
        {
          id: 2, name: 'South Ranch',
          lots: [
            { id: 4, number: '1', acres: 35, soilType: 'Clay Loam', lastCrop: 'Spinach', lastPlantDate: '2024-05-20', microclimate: 'Warm' },
            { id: 5, number: '2', acres: 28, soilType: 'Sandy Loam', lastCrop: 'Lettuce', lastPlantDate: '2024-09-01', microclimate: 'Warm' }
          ]
        }
      ]
    },
    {
      id: 2, region: 'Yuma',
      ranches: [
        {
          id: 3, name: 'Desert Ranch',
          lots: [
            { id: 6, number: '1', acres: 40, soilType: 'Sandy', lastCrop: 'Cauliflower', lastPlantDate: '2024-11-15', microclimate: 'Hot' },
            { id: 7, number: '2', acres: 32, soilType: 'Sandy', lastCrop: 'Cabbage', lastPlantDate: '2024-12-01', microclimate: 'Hot' }
          ]
        }
      ]
    }
  ];

  // Initialize with saved data or default
  const [landStructure, setLandStructure] = useState(() => {
    return persistenceService.load('cropPlanning_landStructure', defaultLandStructure);
  });

  // Auto-save land structure when it changes
  useEffect(() => {
    persistenceService.save('cropPlanning_landStructure', landStructure);
  }, [landStructure]);

  const addRegion = (regionName: string) => {
    const newRegion = {
      id: Date.now(),
      region: regionName,
      ranches: []
    };
    setLandStructure((prev: Region[]) => [...prev, newRegion]);
  };

  const addRanch = (regionId: number, ranchData: Partial<Ranch>) => {
    const newRanch = {
      id: Date.now(),
      name: ranchData.name,
      lots: []
    };
    setLandStructure((prev: Region[]) => prev.map((region: Region) =>
      region.id === regionId
        ? { ...region, ranches: [...region.ranches, newRanch] }
        : region
    ));
  };

  const updateRanch = (regionId: number, ranchId: number, ranchData: Partial<Ranch>) => {
    setLandStructure((prev: Region[]) => prev.map((region: Region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch: Ranch) =>
              ranch.id === ranchId ? { ...ranch, name: ranchData.name } : ranch
            )
          }
        : region
    ));
  };

  const deleteRanch = (regionId: number, ranchId: number) => {
    setLandStructure((prev: Region[]) => prev.map((region: Region) =>
      region.id === regionId
        ? { ...region, ranches: region.ranches.filter((ranch: Ranch) => ranch.id !== ranchId) }
        : region
    ));
  };

  const addLot = (regionId: number, ranchId: number, lotData: Partial<Lot>) => {
    const newLot = {
      id: Date.now(),
      number: lotData.number || '',
      acres: parseFloat(lotData.acres?.toString() || '0'),
      soilType: lotData.soilType,
      lastCrop: lotData.lastCrop,
      lastPlantDate: lotData.lastPlantDate,
      microclimate: lotData.microclimate
    };
    
    setLandStructure((prev: Region[]) => prev.map((region: Region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch: Ranch) =>
              ranch.id === ranchId
                ? { ...ranch, lots: [...ranch.lots, newLot] }
                : ranch
            )
          }
        : region
    ));
  };

  const updateLot = (regionId: number, ranchId: number, lotId: number, lotData: Partial<Lot>) => {
    setLandStructure((prev: Region[]) => prev.map((region: Region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch: Ranch) =>
              ranch.id === ranchId
                ? {
                    ...ranch,
                    lots: ranch.lots.map((lot: Lot) =>
                      lot.id === lotId
                        ? {
                            ...lot,
                            number: lotData.number || lot.number,
                            acres: parseFloat(lotData.acres?.toString() || lot.acres.toString()),
                            soilType: lotData.soilType,
                            lastCrop: lotData.lastCrop,
                            lastPlantDate: lotData.lastPlantDate,
                            microclimate: lotData.microclimate
                          }
                        : lot
                    )
                  }
                : ranch
            )
          }
        : region
    ));
  };

  const deleteLot = (regionId: number, ranchId: number, lotId: number) => {
    setLandStructure((prev: Region[]) => prev.map((region: Region) =>
      region.id === regionId
        ? {
            ...region,
            ranches: region.ranches.map((ranch: Ranch) =>
              ranch.id === ranchId
                ? { ...ranch, lots: ranch.lots.filter((lot: Lot) => lot.id !== lotId) }
                : ranch
            )
          }
        : region
    ));
  };

  const findLot = (regionId: number, ranchId: number, lotId: number) => {
    const region = landStructure.find((r: Region) => r.id === regionId);
    const ranch = region?.ranches.find((r: Ranch) => r.id === ranchId);
    const lot = ranch?.lots.find((l: Lot) => l.id === lotId);
    return { region, ranch, lot };
  };

  return { 
    landStructure, 
    setLandStructure, 
    addRegion, 
    addRanch, 
    updateRanch, 
    deleteRanch,
    addLot,
    updateLot,
    deleteLot,
    findLot 
  };
};

const useSplitNotifications = () => {
  const [splitNotification, setSplitNotification] = useState<SplitNotification | null>(null);

  const showSplitNotification = (notification: SplitNotification) => {
    setSplitNotification(notification);
  };

  const clearSplitNotification = () => {
    setSplitNotification(null);
  };

  return { splitNotification, showSplitNotification, clearSplitNotification };
};

// NEW: Optimization results management
const useOptimizationResults = () => {
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResults | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const showOptimizationResults = (results: OptimizationResults) => {
    setOptimizationResults(results);
  };

  const clearOptimizationResults = () => {
    setOptimizationResults(null);
  };

  return { 
    optimizationResults, 
    isOptimizing, 
    setIsOptimizing,
    showOptimizationResults, 
    clearOptimizationResults 
  };
};

const usePlantings = (orders: Order[], commodities: Commodity[], landStructure: Region[]) => {
  // Initialize with saved data or empty array
  const [plantings, setPlantings] = useState(() => {
    return persistenceService.load('cropPlanning_plantings', []);
  });

  // Auto-save plantings when they change
  useEffect(() => {
    persistenceService.save('cropPlanning_plantings', plantings);
  }, [plantings]);

  const generatePlantings = () => {
    const newPlantings = plantingService.generateFromOrders(orders, commodities);
    setPlantings(newPlantings);
  };

  const assignPlantingToLot = (plantingId: string, region: Region, ranch: Ranch, lot: Lot, onSplitNotification?: (notification: SplitNotification) => void) => {
    const planting = plantings.find((p: Planting) => p.id === plantingId);
    if (!planting) {
      return { success: false, type: 'not_found' };
    }
    
    const fitCheck = capacityService.canFitInLot(
      planting.acres, 
      region.id, 
      ranch.id, 
      lot.id, 
      landStructure, 
      plantings
    );
    
    if (fitCheck.canFit) {
      const sublot = capacityService.getNextSublotDesignation(region.id, ranch.id, lot.id, plantings);
      const updatedPlanting = plantingService.assignToLot(planting, region, ranch, lot, sublot);
      
      setPlantings((prev: Planting[]) => prev.map((p: Planting) => 
        p.id === plantingId ? updatedPlanting : p
      ));
      
      return { success: true, type: 'assigned' };
      
    } else if (fitCheck.availableAcres > 0) {
      const { assignedPortion, unassignedRemainder } = plantingService.splitPlanting(
        planting, 
        fitCheck.availableAcres
      );
      
      const sublot = capacityService.getNextSublotDesignation(region.id, ranch.id, lot.id, plantings);
      const assignedWithLocation = plantingService.assignToLot(assignedPortion, region, ranch, lot, sublot);
      
      setPlantings((prev: Planting[]) => [
        ...prev.filter((p: Planting) => p.id !== plantingId),
        assignedWithLocation,
        unassignedRemainder
      ]);
      
      if (onSplitNotification) {
        onSplitNotification({
          plantingId: planting.id,
          originalAcres: planting.acres,
          assignedAcres: assignedWithLocation.acres,
          remainingAcres: unassignedRemainder.acres,
          lot: `${lot.number}`
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
        message: `Lot ${lot.number} is at full capacity (${lot.acres} acres used)`
      };
    }
  };

  // NEW: Bulk optimization function
  const optimizeAllPlantings = (onSplitNotification?: (notification: SplitNotification) => void, onOptimizationComplete?: (results: OptimizationResults) => void) => {
    const assignments = optimizationEngine.optimizeAllPlantings(plantings, landStructure, onSplitNotification || (() => {}));
    
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
          assignment.remainder
        ];
        
        // Show split notification for each split
        if (onSplitNotification) {
          setTimeout(() => {
            onSplitNotification({
              plantingId: assignment.original.id,
              originalAcres: assignment.original.acres,
              assignedAcres: assignment.assigned.acres,
              remainingAcres: assignment.remainder.acres,
              lot: assignment.lot.number
            });
          }, 100);
        }
      }
    });
    
    setPlantings(updatedPlantings);
    
    // Report optimization results
    if (onOptimizationComplete) {
      onOptimizationComplete({ 
        assignments: assignments, 
        unassigned: [], 
        summary: { 
          total: assignments.length, 
          assigned: assignments.length, 
          unassigned: 0, 
          avgScore: assignments.length > 0 ? assignments.reduce((sum: number, a: any) => sum + a.score, 0) / assignments.length : 0
        } 
      });
    }
    
    return assignments;
  };

  return { plantings, generatePlantings, assignPlantingToLot, optimizeAllPlantings };
};

const useDragAndDrop = (assignPlantingToLot: any, findLot: any, landStructure: Region[], plantings: Planting[], showSplitNotification: (notification: SplitNotification) => void) => {
  const [draggedPlanting, setDraggedPlanting] = useState<Planting | null>(null);
  const [dragPreview, setDragPreview] = useState<{score: number; reason: string; lot: string; nextSublot: string; optimizationScore: number; rotationWarning: boolean} | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<Suggestion[]>([]);

  const handleDragStart = (e, planting) => {
    setDraggedPlanting(planting);
    e.dataTransfer.effectAllowed = 'move';
    
    // NEW: Generate smart suggestions when drag starts
    const suggestions = optimizationEngine.findBestLots(planting, landStructure, plantings, 3);
    setSmartSuggestions(suggestions);
  };

  const handleDragOver = (e, regionId, ranchId, lotId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedPlanting) {
      const fitCheck = capacityService.canFitInLot(
        draggedPlanting.acres,
        regionId,
        ranchId,
        lotId,
        landStructure,
        plantings
      );
      
      const { region, ranch, lot } = findLot(regionId, ranchId, lotId);
      
      // NEW: Add optimization score to preview
      const score = optimizationEngine.scoreLotForPlanting(
        draggedPlanting, lot, region, ranch, landStructure, plantings
      );
      
      const rotationWarning = optimizationEngine.evaluateCropRotation(draggedPlanting.crop, lot) < -10;
      
      setDragPreview({
        lot: lot,
        canFit: fitCheck.canFit,
        availableAcres: fitCheck.availableAcres,
        wouldExceedBy: fitCheck.wouldExceedBy,
        willRequireSplit: fitCheck.willRequireSplit,
        nextSublot: capacityService.getNextSublotDesignation(regionId, ranchId, lotId, plantings),
        optimizationScore: score,
        rotationWarning: rotationWarning
      });
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragPreview(null);
    }
  };

  const handleDragEnd = () => {
    setSmartSuggestions([]);
  };

  const handleDrop = (e, regionId, ranchId, lotId) => {
    e.preventDefault();
    setDragPreview(null);
    setSmartSuggestions([]);
    
    if (draggedPlanting) {
      const { region, ranch, lot } = findLot(regionId, ranchId, lotId);
      if (region && ranch && lot) {
        const result = assignPlantingToLot(
          draggedPlanting.id, 
          region, 
          ranch, 
          lot,
          showSplitNotification
        );
        
        if (!result.success && result.type === 'no_capacity') {
          alert(result.message);
        }
      }
      setDraggedPlanting(null);
    }
  };

  return { 
    draggedPlanting, 
    dragPreview,
    smartSuggestions,
    handleDragStart, 
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop 
  };
};

// =============================================================================
// SHARED COMPONENTS - Reusable UI Layer
// =============================================================================

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end space-x-2 mt-6">{actions}</div>
      </div>
    </div>
  );
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, onClick, disabled, className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center gap-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'text-white hover:bg-opacity-90',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'text-red-600 hover:text-red-900',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const style = variant === 'primary' ? { backgroundColor: '#0f3e62' } : {};

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const SplitNotificationModal: React.FC<NotificationProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const { plantingId, originalAcres, assignedAcres, remainingAcres, lot } = notification;

  return (
    <Modal 
      isOpen={!!notification} 
      onClose={onClose} 
      title="Planting Split Successfully"
      actions={[
        <Button key="ok" onClick={onClose}>
          Got it!
        </Button>
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Scissors className="text-blue-600" size={24} />
          <div>
            <div className="font-medium text-blue-900">
              Planting was automatically split due to lot capacity
            </div>
            <div className="text-sm text-blue-700">
              {originalAcres} acres didn't fit in Lot {lot}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-800 mb-2">Split Summary:</div>
          <div className="text-sm text-gray-600">
            <div><strong>Original:</strong> {originalAcres} acres</div>
            <div><strong>Assigned:</strong> {assignedAcres} acres to Lot {lot}</div>
            <div><strong>Remaining:</strong> {remainingAcres} acres (unassigned)</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>💡 Tip:</strong> The remaining {remainingAcres} acres will appear in the unassigned plantings list. 
          You can drag it to another lot with sufficient capacity.
        </div>
      </div>
    </Modal>
  );
};

// NEW: Smart Suggestions Overlay
const SmartSuggestionsOverlay: React.FC<SuggestionsDisplayProps> = ({ suggestions, draggedPlanting }) => {
  if (!suggestions.length || !draggedPlanting) return null;

  return (
    <div className="fixed top-20 left-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="text-blue-600" size={16} />
        <span className="font-medium text-gray-900">Smart Suggestions</span>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        Best lots for {draggedPlanting.crop}:
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={`${suggestion.region.id}-${suggestion.ranch.id}-${suggestion.lot.id}`} 
               className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500" size={12} />
                <span className="text-xs font-medium">#{index + 1}</span>
              </div>
              <span className="text-sm font-medium">
                Lot {suggestion.lot.number}
              </span>
              {suggestion.fitType === 'split' && (
                <Scissors className="text-orange-500" size={12} />
              )}
              {suggestion.rotationWarning && (
                <AlertCircle className="text-red-500" size={12} />
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {Math.round(suggestion.score)} pts
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Higher scores = better fit
      </div>
    </div>
  );
};

// NEW: Optimization Results Modal
const OptimizationResultsModal = ({ results, onClose, onApply }) => {
  if (!results) return null;

  const assigned = results.filter(r => r.type === 'assign');
  const splits = results.filter(r => r.type === 'split');
  const totalOptimized = assigned.length + splits.length;

  return (
    <Modal 
      isOpen={!!results} 
      onClose={onClose} 
      title="🎯 Optimization Results"
      actions={[
        <Button key="cancel" variant="outline" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="apply" variant="success" onClick={onApply}>
          Apply All Assignments
        </Button>
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <Target className="text-green-600" size={24} />
          <div>
            <div className="font-medium text-green-900">
              Optimization Complete!
            </div>
            <div className="text-sm text-green-700">
              Found optimal assignments for {totalOptimized} plantings
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{assigned.length}</div>
            <div className="text-sm text-blue-700">Perfect Fits</div>
            <div className="text-xs text-blue-600">No splitting required</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">{splits.length}</div>
            <div className="text-sm text-orange-700">Smart Splits</div>
            <div className="text-xs text-orange-600">Maximized lot utilization</div>
          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          <div className="text-sm font-medium text-gray-800 mb-2">Assignment Preview:</div>
          <div className="space-y-2">
            {results.slice(0, 10).map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div>
                  <span className="font-medium">{assignment.original.crop}</span> 
                  <span className="text-gray-600"> • {assignment.original.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  {assignment.type === 'split' && (
                    <Scissors className="text-orange-500" size={12} />
                  )}
                  <span className="text-gray-500">→ Lot {assignment.lot.number}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                    {Math.round(assignment.score)} pts
                  </span>
                </div>
              </div>
            ))}
            {results.length > 10 && (
              <div className="text-xs text-gray-500 text-center py-2">
                ... and {results.length - 10} more assignments
              </div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>💡 How it works:</strong> The optimization engine considers lot capacity, crop rotation, 
          soil compatibility, microclimate preferences, and customer proximity to find the best assignments.
        </div>
      </div>
    </Modal>
  );
};

const LotCapacityIndicator = ({ capacity }) => {
  const utilizationPercent = capacity.totalAcres > 0 ? (capacity.usedAcres / capacity.totalAcres) * 100 : 0;
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{capacity.usedAcres} of {capacity.totalAcres} acres used</span>
        <span>{capacity.availableAcres} available</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${
            utilizationPercent > 95 ? 'bg-red-500' : 
            utilizationPercent > 80 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
        />
      </div>
      {capacity.plantingCount > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {capacity.plantingCount} planting{capacity.plantingCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// ENHANCED: Drag Preview with Optimization Intelligence
const DragPreview = ({ preview, draggedPlanting }) => {
  if (!preview || !draggedPlanting) return null;
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };
  
  return (
    <div className={`fixed z-50 p-3 rounded-lg border-2 pointer-events-none shadow-lg ${
      preview.canFit ? 'border-green-400 bg-green-50' : 
      preview.willRequireSplit ? 'border-orange-400 bg-orange-50' :
      'border-red-400 bg-red-50'
    }`} style={{ top: '10px', right: '10px', minWidth: '240px' }}>
      {preview.canFit ? (
        <div className="text-green-800">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle size={16} />
            ✅ Fits in Lot {preview.lot?.number}-{preview.nextSublot}
          </div>
          <div className="text-sm mt-1">
            Will use {draggedPlanting.acres} of {preview.availableAcres} available acres
          </div>
          {preview.optimizationScore >= 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Target size={12} />
              <span className={`text-sm font-medium ${getScoreColor(preview.optimizationScore)}`}>
                {getScoreLabel(preview.optimizationScore)} ({Math.round(preview.optimizationScore)} pts)
              </span>
            </div>
          )}
          {preview.rotationWarning && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
              <AlertCircle size={10} />
              Crop rotation concern
            </div>
          )}
        </div>
      ) : preview.willRequireSplit ? (
        <div className="text-orange-800">
          <div className="flex items-center gap-2 font-medium">
            <Scissors size={16} />
            ✂️ Will Split Planting
          </div>
          <div className="text-sm space-y-1 mt-2">
            <div className="flex items-center gap-1">
              <ArrowRight size={12} />
              <span className="font-medium">{preview.availableAcres} acres</span> → Lot {preview.lot?.number}-{preview.nextSublot}
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight size={12} />
              <span className="font-medium">{preview.wouldExceedBy} acres</span> → Unassigned
            </div>
          </div>
          {preview.optimizationScore >= 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Target size={12} />
              <span className={`text-sm font-medium ${getScoreColor(preview.optimizationScore)}`}>
                {getScoreLabel(preview.optimizationScore)} ({Math.round(preview.optimizationScore)} pts)
              </span>
            </div>
          )}
          {preview.rotationWarning && (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
              <AlertCircle size={10} />
              Rotation warning
            </div>
          )}
        </div>
      ) : (
        <div className="text-red-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} />
            ❌ No Capacity
          </div>
          <div className="text-sm mt-1">
            Lot {preview.lot?.number} is full ({preview.lot?.acres} acres)
          </div>
        </div>
      )}
    </div>
  );
};

const DataTable = ({ headers, data, renderRow }) => (
  <div className="bg-white shadow-sm rounded-lg overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((item, index) => renderRow(item, index))}
      </tbody>
    </table>
  </div>
);

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'commodities', name: 'Commodities & Varieties', icon: '🌱' },
    { id: 'land', name: 'Land Management', icon: '🗺️' },
    { id: 'gantt', name: 'Timeline View', icon: '📅' },
    { id: 'planning', name: 'Crop Planning', icon: '📊' },
    { id: 'data', name: 'Data Management', icon: '💾' }
  ];

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? '' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={activeTab === tab.id ? { borderColor: '#0f3e62', color: '#0f3e62' } : {}}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// =============================================================================
// FEATURE COMPONENTS - Domain-Specific Features  
// =============================================================================

const OrdersFeature: React.FC<OrdersManagementProps> = ({ orders, onAddOrder, onUpdateOrder, onDeleteOrder, commodities }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customer: '', commodity: '', volume: '', marketType: 'Fresh Cut', deliveryDate: '', isWeekly: false
  });

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customer: order.customer,
      commodity: order.commodity,
      volume: order.volume.toString(),
      marketType: order.marketType,
      deliveryDate: order.deliveryDate,
      isWeekly: order.isWeekly
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (formData.customer && formData.commodity && formData.volume && formData.deliveryDate) {
      if (editingOrder) {
        onUpdateOrder(editingOrder.id, { ...formData, volume: parseFloat(formData.volume) });
      } else {
        onAddOrder({ ...formData, volume: parseFloat(formData.volume) });
      }
      setFormData({ customer: '', commodity: '', volume: '', marketType: 'Fresh Cut', deliveryDate: '', isWeekly: false });
      setEditingOrder(null);
      setShowForm(false);
    }
  };

  const headers = ['Customer', 'Commodity', 'Market Type', 'Volume', 'Delivery Date', 'Type', 'Actions'];

  const renderRow = (order) => (
    <tr key={order.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customer}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.commodity}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          order.marketType === 'Fresh Cut' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {order.marketType}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.volume.toLocaleString()} {order.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.deliveryDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          order.isWeekly ? 'text-white' : 'bg-gray-100 text-gray-800'
        }`}
        style={order.isWeekly ? { backgroundColor: '#2563eb' } : {}}
        >
          {order.isWeekly ? 'Weekly' : 'One-time'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button onClick={() => handleEdit(order)} className="transition-colors" style={{ color: '#0f3e62' }}>
            Edit
          </button>
          <button onClick={() => onDeleteOrder(order.id)} className="text-red-600 hover:text-red-900">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Customer Orders</h2>
        <Button onClick={() => setShowForm(true)}>Add Order</Button>
      </div>

      <DataTable headers={headers} data={orders} renderRow={renderRow} />

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingOrder(null); }}
        title={editingOrder ? 'Edit Order' : 'Add New Order'}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => { setShowForm(false); setEditingOrder(null); }}>
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmit}>
            {editingOrder ? 'Update Order' : 'Add Order'}
          </Button>
        ]}
      >
        <input
          type="text"
          placeholder="Customer Name"
          value={formData.customer}
          onChange={(e) => setFormData({...formData, customer: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        />
        <select
          value={formData.commodity}
          onChange={(e) => setFormData({...formData, commodity: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        >
          <option value="">Select Commodity</option>
          {commodities.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          value={formData.marketType}
          onChange={(e) => setFormData({...formData, marketType: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        >
          <option value="Fresh Cut">Fresh Cut</option>
          <option value="Bulk">Bulk</option>
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`Volume (${formData.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'})`}
            value={formData.volume}
            onChange={(e) => setFormData({...formData, volume: e.target.value})}
            className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-900"
          />
          <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            {formData.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'}
          </div>
        </div>
        <input
          type="date"
          value={formData.deliveryDate}
          onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isWeekly}
            onChange={(e) => setFormData({...formData, isWeekly: e.target.checked})}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Weekly recurring order</span>
        </label>
      </Modal>
    </div>
  );
};

const CommoditiesFeature: React.FC<CommoditiesManagementProps> = ({ commodities, onAddVariety, onUpdateVariety, onDeleteVariety }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingVariety, setEditingVariety] = useState<Variety | null>(null);
  const [editingCommodityId, setEditingCommodityId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', growingWindow: { start: 'Jan', end: 'Dec' }, daysToHarvest: 60, bedSize: '38-2', spacing: '12in',
    plantType: 'transplant', idealStand: 30000, marketTypes: ['Fresh Cut'],
    budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
    preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleAddVariety = (commodityId) => {
    setEditingCommodityId(commodityId);
    setEditingVariety(null);
    setFormData({
      name: '', growingWindow: { start: 'Jan', end: 'Dec' }, daysToHarvest: 60, bedSize: '38-2', spacing: '12in',
      plantType: 'transplant', idealStand: 30000, marketTypes: ['Fresh Cut'],
      budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
      preferences: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
    });
    setShowForm(true);
  };

  const handleEditVariety = (commodityId, variety) => {
    setEditingCommodityId(commodityId);
    setEditingVariety(variety);
    setFormData({ ...variety });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (formData.name && editingCommodityId) {
      if (editingVariety) {
        onUpdateVariety(editingCommodityId, editingVariety.id, formData);
      } else {
        onAddVariety(editingCommodityId, formData);
      }
      setShowForm(false);
      setEditingVariety(null);
      setEditingCommodityId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Commodities & Varieties</h2>

      <div className="space-y-4">
        {commodities.map(commodity => (
          <div key={commodity.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{commodity.name}</h3>
              <Button variant="secondary" size="sm" onClick={() => handleAddVariety(commodity.id)}>
                Add Variety
              </Button>
            </div>
            
            {commodity.varieties.map((variety) => (
              <div key={variety.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-800">{variety.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      variety.plantType === 'transplant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {variety.plantType}
                    </span>
                    <div className="flex gap-1">
                      {variety.marketTypes.map(marketType => (
                        <span key={marketType} className={`px-2 py-1 text-xs rounded-full ${
                          marketType === 'Fresh Cut' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {marketType}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditVariety(commodity.id, variety)}
                      className="p-1 transition-colors"
                      style={{ color: '#0f3e62' }}
                    >
                      Edit
                    </button>
                    {commodity.varieties.length > 1 && (
                      <button
                        onClick={() => onDeleteVariety(commodity.id, variety.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-700">Growing Window:</span>
                    <div className="font-medium text-gray-900">{variety.growingWindow.start} - {variety.growingWindow.end}</div>
                  </div>
                  <div>
                    <span className="text-gray-700">Days to Harvest:</span>
                    <div className="font-medium text-gray-900">{variety.daysToHarvest} days</div>
                  </div>
                  <div>
                    <span className="text-gray-700">Bed Size:</span>
                    <div className="font-medium text-gray-900">{variety.bedSize}</div>
                  </div>
                  <div>
                    <span className="text-gray-700">Ideal Stand/Acre:</span>
                    <div className="font-medium text-gray-900">{variety.idealStand.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  {variety.marketTypes.includes('Fresh Cut') && variety.budgetYieldPerAcre['Fresh Cut'] > 0 && (
                    <div>
                      <span className="text-gray-700">Fresh Cut Yield:</span>
                      <div className="font-medium text-gray-900">{variety.budgetYieldPerAcre['Fresh Cut'].toLocaleString()} cartons/acre</div>
                    </div>
                  )}
                  {variety.marketTypes.includes('Bulk') && variety.budgetYieldPerAcre['Bulk'] > 0 && (
                    <div>
                      <span className="text-gray-700">Bulk Yield:</span>
                      <div className="font-medium text-gray-900">{variety.budgetYieldPerAcre['Bulk'].toLocaleString()} lbs/acre</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingVariety(null); setEditingCommodityId(null); }}
        title={editingVariety ? `Edit Variety: ${editingVariety.name}` : 'Add New Variety'}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => { setShowForm(false); setEditingVariety(null); setEditingCommodityId(null); }}>
            Cancel
          </Button>,
          <Button key="submit" variant="secondary" onClick={handleSubmit}>
            {editingVariety ? 'Update Variety' : 'Add Variety'}
          </Button>
        ]}
      >
        <input
          type="text"
          placeholder="Variety Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <select
            value={formData.growingWindow.start}
            onChange={(e) => setFormData({
              ...formData,
              growingWindow: { ...formData.growingWindow, start: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            value={formData.growingWindow.end}
            onChange={(e) => setFormData({
              ...formData,
              growingWindow: { ...formData.growingWindow, end: e.target.value }
            })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Days to Harvest"
            value={formData.daysToHarvest}
            onChange={(e) => setFormData({
              ...formData,
              daysToHarvest: parseInt(e.target.value) || 60
            })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          />
          <input
            type="number"
            placeholder="Ideal Stand per Acre"
            value={formData.idealStand}
            onChange={(e) => setFormData({
              ...formData,
              idealStand: parseInt(e.target.value) || 30000
            })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-2">Market Types</label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.marketTypes.includes('Fresh Cut')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      marketTypes: [...formData.marketTypes, 'Fresh Cut']
                    });
                  } else {
                    setFormData({
                      ...formData,
                      marketTypes: formData.marketTypes.filter(mt => mt !== 'Fresh Cut')
                    });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Fresh Cut</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.marketTypes.includes('Bulk')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      marketTypes: [...formData.marketTypes, 'Bulk']
                    });
                  } else {
                    setFormData({
                      ...formData,
                      marketTypes: formData.marketTypes.filter(mt => mt !== 'Bulk')
                    });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Bulk</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-2">Budget Yields per Acre</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Fresh Cut (cartons/acre)</label>
              <input
                type="number"
                value={formData.budgetYieldPerAcre['Fresh Cut']}
                onChange={(e) => setFormData({
                  ...formData,
                  budgetYieldPerAcre: {
                    ...formData.budgetYieldPerAcre,
                    'Fresh Cut': parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                disabled={!formData.marketTypes.includes('Fresh Cut')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Bulk (lbs/acre)</label>
              <input
                type="number"
                value={formData.budgetYieldPerAcre['Bulk']}
                onChange={(e) => setFormData({
                  ...formData,
                  budgetYieldPerAcre: {
                    ...formData.budgetYieldPerAcre,
                    'Bulk': parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
                disabled={!formData.marketTypes.includes('Bulk')}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const LandFeature: React.FC<LandFeatureProps> = ({ landStructure, plantings, dragHandlers, landManagement, splitNotification, clearSplitNotification, optimizeAllPlantings, optimizationResults, clearOptimizationResults, isOptimizing, setIsOptimizing }) => {
  const { handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd, dragPreview, draggedPlanting, smartSuggestions } = dragHandlers;
  const { addRegion, addRanch, updateRanch, deleteRanch, addLot, updateLot, deleteLot } = landManagement;
  
  const [showRanchForm, setShowRanchForm] = useState(false);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingRanch, setEditingRanch] = useState<Ranch | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedRanchId, setSelectedRanchId] = useState<number | null>(null);
  
  const [regionFormData, setRegionFormData] = useState({ name: '' });
  const [ranchFormData, setRanchFormData] = useState({ name: '' });
  const [lotFormData, setLotFormData] = useState({
    number: '', acres: '', soilType: 'Sandy Loam', lastCrop: '', lastPlantDate: '', microclimate: 'Moderate'
  });

  // NEW: Handle optimization
  const handleOptimizeAll = async () => {
    if (setIsOptimizing) {
      setIsOptimizing(true);
    }
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const results = optimizeAllPlantings();
      if (setIsOptimizing) {
        setIsOptimizing(false);
      }
    }, 1500);
  };

  const handleApplyOptimization = () => {
    // Results are already applied by optimizeAllPlantings
    clearOptimizationResults();
  };

  const handleAddRegion = () => {
    setRegionFormData({ name: '' });
    setShowRegionForm(true);
  };

  const handleSubmitRegion = () => {
    if (regionFormData.name) {
      addRegion(regionFormData.name);
      setRegionFormData({ name: '' });
      setShowRegionForm(false);
    }
  };

  const handleAddRanch = (regionId) => {
    setSelectedRegionId(regionId);
    setEditingRanch(null);
    setRanchFormData({ name: '' });
    setShowRanchForm(true);
  };

  const handleEditRanch = (regionId, ranch) => {
    setSelectedRegionId(regionId);
    setEditingRanch(ranch);
    setRanchFormData({ name: ranch.name });
    setShowRanchForm(true);
  };

  const handleSubmitRanch = () => {
    if (ranchFormData.name && selectedRegionId) {
      if (editingRanch) {
        updateRanch(selectedRegionId, editingRanch.id, ranchFormData);
      } else {
        addRanch(selectedRegionId, ranchFormData);
      }
      setShowRanchForm(false);
      setEditingRanch(null);
      setSelectedRegionId(null);
      setRanchFormData({ name: '' });
    }
  };

  const handleAddLot = (regionId, ranchId) => {
    setSelectedRegionId(regionId);
    setSelectedRanchId(ranchId);
    setEditingLot(null);
    setLotFormData({
      number: '', acres: '', soilType: 'Sandy Loam', lastCrop: '', lastPlantDate: '', microclimate: 'Moderate'
    });
    setShowLotForm(true);
  };

  const handleEditLot = (regionId, ranchId, lot) => {
    setSelectedRegionId(regionId);
    setSelectedRanchId(ranchId);
    setEditingLot(lot);
    setLotFormData({
      number: lot.number,
      acres: lot.acres.toString(),
      soilType: lot.soilType,
      lastCrop: lot.lastCrop,
      lastPlantDate: lot.lastPlantDate,
      microclimate: lot.microclimate
    });
    setShowLotForm(true);
  };

  const handleSubmitLot = () => {
    if (lotFormData.number && lotFormData.acres && selectedRegionId && selectedRanchId) {
      if (editingLot) {
        updateLot(selectedRegionId, selectedRanchId, editingLot.id, lotFormData);
      } else {
        addLot(selectedRegionId, selectedRanchId, lotFormData);
      }
      setShowLotForm(false);
      setEditingLot(null);
      setSelectedRegionId(null);
      setSelectedRanchId(null);
      setLotFormData({
        number: '', acres: '', soilType: 'Sandy Loam', lastCrop: '', lastPlantDate: '', microclimate: 'Moderate'
      });
    }
  };

  const soilTypes = ['Sandy Loam', 'Clay Loam', 'Sandy', 'Loam', 'Clay', 'Silt Loam'];
  const microclimates = ['Cool', 'Moderate', 'Warm', 'Hot'];

  const unassignedCount = plantings.filter(p => !p.assigned).length;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Smart Land Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleAddRegion}>Add Region</Button>
          {unassignedCount > 0 && (
            <Button 
              variant="success" 
              onClick={handleOptimizeAll}
              disabled={isOptimizing}
              className="relative"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  🤖 Optimize All ({unassignedCount})
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Enhanced Drag Preview */}
      <DragPreview preview={dragPreview} draggedPlanting={draggedPlanting} />
      
      {/* NEW: Smart Suggestions Overlay */}
      <SmartSuggestionsOverlay suggestions={smartSuggestions} draggedPlanting={draggedPlanting} />
      
      {/* Split Notification Modal */}
      <SplitNotificationModal 
        notification={splitNotification} 
        onClose={clearSplitNotification} 
      />
      
      {/* NEW: Optimization Results Modal */}
      <OptimizationResultsModal 
        results={optimizationResults}
        onClose={clearOptimizationResults}
        onApply={handleApplyOptimization}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Side - Enhanced Unassigned Plantings */}
        <div className="sm:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 sm:sticky sm:top-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium text-gray-900">🎯 Unassigned Plantings</h3>
              {unassignedCount > 0 && (
                <Button 
                  variant="warning" 
                  size="sm" 
                  onClick={handleOptimizeAll}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Brain size={12} />
                  )}
                  Auto-assign
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-[400px] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
              {plantings
                .filter(p => !p.assigned)
                .map(planting => (
                  <div
                    key={planting.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, planting)}
                    onDragEnd={handleDragEnd}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move hover:bg-yellow-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {planting.crop} - {planting.variety}
                      {planting.parentPlantingId && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded flex items-center gap-1">
                          <Scissors size={10} />
                          Split #{planting.splitSequence}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{planting.customer}</div>
                    <div className="text-sm text-gray-600">
                      {planting.volumeOrdered && planting.volumeOrdered.toLocaleString()} {planting.marketType === 'Fresh Cut' ? 'cartons' : 'lbs'} 
                      • <span className="font-medium">{planting.acres} acres</span> • Plant: {planting.wetDate}
                    </div>
                    {planting.originalOrderId && (
                      <div className="text-xs text-gray-600 mt-1">
                        Order: {planting.originalOrderId}
                      </div>
                    )}
                  </div>
                ))}
              {plantings.filter(p => !p.assigned).length === 0 && (
                <div className="p-4 text-center text-gray-600 border border-dashed border-gray-300 rounded-lg">
                  🎉 All plantings assigned! Use the "Generate Plantings" button to create more.
                </div>
              )}
            </div>
            
            {/* Enhanced Summary Stats */}
            {plantings.filter(p => !p.assigned).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Unassigned:</span>
                    <span className="font-medium">{plantings.filter(p => !p.assigned).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Acres:</span>
                    <span className="font-medium">
                      {plantings
                        .filter(p => !p.assigned)
                        .reduce((sum, p) => sum + parseFloat(p.acres), 0)
                        .toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Split Plantings:</span>
                    <span className="font-medium text-orange-600">
                      {plantings.filter(p => !p.assigned && p.parentPlantingId).length}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Try the "🤖 Optimize All" button for intelligent auto-assignment!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Land Structure */}
        <div className="sm:col-span-3">
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🗺️ Land Structure</h3>
            <div className="space-y-4">
              {landStructure.map(region => (
                <div key={region.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">📍 {region.region} Region</h4>
                    <Button variant="secondary" size="sm" onClick={() => handleAddRanch(region.id)}>
                      Add Ranch
                    </Button>
                  </div>
                  
                  {region.ranches.map(ranch => (
                    <div key={ranch.id} className="ml-4 mb-3 border border-gray-100 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-gray-700">🏠 {ranch.name}</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddLot(region.id, ranch.id)}
                            className="text-xs px-2 py-1 rounded transition-colors"
                            style={{ backgroundColor: '#0f3e62', color: 'white' }}
                          >
                            Add Lot
                          </button>
                          <button
                            onClick={() => handleEditRanch(region.id, ranch)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          {region.ranches.length > 1 && (
                            <button
                              onClick={() => deleteRanch(region.id, ranch.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {ranch.lots.map(lot => {
                        const capacity = capacityService.calculateLotCapacity(region.id, ranch.id, lot.id, landStructure, plantings);
                        
                        return (
                          <div
                            key={lot.id}
                            className={`ml-4 p-3 mb-2 border-2 border-dashed rounded-lg transition-colors ${
                              draggedPlanting ? (
                                capacityService.canFitInLot(draggedPlanting.acres, region.id, ranch.id, lot.id, landStructure, plantings).canFit
                                  ? 'border-green-400 bg-green-50' :
                                capacityService.canFitInLot(draggedPlanting.acres, region.id, ranch.id, lot.id, landStructure, plantings).willRequireSplit
                                  ? 'border-orange-400 bg-orange-50'
                                  : 'border-red-400 bg-red-50'
                              ) : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                            onDragOver={(e) => handleDragOver(e, region.id, ranch.id, lot.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, region.id, ranch.id, lot.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">📦 Lot {lot.number}</div>
                                <div className="text-sm text-gray-600">{lot.acres} acres • {lot.soilType}</div>
                                <div className="text-xs text-gray-600">Last: {lot.lastCrop} ({lot.lastPlantDate})</div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  lot.microclimate === 'Cool' ? 'bg-blue-100 text-blue-800' :
                                  lot.microclimate === 'Warm' ? 'bg-orange-100 text-orange-800' :
                                  lot.microclimate === 'Hot' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {lot.microclimate}
                                </span>
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleEditLot(region.id, ranch.id, lot)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                  {ranch.lots.length > 1 && (
                                    <button
                                      onClick={() => deleteLot(region.id, ranch.id, lot.id)}
                                      className="text-xs text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced Capacity Indicator */}
                            <LotCapacityIndicator capacity={capacity} />
                            
                            {/* Drop Zone Indicator */}
                            {capacity.plantingCount === 0 && (
                              <div className="mt-2 text-xs text-gray-600 italic">
                                Drop plantings here →
                              </div>
                            )}
                            
                            {/* Enhanced Assigned Plantings Display */}
                            {capacity.plantings.map(planting => (
                              <div key={planting.id} className="mt-2 p-2 rounded text-sm text-white" style={{ backgroundColor: '#0f3e62' }}>
                                <div className="font-medium flex items-center gap-2">
                                  {planting.crop} - {planting.variety}
                                  <span className="opacity-75">({planting.displayLotId})</span>
                                  {planting.parentPlantingId && (
                                    <span className="text-xs bg-blue-200 text-blue-800 px-1 py-0.5 rounded flex items-center gap-1">
                                      <Scissors size={8} />
                                      Split
                                    </span>
                                  )}
                                </div>
                                <div className="opacity-90">
                                  {planting.customer} • {planting.acres} acres • {planting.wetDate}
                                </div>
                                {planting.originalOrderId && (
                                  <div className="text-xs opacity-75">
                                    {planting.originalOrderId}
                                    {planting.splitTimestamp && (
                                      <span className="ml-2">
                                        (Split: {new Date(planting.splitTimestamp).toLocaleDateString()})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      
                      {ranch.lots.length === 0 && (
                        <div className="ml-4 p-4 text-center text-gray-600 border border-dashed border-gray-300 rounded-lg">
                          No lots in this ranch. Click "Add Lot" to get started.
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {region.ranches.length === 0 && (
                    <div className="ml-4 p-4 text-center text-gray-600 border border-dashed border-gray-300 rounded-lg">
                      No ranches in this region. Click "Add Ranch" to get started.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Region Form Modal */}
      <Modal
        isOpen={showRegionForm}
        onClose={() => { setShowRegionForm(false); setRegionFormData({ name: '' }); }}
        title="Add New Region"
        actions={[
          <Button key="cancel" variant="outline" onClick={() => { 
            setShowRegionForm(false); 
            setRegionFormData({ name: '' }); 
          }}>
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmitRegion}>
            Add Region
          </Button>
        ]}
      >
        <input
          type="text"
          placeholder="Region Name"
          value={regionFormData.name}
          onChange={(e) => setRegionFormData({ ...regionFormData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        />
      </Modal>

      {/* Ranch Form Modal */}
      <Modal
        isOpen={showRanchForm}
        onClose={() => { setShowRanchForm(false); setEditingRanch(null); setSelectedRegionId(null); }}
        title={editingRanch ? 'Edit Ranch' : 'Add New Ranch'}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => { 
            setShowRanchForm(false); 
            setEditingRanch(null); 
            setSelectedRegionId(null); 
          }}>
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmitRanch}>
            {editingRanch ? 'Update Ranch' : 'Add Ranch'}
          </Button>
        ]}
      >
        <input
          type="text"
          placeholder="Ranch Name"
          value={ranchFormData.name}
          onChange={(e) => setRanchFormData({ ...ranchFormData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        />
      </Modal>

      {/* Lot Form Modal */}
      <Modal
        isOpen={showLotForm}
        onClose={() => { 
          setShowLotForm(false); 
          setEditingLot(null); 
          setSelectedRegionId(null); 
          setSelectedRanchId(null); 
        }}
        title={editingLot ? 'Edit Lot' : 'Add New Lot'}
        actions={[
          <Button key="cancel" variant="outline" onClick={() => { 
            setShowLotForm(false); 
            setEditingLot(null); 
            setSelectedRegionId(null); 
            setSelectedRanchId(null); 
          }}>
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmitLot}>
            {editingLot ? 'Update Lot' : 'Add Lot'}
          </Button>
        ]}
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Lot Number"
            value={lotFormData.number}
            onChange={(e) => setLotFormData({ ...lotFormData, number: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Acres"
            value={lotFormData.acres}
            onChange={(e) => setLotFormData({ ...lotFormData, acres: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        
        <select
          value={lotFormData.soilType}
          onChange={(e) => setLotFormData({ ...lotFormData, soilType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        >
          {soilTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <select
          value={lotFormData.microclimate}
          onChange={(e) => setLotFormData({ ...lotFormData, microclimate: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        >
          {microclimates.map(climate => (
            <option key={climate} value={climate}>{climate}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Last Crop"
          value={lotFormData.lastCrop}
          onChange={(e) => setLotFormData({ ...lotFormData, lastCrop: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        />
        
        <input
          type="date"
          placeholder="Last Plant Date"
          value={lotFormData.lastPlantDate}
          onChange={(e) => setLotFormData({ ...lotFormData, lastPlantDate: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
        />
      </Modal>
    </div>
  );
};

const PlanningFeature = ({ plantings }) => {
  const stats = {
    total: plantings.length,
    assigned: plantings.filter(p => p.assigned).length,
    totalAcres: plantings.reduce((sum, p) => sum + parseFloat(p.acres), 0).toFixed(1),
    customers: [...new Set(plantings.map(p => p.customer))].length,
    splits: plantings.filter(p => p.parentPlantingId).length,
    splitOrders: [...new Set(plantings.filter(p => p.parentPlantingId).map(p => p.originalOrderId))].length,
    optimizationScore: plantings.filter(p => p.assigned).length > 0 ? 
      Math.round(plantings.filter(p => p.assigned).length / plantings.length * 100) : 0
  };

  const headers = ['Customer', 'Location', 'Crop & Variety', 'Acres', 'Plant Date', 'Harvest Date', 'Status', 'Order Info'];

  const renderRow = (planting) => (
    <tr key={planting.id} className={planting.assigned ? 'bg-blue-50' : 'bg-yellow-50'}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{planting.customer}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {planting.assigned ? planting.displayLotId : 'Unassigned'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>{planting.crop}</span>
          {planting.parentPlantingId && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded flex items-center gap-1">
              <Scissors size={10} />
              Split #{planting.splitSequence}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600">{planting.variety}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{planting.acres}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{planting.wetDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{planting.budgetedHarvestDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          planting.assigned ? 'text-white' : 'bg-yellow-100 text-yellow-800'
        }`}
        style={planting.assigned ? { backgroundColor: '#0f3e62' } : {}}
        >
          {planting.assigned ? 'Assigned' : 'Pending'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
        <div>{planting.originalOrderId}</div>
        {planting.splitTimestamp && (
          <div className="text-xs text-orange-600">
            Split: {new Date(planting.splitTimestamp).toLocaleDateString()}
          </div>
        )}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Smart Crop Planning Dashboard</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#0f3e62' }}>{stats.total}</div>
          <div className="text-sm text-gray-600">Total Plantings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>{stats.assigned}</div>
          <div className="text-sm text-gray-600">Assigned Plantings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#dc2626' }}>{stats.totalAcres}</div>
          <div className="text-sm text-gray-600">Total Acres</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{stats.customers}</div>
          <div className="text-sm text-gray-600">Customers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats.splits}</div>
          <div className="text-sm text-gray-600">Split Plantings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold" style={{ color: '#059669' }}>{stats.splitOrders}</div>
          <div className="text-sm text-gray-600">Split Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.optimizationScore}%</div>
            <Brain size={16} className="text-gray-600" />
          </div>
          <div className="text-sm text-gray-600">Completion</div>
        </div>
      </div>

      <DataTable headers={headers} data={plantings} renderRow={renderRow} />
      
      {stats.assigned < stats.total && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Target className="text-blue-600" size={16} />
            <span className="font-medium text-blue-900">Optimization Opportunity</span>
          </div>
          <div className="text-sm text-blue-700 mt-1">
            {stats.total - stats.assigned} plantings are still unassigned. 
            Try the "🤖 Optimize All" button in Land Management for intelligent auto-assignment!
          </div>
        </div>
      )}
    </div>
  );
};

const GanttFeature = ({ plantings, landStructure }) => {
  // Placeholder Gantt chart component - will be enhanced later
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {plantings.filter(p => p.assigned).length}
          </div>
          <div className="text-sm text-gray-600">Assigned Plantings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {plantings.reduce((sum, p) => sum + parseFloat(p.acres || 0), 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Total Acres</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{landStructure.length}</div>
          <div className="text-sm text-gray-600">Regions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {[...new Set(plantings.map(p => p.customer))].length}
          </div>
          <div className="text-sm text-gray-600">Customers</div>
        </div>
      </div>
    </div>
  );
};

const DataManagementFeature = () => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if any data exists
  const hasData = () => {
    if (typeof window === 'undefined') return false;
    return ['cropPlanning_orders', 'cropPlanning_commodities', 'cropPlanning_landStructure', 'cropPlanning_plantings']
      .some(key => localStorage.getItem(key) !== null);
  };

  const exportData = () => {
    try {
      const data = {
        orders: persistenceService.load('cropPlanning_orders', []),
        commodities: persistenceService.load('cropPlanning_commodities', []),
        landStructure: persistenceService.load('cropPlanning_landStructure', []),
        plantings: persistenceService.load('cropPlanning_plantings', []),
        activeTab: persistenceService.load('cropPlanning_activeTab', 'orders'),
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `crop-planning-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Export failed: ' + errorMessage);
    }
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') return;
        
        const data = JSON.parse(result);
        
        // Validate data structure
        if (!data.orders || !data.commodities || !data.landStructure) {
          throw new Error('Invalid backup file format');
        }

        // Import data
        persistenceService.save('cropPlanning_orders', data.orders);
        persistenceService.save('cropPlanning_commodities', data.commodities);
        persistenceService.save('cropPlanning_landStructure', data.landStructure);
        persistenceService.save('cropPlanning_plantings', data.plantings || []);
        
        if (data.activeTab) {
          persistenceService.save('cropPlanning_activeTab', data.activeTab);
        }

        alert('Data imported successfully! Please refresh the page to see changes.');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert('Import failed: ' + errorMessage);
      }
    };
    reader.readAsText(file);
    
    // Clear file input
    event.target.value = '';
  };

  const resetData = () => {
    persistenceService.clearAll();
    setShowResetConfirm(false);
    alert('All data has been reset! Please refresh the page to load default data.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Data Persistence Status</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Auto-Save Active</h3>
              <p className="text-sm text-green-700 mt-1">
                Your data is automatically saved to your browser's local storage as you work. 
                Changes to orders, commodities, land structure, and plantings are preserved between sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Saved Data</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {isClient ? (
                <>
                  <div>• Orders: {persistenceService.load('cropPlanning_orders', []).length} entries</div>
                  <div>• Commodities: {persistenceService.load('cropPlanning_commodities', []).length} types</div>
                  <div>• Land Areas: {persistenceService.load('cropPlanning_landStructure', []).length} regions</div>
                  <div>• Plantings: {persistenceService.load('cropPlanning_plantings', []).length} entries</div>
                </>
              ) : (
                <>
                  <div>• Orders: Loading...</div>
                  <div>• Commodities: Loading...</div>
                  <div>• Land Areas: Loading...</div>
                  <div>• Plantings: Loading...</div>
                </>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Browser Storage</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Storage Type: localStorage</div>
              <div>Status: {isClient ? (hasData() ? 'Active' : 'Empty') : 'Loading...'}</div>
              <div>Auto-backup: Enabled</div>
              {lastBackup && <div>Last Export: {lastBackup}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Data Management Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📤 Export Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Download all your data as a JSON backup file.
            </p>
            <Button onClick={exportData} className="w-full">
              <Download size={16} />
              Export Backup
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📥 Import Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Restore data from a previously exported backup file.
            </p>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <Button variant="secondary" className="w-full cursor-pointer">
                Select Backup File
              </Button>
            </label>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🔄 Reset Data</h4>
            <p className="text-sm text-gray-600 mb-3">
              Clear all saved data and return to defaults.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => setShowResetConfirm(true)}
              className="w-full"
            >
              <AlertTriangle size={16} />
              Reset All Data
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Data Persistence Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your data is saved automatically as you work - no manual saving required</li>
          <li>• Data persists between browser sessions and page refreshes</li>
          <li>• Export regular backups to protect against browser data loss</li>
          <li>• Use import/export to transfer data between different browsers or computers</li>
          <li>• Clearing browser data will remove all saved information</li>
        </ul>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Confirm Data Reset</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset all data? This will permanently delete:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• All orders and customer data</li>
              <li>• Commodity and variety configurations</li>
              <li>• Land structure and lot information</li>
              <li>• Generated plantings and assignments</li>
            </ul>
            <p className="text-sm text-red-600 mb-6 font-medium">
              This action cannot be undone. Consider exporting a backup first.
            </p>
            <div className="flex space-x-3">
              <Button 
                variant="destructive" 
                onClick={resetData}
                className="flex-1"
              >
                Yes, Reset All Data
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MAIN APPLICATION - Orchestration Layer
// =============================================================================

const CropPlanningApp = () => {
  // Initialize active tab with saved data or default
  const [activeTab, setActiveTab] = useState(() => {
    return persistenceService.load('cropPlanning_activeTab', 'orders');
  });

  // Auto-save active tab when it changes
  useEffect(() => {
    persistenceService.save('cropPlanning_activeTab', activeTab);
  }, [activeTab]);
  
  // Custom hooks for state management
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();
  const { commodities, addVariety, updateVariety, deleteVariety } = useCommodities();
  const { landStructure, addRegion, addRanch, updateRanch, deleteRanch, addLot, updateLot, deleteLot, findLot } = useLandManagement();
  const { plantings, generatePlantings, assignPlantingToLot, optimizeAllPlantings } = usePlantings(orders, commodities, landStructure);
  
  // Split notification management
  const { splitNotification, showSplitNotification, clearSplitNotification } = useSplitNotifications();
  
  // NEW: Optimization state management
  const { optimizationResults, isOptimizing, setIsOptimizing, showOptimizationResults, clearOptimizationResults } = useOptimizationResults();
  
  // Enhanced drag and drop with smart suggestions
  const dragHandlers = useDragAndDrop(assignPlantingToLot, findLot, landStructure, plantings, showSplitNotification);

  // Enhanced optimization function with results handling
  const handleOptimizeAllPlantings = () => {
    return optimizeAllPlantings(showSplitNotification, (results) => {
      showOptimizationResults(results);
    });
  };

  // Land management functions
  const landManagementFunctions = {
    addRegion,
    addRanch,
    updateRanch, 
    deleteRanch,
    addLot,
    updateLot,
    deleteLot
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dynamic Crop Planning System
            </h1>
            <div className="flex gap-2">
              <Button onClick={generatePlantings}>
                <Calendar size={16} />
                Generate Plantings
              </Button>
              <Button variant="secondary" onClick={() => csvService.exportPlantings(plantings)}>
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'orders' && (
          <OrdersFeature 
            orders={orders}
            onAddOrder={addOrder}
            onUpdateOrder={updateOrder}
            onDeleteOrder={deleteOrder}
            commodities={commodities}
          />
        )}
        
        {activeTab === 'commodities' && (
          <CommoditiesFeature 
            commodities={commodities}
            onAddVariety={addVariety}
            onUpdateVariety={updateVariety}
            onDeleteVariety={deleteVariety}
          />
        )}
        
        {activeTab === 'land' && (
          <LandFeature 
            landStructure={landStructure}
            plantings={plantings}
            dragHandlers={dragHandlers}
            landManagement={landManagementFunctions}
            splitNotification={splitNotification}
            clearSplitNotification={clearSplitNotification}
            optimizeAllPlantings={handleOptimizeAllPlantings}
            optimizationResults={optimizationResults}
            clearOptimizationResults={clearOptimizationResults}
            isOptimizing={isOptimizing}
            setIsOptimizing={setIsOptimizing}
          />
        )}
        
        {activeTab === 'gantt' && (
          <GanttFeature 
            plantings={plantings}
            landStructure={landStructure}
          />
        )}
        
        {activeTab === 'planning' && (
          <PlanningFeature plantings={plantings} />
        )}
        
        {activeTab === 'data' && (
          <DataManagementFeature />
        )}
      </main>
    </div>
  );
};

export default CropPlanningApp;