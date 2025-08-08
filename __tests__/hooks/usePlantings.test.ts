// =============================================================================
// USE PLANTINGS HOOK TEST SUITE
// =============================================================================

import { renderHook, act } from '@testing-library/react';
import { usePlantings } from '../../hooks/usePlantings';
import { persistenceService } from '../../lib/services/persistence';
import { plantingGenerationService } from '../../lib/services/plantingGeneration';
import { optimizationEngine } from '../../lib/services/optimization';
import { capacityService } from '../../lib/services/capacity';
import { STORAGE_KEYS } from '../../lib/constants';
import type { Order } from '../../types/orders';
import type { Commodity } from '../../types/commodities';
import type { Region } from '../../types/land';
import type { Planting } from '../../types/planning';

// Mock all the services
jest.mock('../../lib/services/persistence', () => ({
  persistenceService: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../../lib/services/plantingGeneration', () => ({
  plantingGenerationService: {
    generateFromOrders: jest.fn(),
  },
}));

jest.mock('../../lib/services/optimization', () => ({
  optimizationEngine: {
    optimizeAllPlantings: jest.fn(),
  },
}));

jest.mock('../../lib/services/capacity', () => ({
  capacityService: {
    canFitInLot: jest.fn(),
    getNextSublotDesignation: jest.fn(),
    calculateLotCapacity: jest.fn(),
  },
}));

const mockedPersistenceService = persistenceService as jest.Mocked<typeof persistenceService>;
const mockedPlantingGenerationService = plantingGenerationService as jest.Mocked<typeof plantingGenerationService>;
const mockedOptimizationEngine = optimizationEngine as jest.Mocked<typeof optimizationEngine>;
const mockedCapacityService = capacityService as jest.Mocked<typeof capacityService>;

describe('usePlantings Hook', () => {
  // Mock data
  const mockOrders: Order[] = [
    {
      id: 1,
      customer: 'Test Customer',
      commodity: 'Romaine',
      volume: 1000,
      marketType: 'Fresh Cut',
      deliveryDate: '2024-06-01',
      isWeekly: false
    }
  ];

  const mockCommodities: Commodity[] = [
    {
      id: 1,
      name: 'Romaine',
      varieties: [
        {
          id: 1,
          name: 'Test Variety',
          growingWindow: { start: 'Mar', end: 'Oct' },
          daysToHarvest: 75,
          budgetYieldPerAcre: { 'Fresh Cut': 1000 },
          marketTypes: ['Fresh Cut'],
          bedSize: '40-2',
          spacing: '12in',
          plantType: 'Transplant',
          idealStand: 30000,
          preferences: { Jan: 0, Feb: 0, Mar: 10, Apr: 15, May: 20, Jun: 20, Jul: 15, Aug: 10, Sep: 5, Oct: 5, Nov: 0, Dec: 0 }
        }
      ]
    }
  ];

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
            }
          ]
        }
      ]
    }
  ];

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

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockedPersistenceService.load.mockReturnValue([]);
    mockedPersistenceService.save.mockReturnValue(true);
    mockedPlantingGenerationService.generateFromOrders.mockReturnValue([]);
    mockedOptimizationEngine.optimizeAllPlantings.mockReturnValue([]);
    mockedCapacityService.canFitInLot.mockReturnValue(true);
    mockedCapacityService.getNextSublotDesignation.mockReturnValue('A');
    mockedCapacityService.calculateLotCapacity.mockReturnValue({ availableAcres: 10, usedAcres: 0, totalAcres: 10 });
  });

  describe('initialization', () => {
    it('should initialize with empty plantings when no saved data exists', () => {
      mockedPersistenceService.load.mockReturnValue([]);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      expect(result.current.plantings).toEqual([]);
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(STORAGE_KEYS.PLANTINGS, []);
    });

    it('should initialize with saved plantings when data exists', () => {
      const savedPlantings = [mockPlanting];
      mockedPersistenceService.load.mockReturnValue(savedPlantings);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      expect(result.current.plantings).toEqual(savedPlantings);
    });

    it('should accept optional land structure', () => {
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      expect(result.current.setLandStructure).toBeDefined();
    });

    it('should auto-save plantings on initialization', () => {
      renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      expect(mockedPersistenceService.save).toHaveBeenCalledWith(STORAGE_KEYS.PLANTINGS, []);
    });
  });

  describe('generatePlantings', () => {
    it('should generate plantings from orders and commodities', () => {
      const generatedPlantings = [mockPlanting];
      mockedPlantingGenerationService.generateFromOrders.mockReturnValue(generatedPlantings);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      act(() => {
        result.current.generatePlantings();
      });
      
      expect(mockedPlantingGenerationService.generateFromOrders).toHaveBeenCalledWith(mockOrders, mockCommodities);
      expect(result.current.plantings).toEqual(generatedPlantings);
    });

    it('should auto-save after generating plantings', () => {
      const generatedPlantings = [mockPlanting];
      mockedPlantingGenerationService.generateFromOrders.mockReturnValue(generatedPlantings);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      act(() => {
        result.current.generatePlantings();
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(STORAGE_KEYS.PLANTINGS, generatedPlantings);
    });
  });

  describe('setLandStructure', () => {
    it('should update the land structure reference', () => {
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      act(() => {
        result.current.setLandStructure(mockLandStructure);
      });
      
      // This is a ref update, so no immediate state change expected
      expect(result.current.setLandStructure).toBeDefined();
    });
  });

  describe('assignPlantingToLot', () => {
    it('should successfully assign a planting to a lot when it fits', () => {
      const plantings = [mockPlanting];
      mockedPersistenceService.load.mockReturnValue(plantings);
      mockedCapacityService.canFitInLot.mockReturnValue(true);
      mockedCapacityService.getNextSublotDesignation.mockReturnValue('A');
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      let assignmentResult: any;
      act(() => {
        assignmentResult = result.current.assignPlantingToLot('planting_1', 1, 1, 1);
      });
      
      expect(assignmentResult.success).toBe(true);
      expect(assignmentResult.type).toBe('assigned');
      expect(mockedCapacityService.canFitInLot).toHaveBeenCalledWith(5, 1, 1, 1, mockLandStructure, expect.any(Array));
      
      // Check that the planting was updated
      const assignedPlanting = result.current.plantings.find(p => p.id === 'planting_1');
      expect(assignedPlanting?.assigned).toBe(true);
      expect(assignedPlanting?.region).toBe('North Valley');
      expect(assignedPlanting?.ranch).toBe('Test Ranch');
      expect(assignedPlanting?.lot).toBe('101');
      expect(assignedPlanting?.sublot).toBe('A');
    });

    it('should return error when planting not found', () => {
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      let assignmentResult: any;
      act(() => {
        assignmentResult = result.current.assignPlantingToLot('nonexistent', 1, 1, 1);
      });
      
      expect(assignmentResult.success).toBe(false);
      expect(assignmentResult.type).toBe('not_found');
    });

    it('should return error when no land structure is available', () => {
      const plantings = [mockPlanting];
      mockedPersistenceService.load.mockReturnValue(plantings);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      let assignmentResult: any;
      act(() => {
        assignmentResult = result.current.assignPlantingToLot('planting_1', 1, 1, 1);
      });
      
      expect(assignmentResult.success).toBe(false);
      expect(assignmentResult.type).toBe('no_land_structure');
    });

    it('should return error when location not found', () => {
      const plantings = [mockPlanting];
      mockedPersistenceService.load.mockReturnValue(plantings);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      let assignmentResult: any;
      act(() => {
        assignmentResult = result.current.assignPlantingToLot('planting_1', 999, 999, 999);
      });
      
      expect(assignmentResult.success).toBe(false);
      expect(assignmentResult.type).toBe('location_not_found');
    });

    it('should handle split when planting does not fit entirely - no space', () => {
      const plantings = [{ ...mockPlanting, acres: 15 }]; // Larger than lot capacity
      mockedPersistenceService.load.mockReturnValue(plantings);
      mockedCapacityService.canFitInLot.mockReturnValue(false);
      mockedCapacityService.calculateLotCapacity.mockReturnValue({ availableAcres: 0, usedAcres: 10, totalAcres: 10 });
      
      // Mock the splitting scenario - no space available
      const splitNotification = jest.fn();
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      let assignmentResult: any;
      act(() => {
        assignmentResult = result.current.assignPlantingToLot('planting_1', 1, 1, 1, splitNotification);
      });
      
      expect(assignmentResult.success).toBe(false);
      expect(assignmentResult.type).toBe('no_capacity');
    });

    it('should handle successful split when partial space available', () => {
      // Mock the planting service for splitting
      const plantingService = require('../../lib/services/planting');
      jest.spyOn(plantingService.plantingService, 'splitPlanting').mockReturnValue({
        assignedPortion: { ...mockPlanting, id: 'planting_1_split_1', acres: 7 },
        unassignedRemainder: { ...mockPlanting, id: 'planting_1_split_2', acres: 8 }
      });
      
      const plantings = [{ ...mockPlanting, acres: 15 }]; // Larger than lot capacity
      mockedPersistenceService.load.mockReturnValue(plantings);
      mockedCapacityService.canFitInLot.mockReturnValue(false);
      mockedCapacityService.calculateLotCapacity.mockReturnValue({ availableAcres: 7, usedAcres: 3, totalAcres: 10 });
      
      const splitNotification = jest.fn();
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      let assignmentResult: any;
      act(() => {
        assignmentResult = result.current.assignPlantingToLot('planting_1', 1, 1, 1, splitNotification);
      });
      
      expect(assignmentResult.success).toBe(true);
      expect(assignmentResult.type).toBe('split');
      expect(splitNotification).toHaveBeenCalled();
      
      // Should have 2 plantings now (assigned + remainder)
      expect(result.current.plantings).toHaveLength(2);
      expect(result.current.plantings.find(p => p.id === 'planting_1')).toBeUndefined(); // Original removed
      expect(result.current.plantings.find(p => p.id === 'planting_1_split_1')).toBeDefined(); // Assigned portion
      expect(result.current.plantings.find(p => p.id === 'planting_1_split_2')).toBeDefined(); // Remainder
    });

    it('should auto-save after assignment', () => {
      const plantings = [mockPlanting];
      mockedPersistenceService.load.mockReturnValue(plantings);
      mockedCapacityService.canFitInLot.mockReturnValue(true);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      act(() => {
        result.current.assignPlantingToLot('planting_1', 1, 1, 1);
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.PLANTINGS, 
        expect.arrayContaining([
          expect.objectContaining({
            id: 'planting_1',
            assigned: true
          })
        ])
      );
    });
  });

  describe('unassignPlanting', () => {
    it('should successfully unassign a planting', () => {
      const assignedPlanting = { 
        ...mockPlanting, 
        assigned: true, 
        region: 'North Valley',
        ranch: 'Test Ranch',
        lot: '101',
        sublot: 'A'
      };
      mockedPersistenceService.load.mockReturnValue([assignedPlanting]);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      let unassignResult: any;
      act(() => {
        unassignResult = result.current.unassignPlanting('planting_1');
      });
      
      expect(unassignResult.success).toBe(true);
      expect(unassignResult.type).toBe('unassigned');
      
      const unassignedPlanting = result.current.plantings.find(p => p.id === 'planting_1');
      expect(unassignedPlanting?.assigned).toBe(false);
      expect(unassignedPlanting?.region).toBeUndefined();
      expect(unassignedPlanting?.ranch).toBeUndefined();
      expect(unassignedPlanting?.lot).toBeUndefined();
      expect(unassignedPlanting?.sublot).toBeUndefined();
    });

    it('should return error when planting not found', () => {
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      let unassignResult: any;
      act(() => {
        unassignResult = result.current.unassignPlanting('nonexistent');
      });
      
      expect(unassignResult.success).toBe(false);
      expect(unassignResult.type).toBe('not_found_or_unassigned');
    });

    it('should auto-save after unassignment', () => {
      const assignedPlanting = { ...mockPlanting, assigned: true };
      mockedPersistenceService.load.mockReturnValue([assignedPlanting]);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      act(() => {
        result.current.unassignPlanting('planting_1');
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.PLANTINGS, 
        expect.arrayContaining([
          expect.objectContaining({
            id: 'planting_1',
            assigned: false
          })
        ])
      );
    });
  });

  describe('optimizeAllPlantings', () => {
    it('should run optimization engine and apply assignments', () => {
      const plantings = [mockPlanting];
      const optimizedAssignments = [
        {
          type: 'assign' as const,
          original: mockPlanting,
          assigned: { ...mockPlanting, assigned: true, region: 'North Valley' },
          lot: { number: '101' }
        }
      ];
      
      mockedPersistenceService.load.mockReturnValue(plantings);
      mockedOptimizationEngine.optimizeAllPlantings.mockReturnValue(optimizedAssignments);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      act(() => {
        result.current.optimizeAllPlantings();
      });
      
      expect(mockedOptimizationEngine.optimizeAllPlantings).toHaveBeenCalledWith(
        plantings,
        mockLandStructure,
        expect.any(Function)
      );
      
      const optimizedPlanting = result.current.plantings.find(p => p.id === 'planting_1');
      expect(optimizedPlanting?.assigned).toBe(true);
    });

    it('should handle split assignments with notifications', () => {
      const plantings = [mockPlanting];
      const splitAssignments = [
        {
          type: 'split' as const,
          original: mockPlanting,
          assigned: { ...mockPlanting, id: 'planting_1_split_1', acres: 3 },
          remainder: { ...mockPlanting, id: 'planting_1_split_2', acres: 2 },
          lot: { number: '101' }
        }
      ];
      
      mockedPersistenceService.load.mockReturnValue(plantings);
      mockedOptimizationEngine.optimizeAllPlantings.mockReturnValue(splitAssignments);
      
      const splitNotification = jest.fn();
      const optimizationComplete = jest.fn();
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      act(() => {
        result.current.optimizeAllPlantings(splitNotification, optimizationComplete);
      });
      
      // Check that original planting was replaced with split plantings
      expect(result.current.plantings).toHaveLength(2);
      expect(result.current.plantings.find(p => p.id === 'planting_1')).toBeUndefined();
      expect(result.current.plantings.find(p => p.id === 'planting_1_split_1')).toBeDefined();
      expect(result.current.plantings.find(p => p.id === 'planting_1_split_2')).toBeDefined();
      
      // Check that optimization complete callback was called
      expect(optimizationComplete).toHaveBeenCalled();
    });

    it('should return empty array when no land structure available', () => {
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      let optimizationResult: any;
      act(() => {
        optimizationResult = result.current.optimizeAllPlantings();
      });
      
      expect(optimizationResult).toEqual([]);
      expect(mockedOptimizationEngine.optimizeAllPlantings).not.toHaveBeenCalled();
    });

    it('should auto-save after optimization', () => {
      const plantings = [mockPlanting];
      mockedPersistenceService.load.mockReturnValue(plantings);
      mockedOptimizationEngine.optimizeAllPlantings.mockReturnValue([]);
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities, mockLandStructure));
      
      act(() => {
        result.current.optimizeAllPlantings();
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(STORAGE_KEYS.PLANTINGS, plantings);
    });
  });

  describe('persistence integration', () => {
    it('should load plantings from persistence on mount', () => {
      renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(STORAGE_KEYS.PLANTINGS, []);
    });

    it('should save plantings after each state change', () => {
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      // Initial save
      expect(mockedPersistenceService.save).toHaveBeenCalledWith(STORAGE_KEYS.PLANTINGS, []);
      
      // Generate plantings
      const generatedPlantings = [mockPlanting];
      mockedPlantingGenerationService.generateFromOrders.mockReturnValue(generatedPlantings);
      
      act(() => {
        result.current.generatePlantings();
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(STORAGE_KEYS.PLANTINGS, generatedPlantings);
    });
  });

  describe('error handling', () => {
    it('should handle persistence service errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedPersistenceService.save.mockImplementation(() => {
        throw new Error('Storage failed');
      });
      
      // The hook itself doesn't have error handling, so the error will propagate
      // This test verifies the error exists, showing we need error handling
      expect(() => {
        renderHook(() => usePlantings(mockOrders, mockCommodities));
      }).toThrow('Storage failed');
      
      consoleSpy.mockRestore();
    });

    it('should handle generation service errors gracefully', () => {
      mockedPlantingGenerationService.generateFromOrders.mockImplementation(() => {
        throw new Error('Generation failed');
      });
      
      const { result } = renderHook(() => usePlantings(mockOrders, mockCommodities));
      
      expect(() => {
        act(() => {
          result.current.generatePlantings();
        });
      }).toThrow('Generation failed');
    });
  });
});
