// =============================================================================
// PLANTING GENERATION SERVICE TEST SUITE
// =============================================================================

import { plantingGenerationService } from '../../../lib/services/plantingGeneration';
import { plantingService } from '../../../lib/services/planting';
import type { Order } from '../../../types/orders';
import type { Commodity } from '../../../types/commodities';
import type { Planting } from '../../../types/planning';

// Mock the planting service
jest.mock('../../../lib/services/planting', () => ({
  plantingService: {
    createPlantingFromOrder: jest.fn(),
  },
}));

const mockedPlantingService = plantingService as jest.Mocked<typeof plantingService>;

describe('PlantingGeneration Service', () => {
  const mockCommodities: Commodity[] = [
    {
      id: 1,
      name: 'Romaine',
      varieties: [
        {
          id: 1,
          name: 'Green Forest',
          growingWindow: { start: 'Mar', end: 'Oct' },
          daysToHarvest: 75,
          budgetYieldPerAcre: { 'Fresh Cut': 1000, 'Bulk': 800 },
          marketTypes: ['Fresh Cut', 'Bulk'],
          bedSize: '40-2',
          spacing: '12in',
          plantType: 'Transplant',
          idealStand: 30000,
          preferences: { Jan: 0, Feb: 0, Mar: 10, Apr: 15, May: 20, Jun: 20, Jul: 15, Aug: 10, Sep: 5, Oct: 5, Nov: 0, Dec: 0 }
        },
        {
          id: 2,
          name: 'Red Romaine',
          growingWindow: { start: 'Apr', end: 'Sep' },
          daysToHarvest: 80,
          budgetYieldPerAcre: { 'Fresh Cut': 950, 'Bulk': 750 },
          marketTypes: ['Fresh Cut', 'Bulk'],
          bedSize: '40-2',
          spacing: '12in',
          plantType: 'Transplant',
          idealStand: 28000,
          preferences: { Jan: 0, Feb: 0, Mar: 5, Apr: 20, May: 25, Jun: 25, Jul: 20, Aug: 5, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    },
    {
      id: 2,
      name: 'Iceberg',
      varieties: [
        {
          id: 3,
          name: 'Standard Iceberg',
          growingWindow: { start: 'Feb', end: 'Nov' },
          daysToHarvest: 90,
          budgetYieldPerAcre: { 'Fresh Cut': 1200, 'Processing': 1000 },
          marketTypes: ['Fresh Cut', 'Processing'],
          bedSize: '38-2',
          spacing: '14in',
          plantType: 'Transplant',
          idealStand: 25000,
          preferences: { Jan: 0, Feb: 10, Mar: 15, Apr: 20, May: 25, Jun: 25, Jul: 20, Aug: 15, Sep: 10, Oct: 5, Nov: 0, Dec: 0 }
        }
      ]
    },
    {
      id: 3,
      name: 'Carrots',
      varieties: [
        {
          id: 4,
          name: 'Nantes',
          growingWindow: { start: 'Mar', end: 'Aug' },
          daysToHarvest: 120,
          budgetYieldPerAcre: { 'Processing': 2000, 'Fresh Cut': 0 }, // No Fresh Cut support
          marketTypes: ['Processing'],
          bedSize: '40-2',
          spacing: '2in',
          plantType: 'Direct Seed',
          idealStand: 100000,
          preferences: { Jan: 0, Feb: 0, Mar: 15, Apr: 20, May: 25, Jun: 20, Jul: 15, Aug: 5, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
        }
      ]
    }
  ];

  const mockOrders: Order[] = [
    {
      id: 1,
      customer: 'Fresh Farms Co',
      commodity: 'Romaine',
      volume: 1000,
      marketType: 'Fresh Cut',
      deliveryDate: '2024-06-01',
      isWeekly: false
    },
    {
      id: 2,
      customer: 'Processing Plant A',
      commodity: 'Iceberg',
      volume: 1500,
      marketType: 'Processing',
      deliveryDate: '2024-07-15',
      isWeekly: false
    },
    {
      id: 3,
      customer: 'Bulk Buyer B',
      commodity: 'Romaine',
      volume: 800,
      marketType: 'Bulk',
      deliveryDate: '2024-05-15',
      isWeekly: true
    },
    {
      id: 4,
      customer: 'Carrot Processor',
      commodity: 'Carrots',
      volume: 2000,
      marketType: 'Processing',
      deliveryDate: '2024-08-30',
      isWeekly: false
    }
  ];

  const mockPlanting: Planting = {
    id: 'planting_1',
    crop: 'Romaine',
    variety: 'Green Forest',
    acres: 1,
    plantDate: '2024-03-17',
    harvestDate: '2024-06-01',
    marketType: 'Fresh Cut',
    customer: 'Fresh Farms Co',
    volumeOrdered: 1000,
    totalYield: 1000,
    budgetYieldPerAcre: 1000,
    assigned: false,
    originalOrderId: '1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid test output noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Default mock implementation
    mockedPlantingService.createPlantingFromOrder.mockReturnValue(mockPlanting);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateFromOrders', () => {
    it('should generate plantings for valid orders', () => {
      const validOrders = [mockOrders[0]]; // Just the Romaine Fresh Cut order
      
      const plantings = plantingGenerationService.generateFromOrders(validOrders, mockCommodities);
      
      expect(plantings).toHaveLength(1);
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledTimes(1);
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledWith(
        validOrders[0],
        mockCommodities[0].varieties[0], // First suitable variety
        '2024-03-18' // Delivery date minus 75 days
      );
    });

    it('should generate multiple plantings for multiple orders', () => {
      const plantings = plantingGenerationService.generateFromOrders(mockOrders, mockCommodities);
      
      expect(plantings).toHaveLength(4);
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledTimes(4);
    });

    it('should calculate correct plant dates based on delivery date and days to harvest', () => {
      const orders = [
        {
          ...mockOrders[0],
          deliveryDate: '2024-06-01' // Romaine with 75 days to harvest
        },
        {
          ...mockOrders[1],
          deliveryDate: '2024-07-15' // Iceberg with 90 days to harvest
        }
      ];
      
      plantingGenerationService.generateFromOrders(orders, mockCommodities);
      
      // Check the plant dates calculated
      const calls = mockedPlantingService.createPlantingFromOrder.mock.calls;
      
      // Romaine: 2024-06-01 minus 75 days = 2024-03-18
      expect(calls[0][2]).toBe('2024-03-18');
      
      // Iceberg: 2024-07-15 minus 90 days = 2024-04-16
      expect(calls[1][2]).toBe('2024-04-16');
    });

    it('should select the first suitable variety for each order', () => {
      const orders = [mockOrders[0]]; // Romaine Fresh Cut
      
      plantingGenerationService.generateFromOrders(orders, mockCommodities);
      
      // Should select the first variety that supports Fresh Cut
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledWith(
        orders[0],
        mockCommodities[0].varieties[0], // Green Forest (first suitable)
        expect.any(String)
      );
    });

    it('should handle orders with commodity not found', () => {
      const invalidOrders = [
        {
          ...mockOrders[0],
          commodity: 'Nonexistent Crop'
        }
      ];
      
      const plantings = plantingGenerationService.generateFromOrders(invalidOrders, mockCommodities);
      
      expect(plantings).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledWith('❌ Commodity "Nonexistent Crop" not found');
      expect(mockedPlantingService.createPlantingFromOrder).not.toHaveBeenCalled();
    });

    it('should handle orders with no suitable varieties', () => {
      const invalidOrders = [
        {
          ...mockOrders[3], // Carrots
          marketType: 'Fresh Cut' // Carrots don't support Fresh Cut
        }
      ];
      
      const plantings = plantingGenerationService.generateFromOrders(invalidOrders, mockCommodities);
      
      expect(plantings).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledWith('❌ No suitable varieties found for Carrots with market type Fresh Cut');
      expect(mockedPlantingService.createPlantingFromOrder).not.toHaveBeenCalled();
    });

    it('should handle varieties with zero yield for market type', () => {
      // Create a commodity with a variety that has zero yield for a market type
      const commodityWithZeroYield: Commodity[] = [
        {
          id: 1,
          name: 'Test Crop',
          varieties: [
            {
              id: 1,
              name: 'Test Variety',
              growingWindow: { start: 'Mar', end: 'Oct' },
              daysToHarvest: 60,
              budgetYieldPerAcre: { 'Fresh Cut': 0, 'Bulk': 500 }, // Zero yield for Fresh Cut
              marketTypes: ['Fresh Cut', 'Bulk'],
              bedSize: '40-2',
              spacing: '12in',
              plantType: 'Transplant',
              idealStand: 30000,
              preferences: { Jan: 0, Feb: 0, Mar: 10, Apr: 15, May: 20, Jun: 20, Jul: 15, Aug: 10, Sep: 5, Oct: 5, Nov: 0, Dec: 0 }
            }
          ]
        }
      ];

      const orders = [
        {
          ...mockOrders[0],
          commodity: 'Test Crop',
          marketType: 'Fresh Cut'
        }
      ];
      
      const plantings = plantingGenerationService.generateFromOrders(orders, commodityWithZeroYield);
      
      expect(plantings).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledWith('❌ No suitable varieties found for Test Crop with market type Fresh Cut');
    });

    it('should handle empty orders array', () => {
      const plantings = plantingGenerationService.generateFromOrders([], mockCommodities);
      
      expect(plantings).toHaveLength(0);
      expect(mockedPlantingService.createPlantingFromOrder).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('✅ Generated 0 plantings from 0 orders');
    });

    it('should handle empty commodities array', () => {
      const plantings = plantingGenerationService.generateFromOrders(mockOrders, []);
      
      expect(plantings).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledTimes(4); // One warning per order
      expect(mockedPlantingService.createPlantingFromOrder).not.toHaveBeenCalled();
    });

    it('should handle date calculations correctly across year boundaries', () => {
      const newYearOrders = [
        {
          ...mockOrders[0],
          deliveryDate: '2024-01-15' // Early in year
        }
      ];
      
      plantingGenerationService.generateFromOrders(newYearOrders, mockCommodities);
      
      // 2024-01-15 minus 75 days should be 2023-10-31
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledWith(
        newYearOrders[0],
        expect.any(Object),
        '2023-10-31'
      );
    });

    it('should handle leap year date calculations', () => {
      const leapYearOrders = [
        {
          ...mockOrders[0],
          deliveryDate: '2024-03-01' // Leap year, delivery in March
        }
      ];
      
      plantingGenerationService.generateFromOrders(leapYearOrders, mockCommodities);
      
      // 2024-03-01 minus 75 days should account for Feb 29 in leap year
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledWith(
        leapYearOrders[0],
        expect.any(Object),
        '2023-12-17' // Correct calculation including leap day
      );
    });

    it('should log success message with correct counts', () => {
      plantingGenerationService.generateFromOrders(mockOrders, mockCommodities);
      
      expect(console.log).toHaveBeenCalledWith('✅ Generated 4 plantings from 4 orders');
    });

    it('should handle different market types correctly', () => {
      const mixedMarketOrders = [
        {
          ...mockOrders[0],
          marketType: 'Fresh Cut'
        },
        {
          ...mockOrders[0],
          marketType: 'Bulk',
          id: 2
        }
      ];
      
      plantingGenerationService.generateFromOrders(mixedMarketOrders, mockCommodities);
      
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledTimes(2);
      
      // Both should use the first variety since it supports both market types
      const calls = mockedPlantingService.createPlantingFromOrder.mock.calls;
      expect(calls[0][1]).toBe(mockCommodities[0].varieties[0]);
      expect(calls[1][1]).toBe(mockCommodities[0].varieties[0]);
    });

    it('should handle orders with very short delivery times', () => {
      const shortTimeOrders = [
        {
          ...mockOrders[0],
          deliveryDate: '2024-03-10' // Very short time from plant to delivery
        }
      ];
      
      plantingGenerationService.generateFromOrders(shortTimeOrders, mockCommodities);
      
      // Should still calculate correctly even if plant date is in the past
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledWith(
        shortTimeOrders[0],
        expect.any(Object),
        '2023-12-26' // 75 days before 2024-03-10
      );
    });
  });

  describe('integration with plantingService', () => {
    it('should pass correct parameters to createPlantingFromOrder', () => {
      const order = mockOrders[0];
      const expectedVariety = mockCommodities[0].varieties[0];
      
      plantingGenerationService.generateFromOrders([order], mockCommodities);
      
      expect(mockedPlantingService.createPlantingFromOrder).toHaveBeenCalledWith(
        order,
        expectedVariety,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) // Date in YYYY-MM-DD format
      );
    });

    it('should return the plantings created by plantingService', () => {
      const mockReturnedPlantings = [
        { ...mockPlanting, id: 'planting_1' },
        { ...mockPlanting, id: 'planting_2' }
      ];
      
      mockedPlantingService.createPlantingFromOrder
        .mockReturnValueOnce(mockReturnedPlantings[0])
        .mockReturnValueOnce(mockReturnedPlantings[1]);
      
      const orders = [mockOrders[0], mockOrders[2]]; // Two orders
      const plantings = plantingGenerationService.generateFromOrders(orders, mockCommodities);
      
      expect(plantings).toEqual(mockReturnedPlantings);
    });

    it('should handle plantingService errors gracefully', () => {
      mockedPlantingService.createPlantingFromOrder.mockImplementation(() => {
        throw new Error('Planting creation failed');
      });
      
      expect(() => {
        plantingGenerationService.generateFromOrders(mockOrders, mockCommodities);
      }).toThrow('Planting creation failed');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed delivery dates', () => {
      const invalidDateOrders = [
        {
          ...mockOrders[0],
          deliveryDate: 'invalid-date'
        }
      ];
      
      // Should throw when trying to convert invalid date to ISO string
      expect(() => {
        plantingGenerationService.generateFromOrders(invalidDateOrders, mockCommodities);
      }).toThrow('Invalid time value');
    });

    it('should handle null/undefined values gracefully', () => {
      expect(() => {
        plantingGenerationService.generateFromOrders(null as any, mockCommodities);
      }).toThrow();

      expect(() => {
        plantingGenerationService.generateFromOrders(mockOrders, null as any);
      }).toThrow();
    });

    it('should handle commodities with no varieties', () => {
      const emptyVarietiesCommodities = [
        {
          ...mockCommodities[0],
          varieties: []
        }
      ];
      
      const plantings = plantingGenerationService.generateFromOrders(mockOrders, emptyVarietiesCommodities);
      
      expect(plantings).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledWith('❌ No suitable varieties found for Romaine with market type Fresh Cut');
    });

    it('should handle varieties with missing marketTypes array', () => {
      const malformedCommodities = [
        {
          ...mockCommodities[0],
          varieties: [
            {
              ...mockCommodities[0].varieties[0],
              marketTypes: undefined as any
            }
          ]
        }
      ];
      
      // Should throw when trying to access includes on undefined
      expect(() => {
        plantingGenerationService.generateFromOrders(mockOrders, malformedCommodities);
      }).toThrow("Cannot read properties of undefined (reading 'includes')");
    });
  });
});
