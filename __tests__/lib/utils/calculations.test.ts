// =============================================================================
// CALCULATIONS UTILITIES TEST SUITE
// =============================================================================

import {
  calculateTotalYield,
  calculateAcresNeeded,
  roundToDecimals,
  calculatePercentage,
  calculateUtilizationRate,
  formatNumber,
  formatCurrency
} from '../../../lib/utils/calculations';

describe('Calculation Utilities', () => {
  describe('calculateTotalYield', () => {
    it('should calculate total yield correctly', () => {
      expect(calculateTotalYield(5, 100)).toBe(500);
      expect(calculateTotalYield(2.5, 80)).toBe(200);
      expect(calculateTotalYield(0, 100)).toBe(0);
    });

    it('should handle decimal inputs', () => {
      expect(calculateTotalYield(3.33, 150)).toBe(500);
      expect(calculateTotalYield(1.5, 66.67)).toBe(100);
    });
  });

  describe('calculateAcresNeeded', () => {
    it('should calculate acres needed correctly', () => {
      expect(calculateAcresNeeded(1000, 200)).toBe(5);
      expect(calculateAcresNeeded(500, 100)).toBe(5);
      expect(calculateAcresNeeded(333, 100)).toBe(3.33);
    });

    it('should handle zero yield per acre', () => {
      expect(calculateAcresNeeded(1000, 0)).toBe(0);
    });

    it('should handle negative yield per acre', () => {
      expect(calculateAcresNeeded(1000, -100)).toBe(0);
    });
  });

  describe('roundToDecimals', () => {
    it('should round to 2 decimal places by default', () => {
      expect(roundToDecimals(3.14159)).toBe(3.14);
      expect(roundToDecimals(2.999)).toBe(3);
    });

    it('should round to specified decimal places', () => {
      expect(roundToDecimals(3.14159, 3)).toBe(3.142);
      expect(roundToDecimals(3.14159, 1)).toBe(3.1);
      expect(roundToDecimals(3.14159, 0)).toBe(3);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(3, 4)).toBe(75);
      expect(calculatePercentage(1, 3)).toBe(33);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(25, 0)).toBe(0);
    });

    it('should handle zero part', () => {
      expect(calculatePercentage(0, 100)).toBe(0);
    });
  });

  describe('calculateUtilizationRate', () => {
    it('should calculate utilization rate (same as percentage)', () => {
      expect(calculateUtilizationRate(80, 100)).toBe(80);
      expect(calculateUtilizationRate(150, 200)).toBe(75);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(500)).toBe('500');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(999999.99)).toBe('$999,999.99');
    });
  });
});
