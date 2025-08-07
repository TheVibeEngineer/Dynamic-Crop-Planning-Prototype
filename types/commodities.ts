// =============================================================================
// COMMODITY TYPES - Commodity and variety type definitions
// =============================================================================

/**
 * Variety within a commodity
 */
export interface Variety {
  id: number;
  name: string;
  growingWindow: { start: string; end: string };
  daysToHarvest: number; // Days to harvest for this variety
  budgetYieldPerAcre: Record<string, number>; // Market type -> yield
  bedSize: string;
  spacing: string;
  plantType: string;
  idealStand: number;
  marketTypes: string[];
  preferences: Record<string, number>;
}

/**
 * Commodity with multiple varieties
 */
export interface Commodity {
  id: number;
  name: string;
  varieties: Variety[];
}

/**
 * Actions for managing commodities
 */
export interface CommoditiesActions {
  addVariety: (commodityName: string, varietyData: Partial<Variety>) => void;
  updateVariety: (commodityName: string, varietyId: number, varietyData: Partial<Variety>) => void;
  deleteVariety: (commodityName: string, varietyId: number) => void;
}
