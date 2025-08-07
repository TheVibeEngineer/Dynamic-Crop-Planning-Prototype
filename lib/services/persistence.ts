// =============================================================================
// PERSISTENCE SERVICE - Data Storage Layer
// =============================================================================

export const persistenceService = {
  // Save data to localStorage with error handling
  save: (key: string, data: any): boolean => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  },

  // Load data from localStorage with validation
  load: (key: string, defaultValue: any): any => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return defaultValue;
      
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  // Clear specific data
  clear: (key: string): boolean => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to clear ${key} from localStorage:`, error);
      return false;
    }
  },

  // Clear all app data
  clearAll: () => {
    const keys = ['cropPlanning_orders', 'cropPlanning_commodities', 'cropPlanning_landStructure', 
                  'cropPlanning_plantings', 'cropPlanning_activeTab'];
    keys.forEach(key => persistenceService.clear(key));
  }
};
