// =============================================================================
// USE COMMODITIES HOOK TEST SUITE
// =============================================================================

import { renderHook, act } from '@testing-library/react';
import { useCommodities } from '../../hooks/useCommodities';
import { persistenceService } from '../../lib/services/persistence';
import { STORAGE_KEYS } from '../../lib/constants';
import type { Commodity, Variety } from '../../types/commodities';

// Mock the persistence service
jest.mock('../../lib/services/persistence', () => ({
  persistenceService: {
    load: jest.fn((key: string, defaultValue: any) => defaultValue),
    save: jest.fn(),
  },
}));

const mockedPersistenceService = persistenceService as jest.Mocked<typeof persistenceService>;

describe('useCommodities Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPersistenceService.load.mockImplementation((key: string, defaultValue: any) => defaultValue);
    mockedPersistenceService.save.mockReturnValue(true);
  });

  describe('initialization', () => {
    it('should initialize with default commodities when no saved data exists', () => {
      mockedPersistenceService.load.mockImplementation((key: string, defaultValue: any) => defaultValue);
      
      const { result } = renderHook(() => useCommodities());
      
      expect(result.current.commodities).toHaveLength(3); // Default commodities: Romaine, Iceberg, Carrots
      expect(result.current.commodities[0]).toMatchObject({
        id: 1,
        name: 'Romaine'
      });
      expect(result.current.commodities[0].varieties).toHaveLength(2);
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(STORAGE_KEYS.COMMODITIES, expect.any(Array));
    });

    it('should initialize with saved commodities when data exists', () => {
      const savedCommodities: Commodity[] = [
        { 
          id: 1, 
          name: 'Test Commodity', 
          varieties: [
            {
              id: 1,
              name: 'Test Variety',
              growingWindow: { start: 'Jan', end: 'Dec' },
              daysToHarvest: 60,
              bedSize: '40-2',
              spacing: '12in',
              plantType: 'Transplant',
              idealStand: 30000,
              marketTypes: ['Fresh Cut'],
              budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 0 },
              preferences: { Jan: 10, Feb: 10, Mar: 10, Apr: 10, May: 10, Jun: 10, Jul: 10, Aug: 10, Sep: 10, Oct: 10, Nov: 10, Dec: 10 }
            }
          ]
        }
      ];
      mockedPersistenceService.load.mockImplementation(() => savedCommodities);
      
      const { result } = renderHook(() => useCommodities());
      
      expect(result.current.commodities).toEqual(savedCommodities);
    });

    it('should auto-save commodities on initialization', () => {
      const { result } = renderHook(() => useCommodities());
      
      expect(mockedPersistenceService.save).toHaveBeenCalledWith(STORAGE_KEYS.COMMODITIES, result.current.commodities);
    });
  });

  describe('addCommodity', () => {
    it('should add a new commodity with generated ID', () => {
      const { result } = renderHook(() => useCommodities());
      const initialCount = result.current.commodities.length;
      
      act(() => {
        result.current.addCommodity({
          name: 'New Commodity'
        });
      });
      
      expect(result.current.commodities).toHaveLength(initialCount + 1);
      const newCommodity = result.current.commodities[result.current.commodities.length - 1];
      expect(newCommodity).toMatchObject({
        name: 'New Commodity',
        varieties: []
      });
      expect(newCommodity.id).toBeDefined();
      expect(typeof newCommodity.id).toBe('number');
    });

    it('should handle commodity with existing varieties', () => {
      const { result } = renderHook(() => useCommodities());
      
      const variety: Variety = {
        id: 1,
        name: 'Test Variety',
        growingWindow: { start: 'Mar', end: 'Oct' },
        daysToHarvest: 75,
        bedSize: '40-2',
        spacing: '12in',
        plantType: 'Transplant',
        idealStand: 30000,
        marketTypes: ['Fresh Cut'],
        budgetYieldPerAcre: { 'Fresh Cut': 1200, 'Bulk': 0 },
        preferences: { Jan: 0, Feb: 0, Mar: 10, Apr: 15, May: 20, Jun: 20, Jul: 15, Aug: 10, Sep: 5, Oct: 5, Nov: 0, Dec: 0 }
      };
      
      act(() => {
        result.current.addCommodity({
          name: 'Commodity with Varieties',
          varieties: [variety]
        });
      });
      
      const newCommodity = result.current.commodities[result.current.commodities.length - 1];
      expect(newCommodity.varieties).toHaveLength(1);
      expect(newCommodity.varieties[0]).toEqual(variety);
    });

    it('should auto-save after adding commodity', () => {
      const { result } = renderHook(() => useCommodities());
      
      act(() => {
        result.current.addCommodity({
          name: 'Test Commodity'
        });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.COMMODITIES, 
        result.current.commodities
      );
    });
  });

  describe('updateCommodity', () => {
    it('should update existing commodity', () => {
      const { result } = renderHook(() => useCommodities());
      const commodityId = result.current.commodities[0].id;
      
      act(() => {
        result.current.updateCommodity(commodityId, {
          name: 'Updated Commodity Name'
        });
      });
      
      const updatedCommodity = result.current.commodities.find(c => c.id === commodityId);
      expect(updatedCommodity?.name).toBe('Updated Commodity Name');
      expect(updatedCommodity?.id).toBe(commodityId);
    });

    it('should not update non-existent commodity', () => {
      const { result } = renderHook(() => useCommodities());
      const initialCommodities = [...result.current.commodities];
      
      act(() => {
        result.current.updateCommodity(99999, {
          name: 'Should Not Update'
        });
      });
      
      expect(result.current.commodities).toEqual(initialCommodities);
    });

    it('should preserve commodity ID during update', () => {
      const { result } = renderHook(() => useCommodities());
      const commodityId = result.current.commodities[0].id;
      
      act(() => {
        result.current.updateCommodity(commodityId, {
          id: 88888, // Try to change ID
          name: 'Updated Name'
        });
      });
      
      const updatedCommodity = result.current.commodities.find(c => c.id === commodityId);
      expect(updatedCommodity?.id).toBe(commodityId);
      expect(updatedCommodity?.name).toBe('Updated Name');
    });

    it('should auto-save after updating commodity', () => {
      const { result } = renderHook(() => useCommodities());
      const commodityId = result.current.commodities[0].id;
      
      act(() => {
        result.current.updateCommodity(commodityId, {
          name: 'Updated Name'
        });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.COMMODITIES, 
        result.current.commodities
      );
    });
  });

  describe('deleteCommodity', () => {
    it('should delete existing commodity', () => {
      const { result } = renderHook(() => useCommodities());
      const commodityId = result.current.commodities[0].id;
      const initialCount = result.current.commodities.length;
      
      act(() => {
        result.current.deleteCommodity(commodityId);
      });
      
      expect(result.current.commodities).toHaveLength(initialCount - 1);
      expect(result.current.commodities.find(c => c.id === commodityId)).toBeUndefined();
    });

    it('should not affect commodities when deleting non-existent commodity', () => {
      const { result } = renderHook(() => useCommodities());
      const initialCommodities = [...result.current.commodities];
      
      act(() => {
        result.current.deleteCommodity(99999);
      });
      
      expect(result.current.commodities).toEqual(initialCommodities);
    });

    it('should auto-save after deleting commodity', () => {
      const { result } = renderHook(() => useCommodities());
      const commodityId = result.current.commodities[0].id;
      
      act(() => {
        result.current.deleteCommodity(commodityId);
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.COMMODITIES, 
        result.current.commodities
      );
    });
  });

  describe('addVariety', () => {
    it('should add variety to existing commodity by name', () => {
      const { result } = renderHook(() => useCommodities());
      const commodityName = 'Romaine';
      const initialVarietyCount = result.current.commodities.find(c => c.name === commodityName)?.varieties.length || 0;
      
      const newVariety: Partial<Variety> = {
        name: 'New Variety',
        growingWindow: { start: 'Apr', end: 'Sep' },
        daysToHarvest: 70,
        bedSize: '40-2',
        spacing: '10in',
        plantType: 'Direct Seed',
        idealStand: 25000,
        marketTypes: ['Bulk'],
        budgetYieldPerAcre: { 'Fresh Cut': 0, 'Bulk': 30000 },
        preferences: { Jan: 0, Feb: 0, Mar: 5, Apr: 15, May: 20, Jun: 25, Jul: 20, Aug: 10, Sep: 5, Oct: 0, Nov: 0, Dec: 0 }
      };
      
      act(() => {
        result.current.addVariety(commodityName, newVariety);
      });
      
      const updatedCommodity = result.current.commodities.find(c => c.name === commodityName);
      expect(updatedCommodity?.varieties).toHaveLength(initialVarietyCount + 1);
      expect(updatedCommodity?.varieties.some(v => v.name === 'New Variety')).toBe(true);
    });

    it('should not add variety to non-existent commodity', () => {
      const { result } = renderHook(() => useCommodities());
      const initialCommodities = [...result.current.commodities];
      
      const newVariety: Partial<Variety> = {
        name: 'New Variety',
        growingWindow: { start: 'Apr', end: 'Sep' },
        daysToHarvest: 70
      };
      
      act(() => {
        result.current.addVariety('Non-existent Commodity', newVariety);
      });
      
      expect(result.current.commodities).toEqual(initialCommodities);
    });

    it('should auto-save after adding variety', () => {
      const { result } = renderHook(() => useCommodities());
      const commodityName = 'Romaine';
      
      const newVariety: Partial<Variety> = {
        name: 'New Variety',
        growingWindow: { start: 'Apr', end: 'Sep' },
        daysToHarvest: 70
      };
      
      act(() => {
        result.current.addVariety(commodityName, newVariety);
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.COMMODITIES, 
        result.current.commodities
      );
    });
  });

  describe('data access helpers', () => {
    it('should provide access to commodities data', () => {
      const { result } = renderHook(() => useCommodities());
      
      expect(result.current.commodities).toBeDefined();
      expect(Array.isArray(result.current.commodities)).toBe(true);
    });

    it('should allow finding commodity by name manually', () => {
      const { result } = renderHook(() => useCommodities());
      
      const romaineCommodity = result.current.commodities.find(c => c.name === 'Romaine');
      
      expect(romaineCommodity).toBeDefined();
      expect(romaineCommodity?.name).toBe('Romaine');
    });

    it('should allow finding varieties by commodity manually', () => {
      const { result } = renderHook(() => useCommodities());
      
      const romaineCommodity = result.current.commodities.find(c => c.name === 'Romaine');
      const varieties = romaineCommodity?.varieties || [];
      
      expect(varieties).toHaveLength(2); // Default Romaine has 2 varieties
      expect(varieties[0].name).toBe('Green Forest');
      expect(varieties[1].name).toBe('Parris Island Cos');
    });
  });

  describe('persistence integration', () => {
    it('should load commodities from persistence on mount', () => {
      renderHook(() => useCommodities());
      
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(
        STORAGE_KEYS.COMMODITIES, 
        expect.any(Array)
      );
    });

    it('should save commodities after each state change', () => {
      const { result } = renderHook(() => useCommodities());
      const callCountAfterInit = mockedPersistenceService.save.mock.calls.length;
      
      // Add commodity
      act(() => {
        result.current.addCommodity({ name: 'Test' });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledTimes(callCountAfterInit + 1);
      
      // Update commodity
      const commodityId = result.current.commodities[0].id;
      act(() => {
        result.current.updateCommodity(commodityId, { name: 'Updated' });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledTimes(callCountAfterInit + 2);
      
      // Delete commodity
      act(() => {
        result.current.deleteCommodity(commodityId);
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledTimes(callCountAfterInit + 3);
    });
  });
});
