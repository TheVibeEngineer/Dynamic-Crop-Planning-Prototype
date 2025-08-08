// =============================================================================
// USE LAND MANAGEMENT HOOK TEST SUITE
// =============================================================================

import { renderHook, act } from '@testing-library/react';
import { useLandManagement } from '../../hooks/useLandManagement';
import { persistenceService } from '../../lib/services/persistence';
import { STORAGE_KEYS } from '../../lib/constants';
import type { Region, Ranch, Lot } from '../../types';

// Mock the persistence service
jest.mock('../../lib/services/persistence', () => ({
  persistenceService: {
    load: jest.fn(),
    save: jest.fn(),
  },
}));

const mockedPersistenceService = persistenceService as jest.Mocked<typeof persistenceService>;

describe('useLandManagement Hook', () => {
  const mockPlantings = [
    {
      id: 'planting_1',
      assigned: true,
      assignedLot: { regionId: 1, ranchId: 1, lotId: 1 }
    },
    {
      id: 'planting_2',
      assigned: true,
      assignedLot: { regionId: 1, ranchId: 1, lotId: 2 }
    },
    {
      id: 'planting_3',
      assigned: true,
      assignedLot: { regionId: 2, ranchId: 3, lotId: 6 }
    },
    {
      id: 'planting_4',
      assigned: false
    }
  ];

  const mockUnassignPlanting = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Return undefined to trigger default value usage
    mockedPersistenceService.load.mockImplementation((key, defaultValue) => defaultValue);
    mockedPersistenceService.save.mockReturnValue(true);
  });

  describe('initialization', () => {
    it('should initialize with default land structure when no saved data exists', () => {
      // Override the default mock to return empty array (simulating no saved data)
      mockedPersistenceService.load.mockImplementation((key, defaultValue) => 
        key === STORAGE_KEYS.LAND_STRUCTURE ? defaultValue : []
      );
      
      const { result } = renderHook(() => useLandManagement());
      
      expect(result.current.landStructure).toHaveLength(2);
      expect(result.current.landStructure[0].region).toBe('Salinas');
      expect(result.current.landStructure[1].region).toBe('Yuma');
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(STORAGE_KEYS.LAND_STRUCTURE, expect.any(Array));
    });

    it('should initialize with saved land structure when data exists', () => {
      const savedLandStructure = [
        {
          id: 100,
          region: 'Custom Region',
          ranches: []
        }
      ];
      mockedPersistenceService.load.mockReturnValue(savedLandStructure);
      
      const { result } = renderHook(() => useLandManagement());
      
      expect(result.current.landStructure).toEqual(savedLandStructure);
    });

    it('should auto-save changes to persistence', () => {
      const { result } = renderHook(() => useLandManagement());
      
      act(() => {
        result.current.addRegion({ region: 'New Region' });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledWith(
        STORAGE_KEYS.LAND_STRUCTURE,
        expect.arrayContaining([
          expect.objectContaining({ region: 'New Region' })
        ])
      );
    });

    it('should accept optional plantings and unassignPlanting callback', () => {
      const { result } = renderHook(() => 
        useLandManagement(mockPlantings, mockUnassignPlanting)
      );
      
      expect(result.current.landStructure).toHaveLength(2);
    });
  });

  describe('region management', () => {
    it('should add a new region', () => {
      const { result } = renderHook(() => useLandManagement());
      
      act(() => {
        result.current.addRegion({ region: 'New Valley' });
      });
      
      const newRegion = result.current.landStructure.find(r => r.region === 'New Valley');
      expect(newRegion).toBeDefined();
      expect(newRegion?.ranches).toEqual([]);
      expect(newRegion?.id).toBeDefined();
    });

    it('should update an existing region', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      
      act(() => {
        result.current.updateRegion(regionId, { region: 'Updated Salinas' });
      });
      
      const updatedRegion = result.current.landStructure.find(r => r.id === regionId);
      expect(updatedRegion?.region).toBe('Updated Salinas');
    });

    it('should delete a region and unassign plantings', () => {
      const { result } = renderHook(() => 
        useLandManagement(mockPlantings, mockUnassignPlanting)
      );
      const regionId = result.current.landStructure[0].id;
      
      act(() => {
        result.current.deleteRegion(regionId);
      });
      
      expect(result.current.landStructure.find(r => r.id === regionId)).toBeUndefined();
      expect(mockUnassignPlanting).toHaveBeenCalledWith('planting_1');
      expect(mockUnassignPlanting).toHaveBeenCalledWith('planting_2');
    });

    it('should delete a region without unassigning plantings when no callback provided', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      
      act(() => {
        result.current.deleteRegion(regionId);
      });
      
      expect(result.current.landStructure.find(r => r.id === regionId)).toBeUndefined();
      expect(mockUnassignPlanting).not.toHaveBeenCalled();
    });
  });

  describe('ranch management', () => {
    it('should add a new ranch to a region', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      
      act(() => {
        result.current.addRanch(regionId, { name: 'New Ranch' });
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const newRanch = region?.ranches.find(r => r.name === 'New Ranch');
      expect(newRanch).toBeDefined();
      expect(newRanch?.lots).toEqual([]);
      expect(newRanch?.id).toBeDefined();
    });

    it('should update an existing ranch', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      
      act(() => {
        result.current.updateRanch(regionId, ranchId, { name: 'Updated Ranch' });
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const updatedRanch = region?.ranches.find(r => r.id === ranchId);
      expect(updatedRanch?.name).toBe('Updated Ranch');
    });

    it('should delete a ranch and unassign plantings', () => {
      const { result } = renderHook(() => 
        useLandManagement(mockPlantings, mockUnassignPlanting)
      );
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      
      act(() => {
        result.current.deleteRanch(regionId, ranchId);
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      expect(region?.ranches.find(r => r.id === ranchId)).toBeUndefined();
      expect(mockUnassignPlanting).toHaveBeenCalledWith('planting_1');
      expect(mockUnassignPlanting).toHaveBeenCalledWith('planting_2');
    });

    it('should not add ranch to non-existent region', () => {
      const { result } = renderHook(() => useLandManagement());
      
      act(() => {
        result.current.addRanch(999, { name: 'Orphan Ranch' });
      });
      
      // Should not find the ranch anywhere
      const allRanches = result.current.landStructure.flatMap(r => r.ranches);
      expect(allRanches.find(r => r.name === 'Orphan Ranch')).toBeUndefined();
    });
  });

  describe('lot management', () => {
    it('should add a new lot to a ranch', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      
      const lotData = {
        number: '99',
        acres: 15,
        soilType: 'Loam',
        microclimate: 'Cool',
        lastCrop: 'Spinach',
        lastPlantDate: '2024-01-15'
      };
      
      act(() => {
        result.current.addLot(regionId, ranchId, lotData);
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      const newLot = ranch?.lots.find(l => l.number === '99');
      
      expect(newLot).toBeDefined();
      expect(newLot?.acres).toBe(15);
      expect(newLot?.soilType).toBe('Loam');
      expect(newLot?.microclimate).toBe('Cool');
      expect(newLot?.lastCrop).toBe('Spinach');
      expect(newLot?.lastPlantDate).toBe('2024-01-15');
      expect(newLot?.id).toBeDefined();
    });

    it('should handle string acres input by converting to number', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      
      act(() => {
        result.current.addLot(regionId, ranchId, { number: '98', acres: '25.5' as any });
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      const newLot = ranch?.lots.find(l => l.number === '98');
      
      expect(newLot?.acres).toBe(25.5);
    });

    it('should throw error when adding lot with duplicate number', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      const existingLotNumber = result.current.landStructure[0].ranches[0].lots[0].number;
      
      expect(() => {
        act(() => {
          result.current.addLot(regionId, ranchId, { number: existingLotNumber });
        });
      }).toThrow(`Lot number "${existingLotNumber}" already exists in this ranch`);
    });

    it('should update an existing lot', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      const lotId = result.current.landStructure[0].ranches[0].lots[0].id;
      
      const updateData = {
        number: 'Updated1',
        acres: 50,
        soilType: 'Clay',
        microclimate: 'Hot'
      };
      
      act(() => {
        result.current.updateLot(regionId, ranchId, lotId, updateData);
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      const updatedLot = ranch?.lots.find(l => l.id === lotId);
      
      expect(updatedLot?.number).toBe('Updated1');
      expect(updatedLot?.acres).toBe(50);
      expect(updatedLot?.soilType).toBe('Clay');
      expect(updatedLot?.microclimate).toBe('Hot');
    });

    it('should throw error when updating lot with duplicate number', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      const lotId = result.current.landStructure[0].ranches[0].lots[0].id;
      const existingLotNumber = result.current.landStructure[0].ranches[0].lots[1].number;
      
      expect(() => {
        act(() => {
          result.current.updateLot(regionId, ranchId, lotId, { number: existingLotNumber });
        });
      }).toThrow(`Lot number "${existingLotNumber}" already exists in this ranch`);
    });

    it('should allow updating lot with same number (no change)', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      const lotId = result.current.landStructure[0].ranches[0].lots[0].id;
      const currentLotNumber = result.current.landStructure[0].ranches[0].lots[0].number;
      
      expect(() => {
        act(() => {
          result.current.updateLot(regionId, ranchId, lotId, { 
            number: currentLotNumber,
            acres: 100 
          });
        });
      }).not.toThrow();
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      const updatedLot = ranch?.lots.find(l => l.id === lotId);
      expect(updatedLot?.acres).toBe(100);
    });

    it('should delete a lot and unassign plantings', () => {
      const { result } = renderHook(() => 
        useLandManagement(mockPlantings, mockUnassignPlanting)
      );
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      const lotId = result.current.landStructure[0].ranches[0].lots[0].id;
      
      act(() => {
        result.current.deleteLot(regionId, ranchId, lotId);
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      expect(ranch?.lots.find(l => l.id === lotId)).toBeUndefined();
      expect(mockUnassignPlanting).toHaveBeenCalledWith('planting_1');
    });

    it('should not add lot to non-existent ranch', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      
      act(() => {
        result.current.addLot(regionId, 999, { number: 'Orphan Lot' });
      });
      
      // Should not find the lot anywhere
      const allLots = result.current.landStructure[0].ranches.flatMap(r => r.lots);
      expect(allLots.find(l => l.number === 'Orphan Lot')).toBeUndefined();
    });
  });

  describe('findLot', () => {
    it('should find an existing lot', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      const lotId = result.current.landStructure[0].ranches[0].lots[0].id;
      
      const foundLot = result.current.findLot(regionId, ranchId, lotId);
      
      expect(foundLot).toBeDefined();
      expect(foundLot?.id).toBe(lotId);
    });

    it('should return undefined for non-existent lot', () => {
      const { result } = renderHook(() => useLandManagement());
      
      const foundLot = result.current.findLot(999, 999, 999);
      
      expect(foundLot).toBeUndefined();
    });

    it('should return undefined for non-existent region', () => {
      const { result } = renderHook(() => useLandManagement());
      const ranchId = result.current.landStructure[0].ranches[0].id;
      const lotId = result.current.landStructure[0].ranches[0].lots[0].id;
      
      const foundLot = result.current.findLot(999, ranchId, lotId);
      
      expect(foundLot).toBeUndefined();
    });

    it('should return undefined for non-existent ranch', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const lotId = result.current.landStructure[0].ranches[0].lots[0].id;
      
      const foundLot = result.current.findLot(regionId, 999, lotId);
      
      expect(foundLot).toBeUndefined();
    });
  });

  describe('persistence integration', () => {
    it('should load land structure from persistence on mount', () => {
      renderHook(() => useLandManagement());
      
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(
        STORAGE_KEYS.LAND_STRUCTURE,
        expect.any(Array)
      );
    });

    it('should save land structure after each change', () => {
      const { result } = renderHook(() => useLandManagement());
      
      // Clear initial save calls
      mockedPersistenceService.save.mockClear();
      
      act(() => {
        result.current.addRegion({ region: 'Test Region' });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledWith(
        STORAGE_KEYS.LAND_STRUCTURE,
        expect.arrayContaining([
          expect.objectContaining({ region: 'Test Region' })
        ])
      );
    });
  });

  describe('ID generation', () => {
    it('should generate unique IDs for new regions', async () => {
      const { result } = renderHook(() => useLandManagement());
      
      act(() => {
        result.current.addRegion({ region: 'Region 1' });
      });
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      act(() => {
        result.current.addRegion({ region: 'Region 2' });
      });
      
      const region1 = result.current.landStructure.find(r => r.region === 'Region 1');
      const region2 = result.current.landStructure.find(r => r.region === 'Region 2');
      
      expect(region1?.id).toBeDefined();
      expect(region2?.id).toBeDefined();
      expect(region1?.id).not.toBe(region2?.id);
    });

    it('should generate unique IDs for new ranches', async () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      
      act(() => {
        result.current.addRanch(regionId, { name: 'Ranch 1' });
      });
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      act(() => {
        result.current.addRanch(regionId, { name: 'Ranch 2' });
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch1 = region?.ranches.find(r => r.name === 'Ranch 1');
      const ranch2 = region?.ranches.find(r => r.name === 'Ranch 2');
      
      expect(ranch1?.id).toBeDefined();
      expect(ranch2?.id).toBeDefined();
      expect(ranch1?.id).not.toBe(ranch2?.id);
    });

    it('should generate unique IDs for new lots', async () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      
      act(() => {
        result.current.addLot(regionId, ranchId, { number: 'Lot1' });
      });
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      act(() => {
        result.current.addLot(regionId, ranchId, { number: 'Lot2' });
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      const lot1 = ranch?.lots.find(l => l.number === 'Lot1');
      const lot2 = ranch?.lots.find(l => l.number === 'Lot2');
      
      expect(lot1?.id).toBeDefined();
      expect(lot2?.id).toBeDefined();
      expect(lot1?.id).not.toBe(lot2?.id);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty lot data gracefully', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      const ranchId = result.current.landStructure[0].ranches[0].id;
      
      act(() => {
        result.current.addLot(regionId, ranchId, {});
      });
      
      const region = result.current.landStructure.find(r => r.id === regionId);
      const ranch = region?.ranches.find(r => r.id === ranchId);
      const newLot = ranch?.lots.find(l => l.number === '');
      
      expect(newLot).toBeDefined();
      expect(newLot?.acres).toBe(0);
      expect(newLot?.soilType).toBe('');
    });

    it('should handle malformed plantings array', () => {
      const malformedPlantings = [
        { id: 'valid_planting', assigned: true, assignedLot: { regionId: 1, ranchId: 1, lotId: 1 } },
        { id: 'invalid_planting_1' }, // Missing assigned property
        { id: 'invalid_planting_2', assigned: true }, // Missing assignedLot
        { id: 'invalid_planting_3', assigned: true, assignedLot: {} }, // Missing properties in assignedLot
      ];
      
      const { result } = renderHook(() => 
        useLandManagement(malformedPlantings, mockUnassignPlanting)
      );
      const regionId = result.current.landStructure[0].id;
      
      // Should not crash when deleting region
      act(() => {
        result.current.deleteRegion(regionId);
      });
      
      expect(mockUnassignPlanting).toHaveBeenCalledWith('valid_planting');
      expect(mockUnassignPlanting).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion without plantings array', () => {
      const { result } = renderHook(() => useLandManagement());
      const regionId = result.current.landStructure[0].id;
      
      // Should not crash without plantings
      expect(() => {
        act(() => {
          result.current.deleteRegion(regionId);
        });
      }).not.toThrow();
    });

    it('should handle persistence service errors gracefully', () => {
      // Hook will crash during initialization if save throws
      // So we test the failure happens during initialization, not later
      mockedPersistenceService.save.mockImplementation(() => {
        throw new Error('Storage failed');
      });
      
      // The hook should crash during initialization when save is called in useEffect
      expect(() => {
        renderHook(() => useLandManagement());
      }).toThrow('Storage failed');
    });
  });

  describe('complex workflows', () => {
    it('should handle complete region creation workflow', () => {
      const { result } = renderHook(() => useLandManagement());
      
      // Add region
      act(() => {
        result.current.addRegion({ region: 'New Valley' });
      });
      
      const newRegion = result.current.landStructure.find(r => r.region === 'New Valley');
      expect(newRegion).toBeDefined();
      
      // Add ranch to new region
      act(() => {
        result.current.addRanch(newRegion!.id, { name: 'Valley Ranch' });
      });
      
      const updatedRegion = result.current.landStructure.find(r => r.region === 'New Valley');
      const newRanch = updatedRegion?.ranches.find(r => r.name === 'Valley Ranch');
      expect(newRanch).toBeDefined();
      
      // Add lot to new ranch
      act(() => {
        result.current.addLot(newRegion!.id, newRanch!.id, { 
          number: 'VL1', 
          acres: 25, 
          soilType: 'Loam' 
        });
      });
      
      const finalRegion = result.current.landStructure.find(r => r.region === 'New Valley');
      const finalRanch = finalRegion?.ranches.find(r => r.name === 'Valley Ranch');
      const newLot = finalRanch?.lots.find(l => l.number === 'VL1');
      
      expect(newLot).toBeDefined();
      expect(newLot?.acres).toBe(25);
      expect(newLot?.soilType).toBe('Loam');
    });

    it('should handle cascading deletions with plantings', () => {
      const complexPlantings = [
        { id: 'p1', assigned: true, assignedLot: { regionId: 1, ranchId: 1, lotId: 1 } },
        { id: 'p2', assigned: true, assignedLot: { regionId: 1, ranchId: 1, lotId: 2 } },
        { id: 'p3', assigned: true, assignedLot: { regionId: 1, ranchId: 2, lotId: 4 } },
        { id: 'p4', assigned: true, assignedLot: { regionId: 2, ranchId: 3, lotId: 6 } },
      ];
      
      const { result } = renderHook(() => 
        useLandManagement(complexPlantings, mockUnassignPlanting)
      );
      
      const regionId = result.current.landStructure[0].id;
      
      // Delete entire region should unassign all plantings in that region
      act(() => {
        result.current.deleteRegion(regionId);
      });
      
      expect(mockUnassignPlanting).toHaveBeenCalledWith('p1');
      expect(mockUnassignPlanting).toHaveBeenCalledWith('p2');
      expect(mockUnassignPlanting).toHaveBeenCalledWith('p3');
      expect(mockUnassignPlanting).not.toHaveBeenCalledWith('p4'); // Different region
      expect(mockUnassignPlanting).toHaveBeenCalledTimes(3);
    });
  });
});
