// =============================================================================
// CALCULATION UTILITIES - Mathematical and business calculation functions
// =============================================================================

/**
 * Calculate total yield based on acres and yield per acre
 */
export const calculateTotalYield = (acres: number, yieldPerAcre: number): number => {
  return Math.round(acres * yieldPerAcre);
};

/**
 * Calculate acres needed based on volume and yield per acre
 */
export const calculateAcresNeeded = (volumeNeeded: number, yieldPerAcre: number): number => {
  if (yieldPerAcre <= 0) return 0;
  return Math.round((volumeNeeded / yieldPerAcre) * 100) / 100;
};

/**
 * Round to specified decimal places
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

/**
 * Calculate utilization rate
 */
export const calculateUtilizationRate = (used: number, total: number): number => {
  return calculatePercentage(used, total);
};

/**
 * Format number with commas
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Format currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};
