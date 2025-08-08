// =============================================================================
// CONSTANTS - Application-wide constants and configuration
// =============================================================================

export const STORAGE_KEYS = {
  ORDERS: 'cropPlanning_orders',
  COMMODITIES: 'cropPlanning_commodities',
  LAND_STRUCTURE: 'cropPlanning_landStructure',
  PLANTINGS: 'cropPlanning_plantings',
  ACTIVE_TAB: 'cropPlanning_activeTab'
} as const;

export const MARKET_TYPES = [
  'Fresh Cut',
  'Bulk',
  'Processing',
  'Organic',
  'Baby Leaf'
] as const;

export const SOIL_TYPES = [
  'Sandy Loam',
  'Clay Loam',
  'Silt Loam',
  'Sandy Clay',
  'Silty Clay',
  'Clay'
] as const;

export const MICROCLIMATES = [
  'Coastal',
  'Desert',
  'Mountain',
  'Valley',
  'Moderate'
] as const;

export const PLANT_TYPES = [
  'Direct Seed',
  'Transplant',
  'Both'
] as const;

export const BED_SIZES = [
  '38-2',
  '40"',
  '60"',
  '80"',
  'Bed-less'
] as const;

export const SPACING_OPTIONS = [
  '2"x2"',
  '4"x4"',
  '6"x6"',
  '8"x8"',
  '12"x12"',
  'Variable'
] as const;

export const CROP_ROTATION_RULES = {
  rotationConflicts: {
    'Lettuce': ['Lettuce', 'Spinach'],
    'Spinach': ['Lettuce', 'Spinach'],
    'Carrots': ['Carrots'],
    'Broccoli': ['Broccoli', 'Cauliflower', 'Cabbage'],
    'Cauliflower': ['Broccoli', 'Cauliflower', 'Cabbage'],
    'Cabbage': ['Broccoli', 'Cauliflower', 'Cabbage']
  },
  minimumRotationDays: {
    'Lettuce': 60,
    'Spinach': 45,
    'Carrots': 90,
    'Broccoli': 120,
    'Cauliflower': 120,
    'Cabbage': 120
  }
} as const;

export const APP_CONFIG = {
  MAX_ACRES_PER_LOT: 1000,
  MAX_LOTS_PER_RANCH: 50,
  MAX_RANCHES_PER_REGION: 20,
  DEFAULT_YIELD_BUFFER: 0.1, // 10% buffer for yield calculations
  OPTIMIZATION_TIMEOUT: 30000, // 30 seconds
  DRAG_PREVIEW_OFFSET: { x: 10, y: 10 }
} as const;
