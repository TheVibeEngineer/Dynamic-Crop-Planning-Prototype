// =============================================================================
// COMMON TYPES - Shared across the application
// =============================================================================

export interface CropRotationRules {
  rotationConflicts: { [crop: string]: string[] };
  minimumRotationDays: { [crop: string]: number };
}

export interface CapacityInfo {
  totalAcres: number;
  usedAcres: number;
  availableAcres: number;
  plantingCount: number;
  plantings: any[]; // Will be typed as Planting[] when imported
}

export interface SplitNotification {
  plantingId: string;
  crop: string;
  variety: string;
  originalAcres: number;
  assignedAcres: number;
  remainingAcres: number;
  lotLocation: string;
}

export interface OptimizationResult {
  plantingId: string;
  crop: string;
  variety: string;
  acres: number;
  recommendedLot: {
    regionId: number;
    ranchId: number;
    lotId: number;
    sublot: string;
    location: string;
  };
  score: number;
  reasons: string[];
}

export interface OptimizationResults {
  assignments: OptimizationResult[];
  summary: {
    totalPlantings: number;
    successfulAssignments: number;
    totalAcresOptimized: number;
    averageScore: number;
  };
}

export interface DragPreview {
  x: number;
  y: number;
  planting: any; // Will be typed as Planting when imported
}

export interface SmartSuggestion {
  lotId: string;
  score: number;
  reasons: string[];
  location: string;
  region?: any;
  ranch?: any;
  lot?: any;
  capacity?: any;
  fitType?: 'perfect' | 'split' | 'none';
}

export interface DragAndDropHandlers {
  draggedPlanting: any;
  dragPreview: DragPreview | null;
  smartSuggestions: SmartSuggestion[];
  handleDragStart: (e: React.DragEvent, planting: any) => void;
  handleDragOver: (e: React.DragEvent, regionId: number, ranchId: number, lotId: number) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, regionId: number, ranchId: number, lotId: number) => void;
  handleDropOnUnassigned: (e: React.DragEvent) => void;
}
