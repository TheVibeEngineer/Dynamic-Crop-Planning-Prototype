// =============================================================================
// CAPACITY SERVICE TEST SUITE
// =============================================================================

import { capacityService } from '../../../lib/services/capacity';
import type { Region, Planting, CapacityInfo } from '../../../types';

describe('Capacity Service', () => {
  // Mock data
  const mockLandStructure: Region[] = [
    {
      id: 1,
      region: 'North Valley',
      ranches: [
        {
          id: 1,
          name: 'Test Ranch',
          lots: [
            {
              id: 1,
              number: '101',
              acres: 10,
              soilType: 'Clay Loam',
              microclimate: 'Mild'
            },
            {
              id: 2,
              number: '102',
              acres: 5,
              soilType: 'Sandy Loam',
              microclimate: 'Cool'
            }
          ]
        },
        {
          id: 2,
          name: 'Secondary Ranch',
          lots: [
            {
              id: 3,
              number: '201',
              acres: 15,
              soilType: 'Loam',
              microclimate: 'Warm'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      region: 'South Valley',
      ranches: [
        {
          id: 3,
          name: 'Valley Ranch',
          lots: [
            {
              id: 4,
              number: '301',
              acres: 20,
              soilType: 'Clay',
              microclimate: 'Hot'
            }
          ]
        }
      ]
    }
  ];

  const mockPlantings: Planting[] = [
    {
      id: 'planting_1',
      crop: 'Romaine',
      variety: 'Green Forest',
      acres: 3,
      plantDate: '2024-03-01',
      harvestDate: '2024-05-15',
      marketType: 'Fresh Cut',
      customer: 'Customer A',
      assigned: true,
      region: 'North Valley',
      ranch: 'Test Ranch',
      lot: '101',
      sublot: 'A',
      uniqueLotId: '1-1-1',
      originalOrderId: '1'
    },
    {
      id: 'planting_2',
      crop: 'Iceberg',
      variety: 'Iceberg Standard',
      acres: 2.5,
      plantDate: '2024-03-15',
      harvestDate: '2024-06-01',
      marketType: 'Fresh Cut',
      customer: 'Customer B',
      assigned: true,
      region: 'North Valley',
      ranch: 'Test Ranch',
      lot: '101',
      sublot: 'B',
      uniqueLotId: '1-1-1',
      originalOrderId: '2'
    },
    {
      id: 'planting_3',
      crop: 'Carrots',
      variety: 'Nantes',
      acres: 4,
      plantDate: '2024-04-01',
      harvestDate: '2024-07-15',
      marketType: 'Processing',
      customer: 'Customer C',
      assigned: true,
      region: 'North Valley',
      ranch: 'Secondary Ranch',
      lot: '201',
      sublot: 'A',
      uniqueLotId: '1-2-3',
      originalOrderId: '3'
    },
    {
      id: 'planting_4',
      crop: 'Spinach',
      variety: 'Baby Spinach',
      acres: 1.5,
      plantDate: '2024-02-15',
      harvestDate: '2024-04-15',
      marketType: 'Fresh Cut',
      customer: 'Customer D',
      assigned: false, // Unassigned planting
      originalOrderId: '4'
    }
  ];

  describe('calculateLotCapacity', () => {
    it('should calculate capacity correctly for lot with plantings', () => {
      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1, // Region 1, Ranch 1, Lot 1
        mockLandStructure,
        mockPlantings
      );

      const expectedCapacity: CapacityInfo = {
        totalAcres: 10,
        usedAcres: 5.5, // 3 + 2.5 from the two assigned plantings
        availableAcres: 4.5, // 10 - 5.5
        plantingCount: 2,
        plantings: expect.arrayContaining([
          expect.objectContaining({ id: 'planting_1' }),
          expect.objectContaining({ id: 'planting_2' })
        ])
      };

      expect(capacity).toEqual(expectedCapacity);
    });

    it('should calculate capacity correctly for empty lot', () => {
      const capacity = capacityService.calculateLotCapacity(
        1, 1, 2, // Region 1, Ranch 1, Lot 2 (empty)
        mockLandStructure,
        mockPlantings
      );

      const expectedCapacity: CapacityInfo = {
        totalAcres: 5,
        usedAcres: 0,
        availableAcres: 5,
        plantingCount: 0,
        plantings: []
      };

      expect(capacity).toEqual(expectedCapacity);
    });

    it('should calculate capacity correctly for lot with single planting', () => {
      const capacity = capacityService.calculateLotCapacity(
        1, 2, 3, // Region 1, Ranch 2, Lot 3
        mockLandStructure,
        mockPlantings
      );

      const expectedCapacity: CapacityInfo = {
        totalAcres: 15,
        usedAcres: 4, // Only planting_3
        availableAcres: 11,
        plantingCount: 1,
        plantings: [expect.objectContaining({ id: 'planting_3' })]
      };

      expect(capacity).toEqual(expectedCapacity);
    });

    it('should handle non-existent lot', () => {
      const capacity = capacityService.calculateLotCapacity(
        999, 999, 999, // Non-existent lot
        mockLandStructure,
        mockPlantings
      );

      const expectedCapacity: CapacityInfo = {
        totalAcres: 0,
        usedAcres: 0,
        availableAcres: 0,
        plantingCount: 0,
        plantings: []
      };

      expect(capacity).toEqual(expectedCapacity);
    });

    it('should ignore unassigned plantings', () => {
      // Create a planting that is unassigned but has a uniqueLotId
      const plantingsWithUnassigned = [
        ...mockPlantings,
        {
          ...mockPlantings[0],
          id: 'unassigned_planting',
          assigned: false,
          uniqueLotId: '1-1-1' // Same lot as assigned plantings
        }
      ];

      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        plantingsWithUnassigned
      );

      // Should not count the unassigned planting
      expect(capacity.usedAcres).toBe(5.5);
      expect(capacity.plantingCount).toBe(2);
    });

    it('should round used and available acres to 2 decimal places', () => {
      const plantingsWithDecimals = [
        {
          ...mockPlantings[0],
          acres: 3.333333,
          uniqueLotId: '1-1-1'
        },
        {
          ...mockPlantings[1],
          acres: 2.666667,
          uniqueLotId: '1-1-1'
        }
      ];

      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        plantingsWithDecimals
      );

      expect(capacity.usedAcres).toBe(6); // 3.33 + 2.67 = 6.00 (rounded)
      expect(capacity.availableAcres).toBe(4); // 10 - 6 = 4.00
    });

    it('should handle lot with exact capacity usage', () => {
      const fullLotPlantings = [
        {
          ...mockPlantings[0],
          acres: 10, // Exactly the lot capacity
          uniqueLotId: '1-1-1'
        }
      ];

      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        fullLotPlantings
      );

      expect(capacity.usedAcres).toBe(10);
      expect(capacity.availableAcres).toBe(0);
    });

    it('should handle lot over capacity', () => {
      const overCapacityPlantings = [
        {
          ...mockPlantings[0],
          acres: 12, // Over the lot capacity of 10
          uniqueLotId: '1-1-1'
        }
      ];

      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        overCapacityPlantings
      );

      expect(capacity.usedAcres).toBe(12);
      expect(capacity.availableAcres).toBe(0); // Math.max(0, 10 - 12) = 0
    });
  });

  describe('getNextSublotDesignation', () => {
    it('should return A for empty lot', () => {
      const sublot = capacityService.getNextSublotDesignation(
        1, 1, 2, // Empty lot
        mockPlantings
      );

      expect(sublot).toBe('A');
    });

    it('should return next available letter', () => {
      const sublot = capacityService.getNextSublotDesignation(
        1, 1, 1, // Lot with sublots A and B taken
        mockPlantings
      );

      expect(sublot).toBe('C');
    });

    it('should handle non-sequential sublots', () => {
      const plantingsWithGaps = [
        {
          ...mockPlantings[0],
          sublot: 'A',
          uniqueLotId: '1-1-1'
        },
        {
          ...mockPlantings[1],
          sublot: 'C', // Skip B
          uniqueLotId: '1-1-1'
        }
      ];

      const sublot = capacityService.getNextSublotDesignation(
        1, 1, 1,
        plantingsWithGaps
      );

      expect(sublot).toBe('B'); // Should fill the gap
    });

    it('should ignore unassigned plantings', () => {
      const plantingsWithUnassigned = [
        {
          ...mockPlantings[0],
          sublot: 'A',
          assigned: true,
          uniqueLotId: '1-1-1'
        },
        {
          ...mockPlantings[1],
          sublot: 'B',
          assigned: false, // Unassigned
          uniqueLotId: '1-1-1'
        }
      ];

      const sublot = capacityService.getNextSublotDesignation(
        1, 1, 1,
        plantingsWithUnassigned
      );

      expect(sublot).toBe('B'); // Should ignore unassigned B and return B
    });

    it('should ignore plantings with no sublot', () => {
      const plantingsWithoutSublot = [
        {
          ...mockPlantings[0],
          sublot: 'A',
          uniqueLotId: '1-1-1'
        },
        {
          ...mockPlantings[1],
          sublot: undefined, // No sublot
          uniqueLotId: '1-1-1'
        }
      ];

      const sublot = capacityService.getNextSublotDesignation(
        1, 1, 1,
        plantingsWithoutSublot
      );

      expect(sublot).toBe('B');
    });

    it('should handle all letters taken and return A', () => {
      const allLettersPlantings = Array.from({ length: 26 }, (_, i) => ({
        ...mockPlantings[0],
        id: `planting_${i}`,
        sublot: String.fromCharCode(65 + i), // A through Z
        uniqueLotId: '1-1-1',
        assigned: true
      }));

      const sublot = capacityService.getNextSublotDesignation(
        1, 1, 1,
        allLettersPlantings
      );

      expect(sublot).toBe('A'); // Default when all are taken
    });

    it('should handle different lot correctly', () => {
      const sublot = capacityService.getNextSublotDesignation(
        1, 2, 3, // Different lot with one planting
        mockPlantings
      );

      expect(sublot).toBe('B'); // Planting 3 has sublot A, so next is B
    });
  });

  describe('canFitInLot', () => {
    it('should return true when planting fits in available space', () => {
      const canFit = capacityService.canFitInLot(
        4, // 4 acres
        1, 1, 1, // Lot with 4.5 available acres
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(true);
    });

    it('should return true when planting exactly fits available space', () => {
      const canFit = capacityService.canFitInLot(
        4.5, // Exactly available space
        1, 1, 1,
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(true);
    });

    it('should return false when planting exceeds available space', () => {
      const canFit = capacityService.canFitInLot(
        5, // More than 4.5 available acres
        1, 1, 1,
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(false);
    });

    it('should return true for empty lot with sufficient space', () => {
      const canFit = capacityService.canFitInLot(
        3, // 3 acres
        1, 1, 2, // Empty lot with 5 acres
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(true);
    });

    it('should return false for empty lot with insufficient space', () => {
      const canFit = capacityService.canFitInLot(
        6, // 6 acres
        1, 1, 2, // Empty lot with only 5 acres
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(false);
    });

    it('should return false for non-existent lot', () => {
      const canFit = capacityService.canFitInLot(
        1, // Any amount
        999, 999, 999, // Non-existent lot
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(false);
    });

    it('should handle zero acres planting', () => {
      const canFit = capacityService.canFitInLot(
        0, // Zero acres
        1, 1, 1,
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(true); // Zero acres should always fit
    });

    it('should handle negative acres planting', () => {
      const canFit = capacityService.canFitInLot(
        -1, // Negative acres (edge case)
        1, 1, 1,
        mockLandStructure,
        mockPlantings
      );

      expect(canFit).toBe(true); // Negative is less than or equal to available
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete lot management workflow', () => {
      const regionId = 1, ranchId = 1, lotId = 1;
      
      // Check initial capacity
      const initialCapacity = capacityService.calculateLotCapacity(
        regionId, ranchId, lotId,
        mockLandStructure,
        mockPlantings
      );
      
      expect(initialCapacity.availableAcres).toBe(4.5);
      
      // Check if we can fit a new planting
      const canFitNew = capacityService.canFitInLot(
        3, regionId, ranchId, lotId,
        mockLandStructure,
        mockPlantings
      );
      
      expect(canFitNew).toBe(true);
      
      // Get next sublot designation
      const nextSublot = capacityService.getNextSublotDesignation(
        regionId, ranchId, lotId,
        mockPlantings
      );
      
      expect(nextSublot).toBe('C');
    });

    it('should handle edge case with very small acres', () => {
      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        [
          {
            ...mockPlantings[0],
            acres: 0.001, // Very small
            uniqueLotId: '1-1-1'
          }
        ]
      );

      expect(capacity.usedAcres).toBe(0); // Should round to 0
      expect(capacity.availableAcres).toBe(10);
    });

    it('should handle empty land structure', () => {
      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        [], // Empty land structure
        mockPlantings
      );

      expect(capacity).toEqual({
        totalAcres: 0,
        usedAcres: 0,
        availableAcres: 0,
        plantingCount: 0,
        plantings: []
      });
    });

    it('should handle empty plantings array', () => {
      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        [] // No plantings
      );

      expect(capacity).toEqual({
        totalAcres: 10,
        usedAcres: 0,
        availableAcres: 10,
        plantingCount: 0,
        plantings: []
      });
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed uniqueLotId in plantings', () => {
      const malformedPlantings = [
        {
          ...mockPlantings[0],
          uniqueLotId: 'invalid-format', // Should not match any lot
          assigned: true
        }
      ];

      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        malformedPlantings
      );

      expect(capacity.usedAcres).toBe(0);
      expect(capacity.plantingCount).toBe(0);
    });

    it('should handle null/undefined values gracefully', () => {
      expect(() => {
        capacityService.calculateLotCapacity(
          1, 1, 1,
          mockLandStructure,
          null as any
        );
      }).toThrow();

      expect(() => {
        capacityService.calculateLotCapacity(
          1, 1, 1,
          null as any,
          mockPlantings
        );
      }).toThrow();
    });

    it('should handle very large numbers', () => {
      const largePlantings = [
        {
          ...mockPlantings[0],
          acres: 999999.999999,
          uniqueLotId: '1-1-1'
        }
      ];

      const capacity = capacityService.calculateLotCapacity(
        1, 1, 1,
        mockLandStructure,
        largePlantings
      );

      expect(capacity.usedAcres).toBe(1000000); // Should round properly
      expect(capacity.availableAcres).toBe(0);
    });
  });
});
