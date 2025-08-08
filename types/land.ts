// =============================================================================
// LAND MANAGEMENT TYPES - Land structure and management types
// =============================================================================

export interface Lot {
  id: number;
  number: string;
  acres: number;
  soilType: string;
  lastCrop?: string;
  lastPlantDate?: string;
  microclimate: string;
}

export interface Ranch {
  id: number;
  name: string;
  lots: Lot[];
}

export interface Region {
  id: number;
  region: string;
  ranches: Ranch[];
}

export interface LotFormData {
  number: string;
  acres: string | number;
  soilType: string;
  lastCrop: string;
  lastPlantDate: string;
  microclimate: string;
}

export interface RanchFormData {
  name: string;
}

export interface RegionFormData {
  name: string;
}

export interface LandStructureState {
  regions: Region[];
  loading: boolean;
  error: string | null;
}

export interface LandManagementActions {
  addRegion: (regionData: Partial<Region>) => void;
  updateRegion: (regionId: number, regionData: Partial<Region>) => void;
  deleteRegion: (regionId: number) => void;
  addRanch: (regionId: number, ranchData: Partial<Ranch>) => void;
  updateRanch: (regionId: number, ranchId: number, ranchData: Partial<Ranch>) => void;
  deleteRanch: (regionId: number, ranchId: number) => void;
  addLot: (regionId: number, ranchId: number, lotData: Partial<Lot>) => void;
  updateLot: (regionId: number, ranchId: number, lotId: number, lotData: Partial<Lot>) => void;
  deleteLot: (regionId: number, ranchId: number, lotId: number) => void;
  findLot: (regionId: number, ranchId: number, lotId: number) => Lot | undefined;
}

export interface DragAndDropHandlers {
  handleDragStart: (e: React.DragEvent, planting: any) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, regionId: number, ranchId: number, lotId: number) => void;
  dragPreview: any;
  draggedPlanting: any;
  smartSuggestions: any[];
}
