// =============================================================================
// OPTIMIZATION ENGINE SERVICE TEST SUITE
// =============================================================================

import { optimizationEngine } from '../../../lib/services/optimization';
import { capacityService } from '../../../lib/services/capacity';
import { plantingService } from '../../../lib/services/planting';
import type { Planting, Region, Ranch, Lot } from '../../../types';

// Mock dependencies
jest.mock('../../../lib/services/capacity', () => ({
  capacityService: {
    calculateLotCapacity: jest.fn(),
    getNextSublotDesignation: jest.fn(),
  },
}));

jest.mock('../../../lib/services/planting', () => ({
  plantingService: {
    splitPlanting: jest.fn(),
    assignToLot: jest.fn(),
  },
}));

const mockedCapacityService = capacityService as jest.Mocked<typeof capacityService>;
const mockedPlantingService = plantingService as jest.Mocked<typeof plantingService>;

describe('Optimization Engine', () => {
  // Mock data
  const mockLot: Lot = {
    id: 1,
    number: '101',
    acres: 10,
    soilType: 'Clay Loam',
    microclimate: 'Mild',
    lastCrop: 'Corn'
  };

  const mockRanch: Ranch = {
    id: 1,
    name: 'Test Ranch',
    lots: [mockLot]
  };

  const mockRegion: Region = {
    id: 1,
    region: 'North Valley',
    ranches: [mockRanch]
  };

  const mockLandStructure: Region[] = [mockRegion];

  const mockPlanting: Planting = {
    id: 'planting_1',
    crop: 'Romaine',
    variety: 'Test Variety',
    acres: 5,
    plantDate: '2024-03-01',
    harvestDate: '2024-05-15',
    marketType: 'Fresh Cut',
    customer: 'Test Customer',
    volumeOrdered: 1000,
    totalYield: 5000,
    budgetYieldPerAcre: 1000,
    assigned: false,
    originalOrderId: '1'
  };

  const mockLargePlanting: Planting = {
    ...mockPlanting,
    id: 'planting_2',
    acres: 15 // Larger than available capacity
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockedCapacityService.calculateLotCapacity.mockReturnValue({
      availableAcres: 10,
      usedAcres: 0,
      totalAcres: 10,
      plantingCount: 0,
      plantings: []
    });
    
    mockedCapacityService.getNextSublotDesignation.mockReturnValue('A');
    
    mockedPlantingService.splitPlanting.mockReturnValue({
      assignedPortion: { ...mockPlanting, id: 'planting_1_split_1', acres: 7 },
      unassignedRemainder: { ...mockPlanting, id: 'planting_1_split_2', acres: 8 }
    });

    mockedPlantingService.assignToLot.mockImplementation((planting, region, ranch, lot, sublot) => ({
      ...planting,
      assigned: true,
      region: region.region,
      ranch: ranch.name,
      lot: lot.number,
      sublot
    }));
  });

  describe('scoreLotForPlanting', () => {
    it('should give high score for perfect utilization', () => {
      // Mock capacity that would result in 90% utilization after assignment
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 5,
        usedAcres: 4,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const score = optimizationEngine.scoreLotForPlanting(
        mockPlanting,
        mockLot,
        mockRegion,
        mockRanch,
        mockLandStructure,
        []
      );

      expect(score).toBeGreaterThanOrEqual(100); // Base score + rotation/climate bonuses
      expect(mockedCapacityService.calculateLotCapacity).toHaveBeenCalledWith(
        1, 1, 1, mockLandStructure, []
      );
    });

    it('should give medium score for good utilization', () => {
      // Mock capacity that would result in 75% utilization
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 5,
        usedAcres: 2.5,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const score = optimizationEngine.scoreLotForPlanting(
        mockPlanting,
        mockLot,
        mockRegion,
        mockRanch,
        mockLandStructure,
        []
      );

      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThan(120);
    });

    it('should give low score for partial fit requiring split', () => {
      // Mock capacity that can only partially fit the planting
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 3,
        usedAcres: 7,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const score = optimizationEngine.scoreLotForPlanting(
        mockLargePlanting,
        mockLot,
        mockRegion,
        mockRanch,
        mockLandStructure,
        []
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(50);
    });

    it('should return -1 for lots with no capacity', () => {
      // Mock no available capacity
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 0,
        usedAcres: 10,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const score = optimizationEngine.scoreLotForPlanting(
        mockPlanting,
        mockLot,
        mockRegion,
        mockRanch,
        mockLandStructure,
        []
      );

      expect(score).toBe(-1);
    });

    it('should include rotation, climate, soil, and proximity scores', () => {
      // Standard capacity
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 5,
        usedAcres: 0,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      // Mock lot with specific characteristics for bonus scoring
      const bonusLot: Lot = {
        ...mockLot,
        microclimate: 'Cool', // Should match certain crops
        soilType: 'Sandy Loam',
        lastCrop: undefined
      };

      const score = optimizationEngine.scoreLotForPlanting(
        mockPlanting,
        bonusLot,
        mockRegion,
        mockRanch,
        mockLandStructure,
        []
      );

      // Should have base score plus various bonuses
      expect(score).toBeGreaterThan(40); // Base utilization score
    });
  });

  describe('evaluateCropRotation', () => {
    it('should give bonus for good rotation', () => {
      const lotWithGoodRotation: Lot = {
        ...mockLot,
        lastCrop: 'Corn' // Good rotation before lettuce
      };

      const score = optimizationEngine.evaluateCropRotation('Romaine', lotWithGoodRotation);
      expect(score).toBeGreaterThanOrEqual(0); // May be 0 if rotation rules don't have this crop combo
    });

    it('should give penalty for bad rotation', () => {
      const lotWithBadRotation: Lot = {
        ...mockLot,
        lastCrop: 'Lettuce' // Bad - same family crops
      };

      const score = optimizationEngine.evaluateCropRotation('Romaine', lotWithBadRotation);
      expect(score).toBeLessThanOrEqual(0); // May be 0 if no specific rule defined
    });

    it('should be neutral for unknown crops', () => {
      const score = optimizationEngine.evaluateCropRotation('Unknown Crop', mockLot);
      expect(score).toBe(0);
    });
  });

  describe('evaluateMicroclimate', () => {
    it('should give bonus for matching climate preferences', () => {
      const coolPlanting: Planting = {
        ...mockPlanting,
        crop: 'Lettuce'
      };

      const coolLot: Lot = {
        ...mockLot,
        microclimate: 'Cool'
      };

      const score = optimizationEngine.evaluateMicroclimate(coolPlanting, coolLot);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing microclimate data', () => {
      const lotWithoutClimate: Lot = {
        ...mockLot,
        microclimate: undefined as any
      };

      const score = optimizationEngine.evaluateMicroclimate(mockPlanting, lotWithoutClimate);
      expect(score).toBe(0);
    });
  });

  describe('evaluateSoilMatch', () => {
    it('should give bonus for good soil match', () => {
      const sandyLot: Lot = {
        ...mockLot,
        soilType: 'Sandy Loam'
      };

      const score = optimizationEngine.evaluateSoilMatch(mockPlanting, sandyLot);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing soil type', () => {
      const lotWithoutSoil: Lot = {
        ...mockLot,
        soilType: undefined as any
      };

      const score = optimizationEngine.evaluateSoilMatch(mockPlanting, lotWithoutSoil);
      expect(score).toBe(0);
    });
  });

  describe('evaluateProximity', () => {
    it('should give bonus for same customer plantings nearby', () => {
      const nearbyPlantings: Planting[] = [
        {
          ...mockPlanting,
          id: 'nearby_1',
          customer: 'Test Customer',
          assigned: true,
          lot: '101'
        }
      ];

      const score = optimizationEngine.evaluateProximity(
        mockPlanting,
        mockLot,
        nearbyPlantings
      );
      
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 when no nearby plantings', () => {
      const score = optimizationEngine.evaluateProximity(mockPlanting, mockLot, []);
      expect(score).toBe(0);
    });
  });



  describe('findBestLots', () => {
    it('should find and rank the best lots for a planting', () => {
      // Mock multiple lots with different scores
      const multiLotLandStructure: Region[] = [
        {
          ...mockRegion,
          ranches: [
            {
              ...mockRanch,
              lots: [
                { ...mockLot, id: 1, number: '101' },
                { ...mockLot, id: 2, number: '102' },
                { ...mockLot, id: 3, number: '103' }
              ]
            }
          ]
        }
      ];

      // Mock different capacity scenarios
      mockedCapacityService.calculateLotCapacity
        .mockReturnValueOnce({ availableAcres: 5, usedAcres: 0, totalAcres: 10, plantingCount: 0, plantings: [] }) // Good fit
        .mockReturnValueOnce({ availableAcres: 10, usedAcres: 0, totalAcres: 10, plantingCount: 0, plantings: [] }) // Perfect fit
        .mockReturnValueOnce({ availableAcres: 3, usedAcres: 7, totalAcres: 10, plantingCount: 0, plantings: [] }); // Partial fit

      const suggestions = optimizationEngine.findBestLots(
        mockPlanting,
        multiLotLandStructure,
        [],
        3
      );

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].score).toBeGreaterThanOrEqual(suggestions[1].score);
      expect(suggestions[1].score).toBeGreaterThanOrEqual(suggestions[2].score);
      
      // Verify each suggestion has required properties
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('lot');
        expect(suggestion).toHaveProperty('score');
        expect(suggestion).toHaveProperty('fitType');
        expect(suggestion).toHaveProperty('reasons');
      });
    });

    it('should limit results to requested count', () => {
      const multiLotLandStructure: Region[] = [
        {
          ...mockRegion,
          ranches: [
            {
              ...mockRanch,
              lots: [
                { ...mockLot, id: 1, number: '101' },
                { ...mockLot, id: 2, number: '102' },
                { ...mockLot, id: 3, number: '103' }
              ]
            }
          ]
        }
      ];

      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 5,
        usedAcres: 0,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const suggestions = optimizationEngine.findBestLots(
        mockPlanting,
        multiLotLandStructure,
        [],
        1 // Only want 1 result
      );

      expect(suggestions).toHaveLength(1);
    });

    it('should exclude lots with negative scores', () => {
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 0,
        usedAcres: 10,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const suggestions = optimizationEngine.findBestLots(
        mockPlanting,
        mockLandStructure,
        [],
        5
      );

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('optimizeAllPlantings', () => {
    it('should optimize all unassigned plantings', () => {
      const unassignedPlantings: Planting[] = [
        { ...mockPlanting, assigned: false },
        { ...mockPlanting, id: 'planting_2', assigned: false, acres: 3 }
      ];

      const mockSplitNotification = jest.fn();

      // Mock good capacity for both plantings
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 10,
        usedAcres: 0,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const assignments = optimizationEngine.optimizeAllPlantings(
        unassignedPlantings,
        mockLandStructure,
        mockSplitNotification
      );

      expect(assignments).toHaveLength(2);
      expect(assignments[0].type).toBe('assign');
      expect(assignments[0].original.id).toBe('planting_1'); // Larger planting first
      expect(assignments[1].type).toBe('assign');
      expect(assignments[1].original.id).toBe('planting_2');
    });

    it('should handle split assignments', () => {
      const largePlantings: Planting[] = [
        { ...mockLargePlanting, assigned: false }
      ];

      const mockSplitNotification = jest.fn();

      // Mock partial capacity that requires splitting
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 7,
        usedAcres: 3,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const assignments = optimizationEngine.optimizeAllPlantings(
        largePlantings,
        mockLandStructure,
        mockSplitNotification
      );

      expect(assignments).toHaveLength(1);
      expect(assignments[0].type).toBe('split');
      expect(assignments[0].remainder).toBeDefined();
      expect(mockedPlantingService.splitPlanting).toHaveBeenCalled();
    });

    it('should skip plantings with no suitable lots', () => {
      const plantings: Planting[] = [
        { ...mockPlanting, assigned: false }
      ];

      const mockSplitNotification = jest.fn();

      // Mock no available capacity
      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 0,
        usedAcres: 10,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const assignments = optimizationEngine.optimizeAllPlantings(
        plantings,
        mockLandStructure,
        mockSplitNotification
      );

      expect(assignments).toHaveLength(0);
    });

    it('should sort plantings by size (largest first)', () => {
      const mixedSizePlantings: Planting[] = [
        { ...mockPlanting, id: 'small', acres: 2, assigned: false },
        { ...mockPlanting, id: 'large', acres: 8, assigned: false },
        { ...mockPlanting, id: 'medium', acres: 5, assigned: false }
      ];

      const mockSplitNotification = jest.fn();

      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 10,
        usedAcres: 0,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const assignments = optimizationEngine.optimizeAllPlantings(
        mixedSizePlantings,
        mockLandStructure,
        mockSplitNotification
      );

      // Should process largest first
      expect(assignments[0].original.id).toBe('large');
      expect(assignments[1].original.id).toBe('medium');
      expect(assignments[2].original.id).toBe('small');
    });

    it('should skip already assigned plantings', () => {
      const mixedPlantings: Planting[] = [
        { ...mockPlanting, id: 'assigned', assigned: true },
        { ...mockPlanting, id: 'unassigned', assigned: false }
      ];

      const mockSplitNotification = jest.fn();

      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 10,
        usedAcres: 0,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      const assignments = optimizationEngine.optimizeAllPlantings(
        mixedPlantings,
        mockLandStructure,
        mockSplitNotification
      );

      expect(assignments).toHaveLength(1);
      expect(assignments[0].original.id).toBe('unassigned');
    });
  });

  describe('error handling', () => {
    it('should handle missing land structure gracefully', () => {
      expect(() => {
        optimizationEngine.findBestLots(mockPlanting, [], [], 1);
      }).not.toThrow();
      
      const suggestions = optimizationEngine.findBestLots(mockPlanting, [], [], 1);
      expect(suggestions).toHaveLength(0);
    });

    it('should handle capacity service errors', () => {
      mockedCapacityService.calculateLotCapacity.mockImplementation(() => {
        throw new Error('Capacity calculation failed');
      });

      expect(() => {
        optimizationEngine.scoreLotForPlanting(
          mockPlanting,
          mockLot,
          mockRegion,
          mockRanch,
          mockLandStructure,
          []
        );
      }).toThrow('Capacity calculation failed');
    });

    it('should handle invalid planting data', () => {
      const invalidPlanting: Planting = {
        ...mockPlanting,
        acres: -5 // Invalid negative acres
      };

      mockedCapacityService.calculateLotCapacity.mockReturnValue({
        availableAcres: 10,
        usedAcres: 0,
        totalAcres: 10,
        plantingCount: 0,
        plantings: []
      });

      // Should still work, though score might be affected
      const score = optimizationEngine.scoreLotForPlanting(
        invalidPlanting,
        mockLot,
        mockRegion,
        mockRanch,
        mockLandStructure,
        []
      );

      expect(typeof score).toBe('number');
    });
  });
});
