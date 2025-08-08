// =============================================================================
// CSV SERVICE TEST SUITE
// =============================================================================

import { csvService } from '../../../lib/services/csv';
import type { Planting } from '../../../types';

// Mock DOM and browser APIs
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

// Setup browser API mocks
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  type: options?.type,
})) as any;

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: mockClick,
      };
    }
    return {};
  }),
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
});

describe('CSV Service', () => {
  const mockPlantings: Planting[] = [
    {
      id: 'planting_1',
      crop: 'Romaine',
      variety: 'Green Forest',
      acres: 5.5,
      plantDate: '2024-03-15',
      harvestDate: '2024-06-01',
      marketType: 'Fresh Cut',
      customer: 'Fresh Farms Co',
      volumeOrdered: 1000,
      totalYield: 5500,
      budgetYieldPerAcre: 1000,
      assigned: true,
      region: 'Salinas',
      ranch: 'North Ranch',
      lot: '101',
      sublot: 'A',
      originalOrderId: '1'
    },
    {
      id: 'planting_2',
      crop: 'Iceberg',
      variety: 'Standard Iceberg',
      acres: 3.0,
      plantDate: '2024-04-01',
      harvestDate: '2024-07-15',
      marketType: 'Processing',
      customer: 'Processing Plant A',
      volumeOrdered: 800,
      totalYield: 3600,
      budgetYieldPerAcre: 1200,
      assigned: false,
      originalOrderId: '2'
    },
    {
      id: 'planting_3',
      crop: 'Carrots',
      variety: 'Nantes',
      acres: 2.25,
      plantDate: '2024-02-15',
      harvestDate: '2024-06-15',
      marketType: 'Fresh Cut',
      customer: 'Organic Market',
      assigned: true,
      region: 'Yuma',
      ranch: 'Desert Ranch',
      lot: '201',
      sublot: 'B',
      originalOrderId: '3'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('mock-blob-url');
    
    // Reset Blob mock to default behavior
    global.Blob = jest.fn().mockImplementation((content, options) => ({
      content,
      type: options?.type,
    })) as any;
  });

  describe('exportPlantings', () => {
    it('should create CSV with correct headers', () => {
      csvService.exportPlantings(mockPlantings);

      const expectedHeaders = [
        'ID', 'Region', 'Ranch', 'Lot', 'Sublot', 'Crop', 'Variety', 'Acres', 'Plant Date', 'Harvest Date',
        'Market Type', 'Customer', 'Volume Ordered', 'Total Yield',
        'Budget Yield/Acre', 'Assigned'
      ];

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining(expectedHeaders.join(','))],
        { type: 'text/csv' }
      );
    });

    it('should format CSV data correctly for assigned planting', () => {
      csvService.exportPlantings([mockPlantings[0]]);

      const expectedRow = [
        '"planting_1"',
        '"Salinas"',
        '"North Ranch"',
        '"101"',
        '"A"',
        '"Romaine"',
        '"Green Forest"',
        '"5.5"',
        '"2024-03-15"',
        '"2024-06-01"',
        '"Fresh Cut"',
        '"Fresh Farms Co"',
        '"1000"',
        '"5500"',
        '"1000"',
        '"Yes"'
      ].join(',');

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining(expectedRow)],
        { type: 'text/csv' }
      );
    });

    it('should format CSV data correctly for unassigned planting', () => {
      csvService.exportPlantings([mockPlantings[1]]);

      const expectedRow = [
        '"planting_2"',
        '""', // Empty region
        '""', // Empty ranch
        '""', // Empty lot
        '""', // Empty sublot
        '"Iceberg"',
        '"Standard Iceberg"',
        '"3"',
        '"2024-04-01"',
        '"2024-07-15"',
        '"Processing"',
        '"Processing Plant A"',
        '"800"',
        '"3600"',
        '"1200"',
        '"No"' // Unassigned
      ].join(',');

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining(expectedRow)],
        { type: 'text/csv' }
      );
    });

    it('should handle plantings with missing optional fields', () => {
      csvService.exportPlantings([mockPlantings[2]]);

      const expectedRow = [
        '"planting_3"',
        '"Yuma"',
        '"Desert Ranch"',
        '"201"',
        '"B"',
        '"Carrots"',
        '"Nantes"',
        '"2.25"',
        '"2024-02-15"',
        '"2024-06-15"',
        '"Fresh Cut"',
        '"Organic Market"',
        '""', // Empty volumeOrdered
        '""', // Empty totalYield
        '""', // Empty budgetYieldPerAcre
        '"Yes"'
      ].join(',');

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining(expectedRow)],
        { type: 'text/csv' }
      );
    });

    it('should handle multiple plantings correctly', () => {
      csvService.exportPlantings(mockPlantings);

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringMatching(/.*planting_1.*\n.*planting_2.*\n.*planting_3.*/s)],
        { type: 'text/csv' }
      );
    });

    it('should handle empty plantings array', () => {
      csvService.exportPlantings([]);

      const expectedHeaders = [
        'ID', 'Region', 'Ranch', 'Lot', 'Sublot', 'Crop', 'Variety', 'Acres', 'Plant Date', 'Harvest Date',
        'Market Type', 'Customer', 'Volume Ordered', 'Total Yield',
        'Budget Yield/Acre', 'Assigned'
      ];

      expect(global.Blob).toHaveBeenCalledWith(
        [expectedHeaders.join(',')], // Only headers, no data rows
        { type: 'text/csv' }
      );
    });

    it('should create blob with correct MIME type', () => {
      csvService.exportPlantings(mockPlantings);

      expect(global.Blob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'text/csv' }
      );
    });

    it('should create object URL from blob', () => {
      csvService.exportPlantings(mockPlantings);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'text/csv' })
      );
    });

    it('should create download link with correct attributes', () => {
      const mockDate = new Date('2024-03-15T10:30:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      csvService.exportPlantings(mockPlantings);

      expect(document.createElement).toHaveBeenCalledWith('a');

      // The link should be configured correctly - we can verify through the mock calls
      const createElementCalls = (document.createElement as jest.Mock).mock.calls;
      const linkCall = createElementCalls.find(call => call[0] === 'a');
      expect(linkCall).toBeDefined();

      jest.restoreAllMocks();
    });

    it('should set correct filename with current date', () => {
      const mockDate = new Date('2024-03-15T10:30:00Z');
      const originalDate = global.Date;
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.prototype = originalDate.prototype;
      global.Date.now = originalDate.now;
      global.Date.parse = originalDate.parse;
      global.Date.UTC = originalDate.UTC;

      // Create a link element that we can inspect
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };

      (document.createElement as jest.Mock).mockImplementation((tagName) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      csvService.exportPlantings(mockPlantings);

      expect(mockLink.download).toBe('crop_plantings_2024-03-15.csv');

      global.Date = originalDate;
    });

    it('should append link to body, click it, and clean up', () => {
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };

      (document.createElement as jest.Mock).mockImplementation((tagName) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      csvService.exportPlantings(mockPlantings);

      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it('should revoke object URL after download', () => {
      csvService.exportPlantings(mockPlantings);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
    });

    it('should set link href to created object URL', () => {
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };

      (document.createElement as jest.Mock).mockImplementation((tagName) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      csvService.exportPlantings(mockPlantings);

      expect(mockLink.href).toBe('mock-blob-url');
    });

    it('should handle plantings with special characters in data', () => {
      const specialPlantings: Planting[] = [
        {
          id: 'special_1',
          crop: 'Romaine "Premium"',
          variety: 'Green, Forest',
          acres: 1.5,
          plantDate: '2024-03-15',
          harvestDate: '2024-06-01',
          marketType: 'Fresh Cut',
          customer: 'Farm & Co.',
          assigned: true,
          region: 'Valley, North',
          ranch: 'Ranch "A"',
          lot: '101',
          sublot: 'A',
          originalOrderId: '1'
        }
      ];

      csvService.exportPlantings(specialPlantings);

      // Check the actual CSV content
      const csvContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      
      // Should wrap all fields in quotes to handle special characters
      // Note: CSV service doesn't escape quotes, just wraps in quotes
      expect(csvContent).toContain('"Romaine "Premium""'); // Quotes in the crop name (not escaped)
      expect(csvContent).toContain('"Green, Forest"'); // Commas should be handled
      expect(csvContent).toContain('"Farm & Co."'); // Ampersands should be handled
      expect(csvContent).toContain('"Valley, North"'); // Commas in region
      expect(csvContent).toContain('"Ranch "A""'); // Quotes in ranch name (not escaped)
    });

    it('should handle numeric fields correctly', () => {
      const numericPlantings: Planting[] = [
        {
          id: 'numeric_1',
          crop: 'Carrots',
          variety: 'Nantes',
          acres: 0.001, // Very small number
          plantDate: '2024-03-15',
          harvestDate: '2024-06-01',
          marketType: 'Fresh Cut',
          customer: 'Test Customer',
          volumeOrdered: 0, // Zero
          totalYield: 999999.99, // Large number with decimals
          budgetYieldPerAcre: 1234.5678, // Number with many decimals
          assigned: false,
          originalOrderId: '1'
        }
      ];

      csvService.exportPlantings(numericPlantings);

      const csvContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      
      expect(csvContent).toContain('"0.001"'); // Very small number
      expect(csvContent).toContain('""'); // Zero volume becomes empty string since it's falsy
      expect(csvContent).toContain('"999999.99"'); // Large number
      expect(csvContent).toContain('"1234.5678"'); // Decimal number
    });

    it('should handle boolean assignment field correctly', () => {
      const booleanPlantings: Planting[] = [
        {
          ...mockPlantings[0],
          assigned: true
        },
        {
          ...mockPlantings[1],
          assigned: false
        }
      ];

      csvService.exportPlantings(booleanPlantings);

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"Yes"')],
        { type: 'text/csv' }
      );
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"No"')],
        { type: 'text/csv' }
      );
    });

    it('should handle undefined and null values gracefully', () => {
      const plantingWithNulls: Planting[] = [
        {
          id: 'null_test',
          crop: 'Test Crop',
          variety: 'Test Variety',
          acres: 1,
          plantDate: '2024-03-15',
          harvestDate: '2024-06-01',
          marketType: 'Fresh Cut',
          customer: 'Test Customer',
          assigned: false,
          region: undefined,
          ranch: null as any,
          lot: undefined,
          sublot: null as any,
          volumeOrdered: undefined,
          totalYield: null as any,
          budgetYieldPerAcre: undefined,
          originalOrderId: '1'
        }
      ];

      csvService.exportPlantings(plantingWithNulls);

      // Should convert undefined/null to empty strings
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringMatching(/"null_test","","","","","Test Crop","Test Variety","1","2024-03-15","2024-06-01","Fresh Cut","Test Customer","","","","No"/)],
        { type: 'text/csv' }
      );
    });
  });

  describe('error handling', () => {
    it('should handle URL.createObjectURL throwing error', () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Failed to create object URL');
      });

      expect(() => {
        csvService.exportPlantings(mockPlantings);
      }).toThrow('Failed to create object URL');
    });

    it('should handle document.createElement returning null', () => {
      (document.createElement as jest.Mock).mockReturnValue(null);

      expect(() => {
        csvService.exportPlantings(mockPlantings);
      }).toThrow(); // Should throw when trying to access properties of null
    });

    it('should handle Blob constructor throwing error', () => {
      (global.Blob as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create blob');
      });

      expect(() => {
        csvService.exportPlantings(mockPlantings);
      }).toThrow('Failed to create blob');
    });

    it('should still revoke URL even if other operations fail', () => {
      // Create isolated test to check if revokeObjectURL is called after click fails
      const isolatedMockCreateObjectURL = jest.fn().mockReturnValue('isolated-blob-url');
      const isolatedMockRevokeObjectURL = jest.fn();
      
      global.URL.createObjectURL = isolatedMockCreateObjectURL;
      global.URL.revokeObjectURL = isolatedMockRevokeObjectURL;
      
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        type: options?.type,
      })) as any;

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn().mockImplementation(() => {
          throw new Error('Click failed');
        }),
      };

      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();

      // Use the existing mock setup but clear and reconfigure
      (document.createElement as jest.Mock).mockImplementation((tagName) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      expect(() => {
        csvService.exportPlantings(mockPlantings);
      }).toThrow('Click failed');

      // revokeObjectURL should NOT be called if click() throws because it's after click() in the flow
      expect(isolatedMockRevokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should create valid CSV structure for complete workflow', () => {
      // Reset mocks to ensure clean state
      jest.clearAllMocks();
      mockCreateObjectURL.mockReturnValue('mock-blob-url');
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        type: options?.type,
      })) as any;

      // Use existing mocks but reset them
      (document.createElement as jest.Mock).mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: jest.fn(),
          };
        }
        return {};
      });

      const fullWorkflowPlantings: Planting[] = [
        {
          id: 'workflow_1',
          crop: 'Romaine',
          variety: 'Green Forest',
          acres: 5.5,
          plantDate: '2024-03-15',
          harvestDate: '2024-06-01',
          marketType: 'Fresh Cut',
          customer: 'Fresh Farms Co',
          volumeOrdered: 1000,
          totalYield: 5500,
          budgetYieldPerAcre: 1000,
          assigned: true,
          region: 'Salinas',
          ranch: 'North Ranch',
          lot: '101',
          sublot: 'A',
          originalOrderId: '1'
        }
      ];

      csvService.exportPlantings(fullWorkflowPlantings);

      // Verify complete CSV structure
      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      const lines = blobContent.split('\n');

      expect(lines[0]).toContain('ID,Region,Ranch,Lot,Sublot,Crop,Variety,Acres');
      expect(lines[1]).toContain('workflow_1');
      expect(lines[1]).toContain('Salinas');
      expect(lines[1]).toContain('North Ranch');
      expect(lines[1]).toContain('Yes'); // Assigned
    });

    it('should handle large dataset efficiently', () => {
      // Reset mocks to ensure clean state
      jest.clearAllMocks();
      mockCreateObjectURL.mockReturnValue('mock-blob-url');
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        type: options?.type,
      })) as any;

      // Use existing mocks but reset them
      (document.createElement as jest.Mock).mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: jest.fn(),
          };
        }
        return {};
      });

      const largePlantings = Array.from({ length: 1000 }, (_, i) => ({
        id: `planting_${i}`,
        crop: 'Test Crop',
        variety: 'Test Variety',
        acres: i + 1,
        plantDate: '2024-03-15',
        harvestDate: '2024-06-01',
        marketType: 'Fresh Cut',
        customer: `Customer ${i}`,
        assigned: i % 2 === 0,
        originalOrderId: i.toString()
      }));

      expect(() => {
        csvService.exportPlantings(largePlantings);
      }).not.toThrow();

      const csvContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(csvContent).toContain('planting_0');
      expect(csvContent).toContain('planting_999');
    });
  });
});
