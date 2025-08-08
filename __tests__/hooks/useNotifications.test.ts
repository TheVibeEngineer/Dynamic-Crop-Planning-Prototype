import { renderHook, act } from '@testing-library/react';
import { 
  useSplitNotifications, 
  useOptimizationResults, 
  useRecombineNotifications 
} from '@/hooks/useNotifications';

describe('useSplitNotifications', () => {
  it('should initialize with null split notification', () => {
    const { result } = renderHook(() => useSplitNotifications());

    expect(result.current.splitNotification).toBeNull();
    expect(result.current.showSplitNotification).toBeDefined();
    expect(result.current.clearSplitNotification).toBeDefined();
  });

  it('should show split notification', () => {
    const { result } = renderHook(() => useSplitNotifications());

    const mockNotification = {
      id: 'test-split',
      type: 'split' as const,
      message: 'Planting split successfully',
      details: {
        originalPlanting: 'Original Planting',
        newPlanting: 'New Planting',
        splitAcres: 25
      }
    };

    act(() => {
      result.current.showSplitNotification(mockNotification);
    });

    expect(result.current.splitNotification).toEqual(mockNotification);
  });

  it('should clear split notification', () => {
    const { result } = renderHook(() => useSplitNotifications());

    const mockNotification = {
      id: 'test-split',
      type: 'split' as const,
      message: 'Planting split successfully',
      details: {
        originalPlanting: 'Original Planting',
        newPlanting: 'New Planting',
        splitAcres: 25
      }
    };

    // First show a notification
    act(() => {
      result.current.showSplitNotification(mockNotification);
    });

    expect(result.current.splitNotification).toEqual(mockNotification);

    // Then clear it
    act(() => {
      result.current.clearSplitNotification();
    });

    expect(result.current.splitNotification).toBeNull();
  });

  it('should update split notification when new one is shown', () => {
    const { result } = renderHook(() => useSplitNotifications());

    const firstNotification = {
      id: 'first-split',
      type: 'split' as const,
      message: 'First split',
      details: {
        originalPlanting: 'First Original',
        newPlanting: 'First New',
        splitAcres: 10
      }
    };

    const secondNotification = {
      id: 'second-split',
      type: 'split' as const,
      message: 'Second split',
      details: {
        originalPlanting: 'Second Original',
        newPlanting: 'Second New',
        splitAcres: 20
      }
    };

    act(() => {
      result.current.showSplitNotification(firstNotification);
    });

    expect(result.current.splitNotification).toEqual(firstNotification);

    act(() => {
      result.current.showSplitNotification(secondNotification);
    });

    expect(result.current.splitNotification).toEqual(secondNotification);
  });
});

describe('useOptimizationResults', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOptimizationResults());

    expect(result.current.optimizationResults).toBeNull();
    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.setIsOptimizing).toBeDefined();
    expect(result.current.showOptimizationResults).toBeDefined();
    expect(result.current.clearOptimizationResults).toBeDefined();
  });

  it('should show optimization results', () => {
    const { result } = renderHook(() => useOptimizationResults());

    const mockResults = {
      improved: 8,
      total: 10,
      savings: 150,
      details: [
        { plantingId: '1', improvement: 'Better land utilization', savingsAcres: 5 },
        { plantingId: '2', improvement: 'Reduced conflicts', savingsAcres: 3 }
      ]
    };

    act(() => {
      result.current.showOptimizationResults(mockResults);
    });

    expect(result.current.optimizationResults).toEqual(mockResults);
  });

  it('should clear optimization results', () => {
    const { result } = renderHook(() => useOptimizationResults());

    const mockResults = {
      improved: 5,
      total: 8,
      savings: 100,
      details: []
    };

    // First show results
    act(() => {
      result.current.showOptimizationResults(mockResults);
    });

    expect(result.current.optimizationResults).toEqual(mockResults);

    // Then clear them
    act(() => {
      result.current.clearOptimizationResults();
    });

    expect(result.current.optimizationResults).toBeNull();
  });

  it('should set optimization status', () => {
    const { result } = renderHook(() => useOptimizationResults());

    expect(result.current.isOptimizing).toBe(false);

    act(() => {
      result.current.setIsOptimizing(true);
    });

    expect(result.current.isOptimizing).toBe(true);

    act(() => {
      result.current.setIsOptimizing(false);
    });

    expect(result.current.isOptimizing).toBe(false);
  });

  it('should handle multiple optimization result updates', () => {
    const { result } = renderHook(() => useOptimizationResults());

    const firstResults = {
      improved: 3,
      total: 5,
      savings: 50,
      details: []
    };

    const secondResults = {
      improved: 7,
      total: 10,
      savings: 120,
      details: []
    };

    act(() => {
      result.current.showOptimizationResults(firstResults);
    });

    expect(result.current.optimizationResults).toEqual(firstResults);

    act(() => {
      result.current.showOptimizationResults(secondResults);
    });

    expect(result.current.optimizationResults).toEqual(secondResults);
  });
});

describe('useRecombineNotifications', () => {
  it('should initialize with null recombine notification', () => {
    const { result } = renderHook(() => useRecombineNotifications());

    expect(result.current.recombineNotification).toBeNull();
    expect(result.current.showRecombineNotification).toBeDefined();
    expect(result.current.clearRecombineNotification).toBeDefined();
  });

  it('should show recombine notification', () => {
    const { result } = renderHook(() => useRecombineNotifications());

    const mockNotification = {
      id: 'test-recombine',
      type: 'recombine',
      message: 'Plantings recombined successfully',
      details: {
        combinedPlantings: ['planting1', 'planting2'],
        totalAcres: 50,
        newPlantingId: 'combined-planting'
      }
    };

    act(() => {
      result.current.showRecombineNotification(mockNotification);
    });

    expect(result.current.recombineNotification).toEqual(mockNotification);
  });

  it('should clear recombine notification', () => {
    const { result } = renderHook(() => useRecombineNotifications());

    const mockNotification = {
      id: 'test-recombine',
      type: 'recombine',
      message: 'Plantings recombined',
      details: {}
    };

    // First show a notification
    act(() => {
      result.current.showRecombineNotification(mockNotification);
    });

    expect(result.current.recombineNotification).toEqual(mockNotification);

    // Then clear it
    act(() => {
      result.current.clearRecombineNotification();
    });

    expect(result.current.recombineNotification).toBeNull();
  });

  it('should handle different types of recombine notifications', () => {
    const { result } = renderHook(() => useRecombineNotifications());

    const notification1 = { id: '1', message: 'First recombine' };
    const notification2 = { id: '2', message: 'Second recombine' };

    act(() => {
      result.current.showRecombineNotification(notification1);
    });

    expect(result.current.recombineNotification).toEqual(notification1);

    act(() => {
      result.current.showRecombineNotification(notification2);
    });

    expect(result.current.recombineNotification).toEqual(notification2);
  });

  it('should handle null and undefined notifications', () => {
    const { result } = renderHook(() => useRecombineNotifications());

    act(() => {
      result.current.showRecombineNotification(null);
    });

    expect(result.current.recombineNotification).toBeNull();

    act(() => {
      result.current.showRecombineNotification(undefined);
    });

    expect(result.current.recombineNotification).toBeUndefined();
  });
});
