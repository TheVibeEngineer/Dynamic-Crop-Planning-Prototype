// =============================================================================
// VALIDATION UTILITIES - Data validation functions
// =============================================================================

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value: any): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

/**
 * Validate acres value
 */
export const isValidAcres = (acres: any): boolean => {
  const num = parseFloat(acres);
  return !isNaN(num) && num > 0 && num <= 10000; // Reasonable upper limit
};

/**
 * Validate lot number format
 */
export const isValidLotNumber = (lotNumber: string): boolean => {
  return lotNumber.trim().length > 0 && lotNumber.length <= 20;
};
