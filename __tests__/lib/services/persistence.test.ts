// =============================================================================
// PERSISTENCE SERVICE TEST SUITE
// =============================================================================

import { persistenceService } from '../../../lib/services/persistence';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe('Persistence Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock window and localStorage to exist
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: localStorageMock,
      },
      writable: true,
      configurable: true,
    });

    // Also set it on global for the localStorage checks
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('save', () => {
    it('should save data to localStorage successfully', () => {
      localStorageMock.setItem.mockImplementation(() => {});
      
      const testData = { name: 'test', value: 123 };
      const result = persistenceService.save('testKey', testData);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(testData));
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const result = persistenceService.save('testKey', {});
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save testKey to localStorage:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should return false when window is undefined (SSR)', () => {
      // Remove window to simulate SSR
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      const result = persistenceService.save('testKey', {});
      
      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('should load data from localStorage successfully', () => {
      const testData = { name: 'test', value: 123 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));
      
      const result = persistenceService.load('testKey', {});
      
      expect(result).toEqual(testData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
    });

    it('should return default value when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const defaultValue = { default: true };
      
      const result = persistenceService.load('testKey', defaultValue);
      
      expect(result).toEqual(defaultValue);
    });

    it('should return default value when JSON parsing fails', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue('invalid json {');
      const defaultValue = { default: true };
      
      const result = persistenceService.load('testKey', defaultValue);
      
      expect(result).toEqual(defaultValue);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load testKey from localStorage:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should return default value when window is undefined (SSR)', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const defaultValue = { default: true };
      
      const result = persistenceService.load('testKey', defaultValue);
      
      expect(result).toEqual(defaultValue);
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear data from localStorage successfully', () => {
      localStorageMock.removeItem.mockImplementation(() => {});
      
      const result = persistenceService.clear('testKey');
      
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('testKey');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Failed to remove');
      });
      
      const result = persistenceService.clear('testKey');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear testKey from localStorage:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should return false when window is undefined (SSR)', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      const result = persistenceService.clear('testKey');
      
      expect(result).toBe(false);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    it('should clear all application data keys', () => {
      const clearSpy = jest.spyOn(persistenceService, 'clear').mockReturnValue(true);
      
      persistenceService.clearAll();
      
      expect(clearSpy).toHaveBeenCalledTimes(5);
      expect(clearSpy).toHaveBeenCalledWith('cropPlanning_orders');
      expect(clearSpy).toHaveBeenCalledWith('cropPlanning_commodities');
      expect(clearSpy).toHaveBeenCalledWith('cropPlanning_landStructure');
      expect(clearSpy).toHaveBeenCalledWith('cropPlanning_plantings');
      expect(clearSpy).toHaveBeenCalledWith('cropPlanning_activeTab');
      
      clearSpy.mockRestore();
    });
  });
});
