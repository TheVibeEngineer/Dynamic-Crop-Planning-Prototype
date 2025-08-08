// =============================================================================
// PLANTING SERVICE TEST SUITE
// =============================================================================

import { plantingService } from '../../../lib/services/planting';
import type { Order, Variety, Planting } from '../../../types';

describe('Planting Service', () => {
  const mockVariety: Variety = {
    id: 'var1',
    name: 'Test Variety',
    daysToHarvest: 75,
    budgetYieldPerAcre: {
      'Fresh Cut': 200,
      'Processing': 150
    },
    bedSize: 6,
    spacing: 4,
    idealStand: 100000
  };

  const mockOrder: Order = {
    id: 1,
    orderNumber: 'ORD-001',
    customer: 'Test Customer',
    commodity: 'Lettuce',
    variety: 'Test Variety',
    marketType: 'Fresh Cut',
    volume: 1000,
    units: 'cases',
    deliveryDate: '2024-06-01',
    pricePerUnit: 15,
    totalValue: 15000,
    notes: 'Test order'
  };

  describe('calculateTotalYield', () => {
    it('should calculate total yield correctly', () => {
      expect(plantingService.calculateTotalYield(5, 200)).toBe(1000);
      expect(plantingService.calculateTotalYield(2.5, 100)).toBe(250);
      expect(plantingService.calculateTotalYield(0, 200)).toBe(0);
    });

    it('should round to nearest whole number', () => {
      expect(plantingService.calculateTotalYield(3.33, 150)).toBe(500);
      expect(plantingService.calculateTotalYield(1.5, 66.67)).toBe(100);
    });
  });

  describe('calculateHarvestDate', () => {
    it('should calculate harvest date correctly', () => {
      const plantDate = '2024-03-01';
      const daysToHarvest = 75;
      
      const harvestDate = plantingService.calculateHarvestDate(plantDate, daysToHarvest);
      
      expect(harvestDate).toBe('2024-05-15'); // 75 days after March 1
    });

    it('should handle year boundaries', () => {
      const plantDate = '2024-11-01';
      const daysToHarvest = 90;
      
      const harvestDate = plantingService.calculateHarvestDate(plantDate, daysToHarvest);
      
      expect(harvestDate).toBe('2025-01-30'); // 90 days after Nov 1
    });
  });

  describe('calculateAcresNeeded', () => {
    it('should calculate acres needed correctly', () => {
      expect(plantingService.calculateAcresNeeded(1000, 200)).toBe(5);
      expect(plantingService.calculateAcresNeeded(500, 100)).toBe(5);
    });

    it('should handle zero yield per acre', () => {
      expect(plantingService.calculateAcresNeeded(1000, 0)).toBe(0);
    });

    it('should handle negative yield per acre', () => {
      expect(plantingService.calculateAcresNeeded(1000, -100)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(plantingService.calculateAcresNeeded(333, 100)).toBe(3.33);
    });
  });

  describe('generatePlantingId', () => {
    it('should generate unique planting IDs', () => {
      const id1 = plantingService.generatePlantingId();
      const id2 = plantingService.generatePlantingId();
      
      expect(id1).toMatch(/^planting_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^planting_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('createPlantingFromOrder', () => {
    it('should create planting from order and variety', () => {
      const plantDate = '2024-03-01';
      
      const planting = plantingService.createPlantingFromOrder(mockOrder, mockVariety, plantDate);
      
      expect(planting.crop).toBe(mockOrder.commodity);
      expect(planting.variety).toBe(mockVariety.name);
      expect(planting.marketType).toBe(mockOrder.marketType);
      expect(planting.customer).toBe(mockOrder.customer);
      expect(planting.volumeOrdered).toBe(mockOrder.volume);
      expect(planting.plantDate).toBe(plantDate);
      expect(planting.acres).toBe(5); // 1000 / 200 = 5
      expect(planting.totalYield).toBe(1000); // 5 * 200 = 1000
      expect(planting.harvestDate).toBe('2024-05-15'); // 75 days after plant date
      expect(planting.assigned).toBe(false);
      expect(planting.originalOrderId).toBe('1');
    });

    it('should handle missing variety yield', () => {
      const varietyWithoutYield = { ...mockVariety, budgetYieldPerAcre: {} };
      const plantDate = '2024-03-01';
      
      const planting = plantingService.createPlantingFromOrder(
        mockOrder, 
        varietyWithoutYield, 
        plantDate
      );
      
      expect(planting.acres).toBe(0);
      expect(planting.totalYield).toBe(0);
    });
  });

  describe('assignToLot', () => {
    it('should assign planting to lot correctly', () => {
      const basePlanting: Planting = {
        id: 'test-planting',
        crop: 'Lettuce',
        variety: 'Test Variety',
        acres: 5,
        plantDate: '2024-03-01',
        harvestDate: '2024-05-15',
        marketType: 'Fresh Cut',
        customer: 'Test Customer',
        volumeOrdered: 1000,
        totalYield: 1000,
        budgetYieldPerAcre: 200,
        assigned: false,
        originalOrderId: '1',
        budgetedDaysToHarvest: 75,
        bedSize: 6,
        spacing: 4,
        budgetedHarvestDate: '2024-05-15',
        idealStandPerAcre: 100000
      };

      const region = { id: 'reg1', region: 'North Valley' };
      const ranch = { id: 'ranch1', name: 'Test Ranch' };
      const lot = { id: 'lot1', number: '101' };
      const sublot = 'A';

      const assignedPlanting = plantingService.assignToLot(
        basePlanting, 
        region, 
        ranch, 
        lot, 
        sublot
      );

      expect(assignedPlanting.assigned).toBe(true);
      expect(assignedPlanting.region).toBe('North Valley');
      expect(assignedPlanting.ranch).toBe('Test Ranch');
      expect(assignedPlanting.lot).toBe('101');
      expect(assignedPlanting.sublot).toBe('A');
      expect(assignedPlanting.uniqueLotId).toBe('reg1-ranch1-lot1');
      expect(assignedPlanting.displayLotId).toBe('North Valley > Test Ranch > Lot 101-A');
    });
  });

  describe('splitPlanting', () => {
    it('should split planting correctly', () => {
      const originalPlanting: Planting = {
        id: 'original-planting',
        crop: 'Lettuce',
        variety: 'Test Variety',
        acres: 10,
        plantDate: '2024-03-01',
        harvestDate: '2024-05-15',
        marketType: 'Fresh Cut',
        customer: 'Test Customer',
        volumeOrdered: 2000,
        totalYield: 2000,
        budgetYieldPerAcre: 200,
        assigned: false,
        originalOrderId: '1',
        budgetedDaysToHarvest: 75,
        bedSize: 6,
        spacing: 4,
        budgetedHarvestDate: '2024-05-15',
        idealStandPerAcre: 100000
      };

      const { assignedPortion, unassignedRemainder } = plantingService.splitPlanting(
        originalPlanting, 
        6
      );

      // Check assigned portion
      expect(assignedPortion.acres).toBe(6);
      expect(assignedPortion.totalYield).toBe(1200); // 6 * 200
      expect(assignedPortion.assigned).toBe(false); // Will be assigned after creation
      expect(assignedPortion.parentPlantingId).toBe('original-planting');
      expect(assignedPortion.splitSequence).toBe(1);

      // Check unassigned remainder
      expect(unassignedRemainder.acres).toBe(4);
      expect(unassignedRemainder.totalYield).toBe(800); // 4 * 200
      expect(unassignedRemainder.assigned).toBe(false);
      expect(unassignedRemainder.parentPlantingId).toBe('original-planting');
      expect(unassignedRemainder.splitSequence).toBe(2);

      // Check that both have split timestamps
      expect(assignedPortion.splitTimestamp).toBeDefined();
      expect(unassignedRemainder.splitTimestamp).toBeDefined();
      expect(assignedPortion.splitTimestamp).toBe(unassignedRemainder.splitTimestamp);
    });

    it('should handle existing split sequence', () => {
      const plantingWithSplitHistory: Planting = {
        id: 'split-planting',
        crop: 'Lettuce',
        variety: 'Test Variety',
        acres: 8,
        plantDate: '2024-03-01',
        harvestDate: '2024-05-15',
        marketType: 'Fresh Cut',
        customer: 'Test Customer',
        volumeOrdered: 1600,
        totalYield: 1600,
        budgetYieldPerAcre: 200,
        assigned: false,
        originalOrderId: '1',
        budgetedDaysToHarvest: 75,
        bedSize: 6,
        spacing: 4,
        budgetedHarvestDate: '2024-05-15',
        idealStandPerAcre: 100000,
        splitSequence: 3,
        parentPlantingId: 'original-parent'
      };

      const { assignedPortion, unassignedRemainder } = plantingService.splitPlanting(
        plantingWithSplitHistory, 
        3
      );

      expect(assignedPortion.splitSequence).toBe(4);
      expect(unassignedRemainder.splitSequence).toBe(5);
      expect(assignedPortion.parentPlantingId).toBe('original-parent');
      expect(unassignedRemainder.parentPlantingId).toBe('original-parent');
    });
  });
});
