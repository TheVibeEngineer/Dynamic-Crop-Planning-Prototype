// =============================================================================
// DATE UTILITIES - Date calculation and formatting functions
// =============================================================================

/**
 * Calculate harvest date based on plant date and days to harvest
 */
export const calculateHarvestDate = (plantDate: string, daysToHarvest: number): string => {
  const plant = new Date(plantDate);
  const harvest = new Date(plant.getTime() + (daysToHarvest * 24 * 60 * 60 * 1000));
  return harvest.toISOString().split('T')[0];
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
