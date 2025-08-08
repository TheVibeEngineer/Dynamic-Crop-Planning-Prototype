// =============================================================================
// PLANNING TYPES - Crop planning and planting related types
// =============================================================================

export interface Planting {
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

export interface PlantingFormData {
  crop: string;
  variety: string;
  acres: string | number;
  plantDate: string;
  harvestDate: string;
  marketType: string;
  customer: string;
}

export interface PlantingsState {
  plantings: Planting[];
  loading: boolean;
  error: string | null;
}

export interface PlantingsActions {
  generatePlantings: () => void;
  assignPlantingToLot: (plantingId: string, regionId: number, ranchId: number, lotId: number, onSplitNotification?: (notification: any) => void) => any;
  unassignPlanting: (plantingId: string) => any;
  optimizeAllPlantings: (onSplit?: (notification: any) => void, onResults?: (results: any) => void) => any;
}

export interface GanttTimelineItem {
  id: string;
  name: string;
  start: Date;
  end: Date;
  crop: string;
  variety: string;
  acres: number;
  location?: string;
}

export interface PlanningMetrics {
  totalPlantings: number;
  totalAcres: number;
  assignedPlantings: number;
  unassignedPlantings: number;
  utilizationRate: number;
}

// SplitNotification interface moved to common.ts to avoid duplicates

// OptimizationResults interface moved to common.ts to avoid duplicates

