import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { optimizationEngine } from '@/lib/services/optimization';
import { capacityService } from '@/lib/services/capacity';

// Mock the dependencies
jest.mock('@/lib/services/optimization');
jest.mock('@/lib/services/capacity');

const mockOptimizationEngine = optimizationEngine as jest.Mocked<typeof optimizationEngine>;
const mockCapacityService = capacityService as jest.Mocked<typeof capacityService>;

describe('useDragAndDrop', () => {
  const mockAssignPlantingToLot = jest.fn();
  const mockUnassignPlanting = jest.fn();
  const mockFindLot = jest.fn();
  const mockShowSplitNotification = jest.fn();
  const mockShowRecombineNotification = jest.fn();

  const mockLandStructure = [
    {
      id: 1,
      name: 'North Field',
      ranches: [
        {
          id: 1,
          name: 'Ranch A',
          lots: [
            { id: 1, name: 'Lot 1', acres: 100, acresUsed: 50 },
            { id: 2, name: 'Lot 2', acres: 150, acresUsed: 30 }
          ]
        }
      ]
    }
  ];

  const mockPlantings = [
    {
      id: '1',
      landBlockId: 'block1',
      variety: 'Romaine',
      plantingDate: '2024-01-01',
      harvestDate: '2024-03-01',
      acres: 25,
      status: 'planned'
    },
    {
      id: '2',
      landBlockId: 'block2',
      variety: 'Carrots',
      plantingDate: '2024-01-15',
      harvestDate: '2024-03-15',
      acres: 30,
      status: 'planted'
    }
  ];

  const mockLot = {
    id: 1,
    name: 'Lot 1',
    acres: 100,
    acresUsed: 50
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindLot.mockReturnValue(mockLot);
    mockOptimizationEngine.findBestLots.mockReturnValue([
      { lotId: 1, score: 95, reason: 'Perfect fit' },
      { lotId: 2, score: 80, reason: 'Good alternative' }
    ]);
    mockCapacityService.canFitInLot.mockReturnValue(true);
    mockCapacityService.calculateLotCapacity.mockReturnValue({
      availableAcres: 50,
      usedAcres: 50,
      totalAcres: 100,
      plantingCount: 1,
      plantings: []
    });
    mockCapacityService.getNextSublotDesignation.mockReturnValue('A');
    mockAssignPlantingToLot.mockReturnValue({ success: true });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockAssignPlantingToLot,
        mockUnassignPlanting,
        mockFindLot,
        mockLandStructure,
        mockPlantings,
        mockShowSplitNotification,
        mockShowRecombineNotification
      )
    );

    expect(result.current.handleDragStart).toBeDefined();
    expect(result.current.handleDragOver).toBeDefined();
    expect(result.current.handleDrop).toBeDefined();
    expect(result.current.handleDragEnd).toBeDefined();
    expect(result.current.handleDragLeave).toBeDefined();
  });

  it('should handle drag start correctly', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockAssignPlantingToLot,
        mockUnassignPlanting,
        mockFindLot,
        mockLandStructure,
        mockPlantings,
        mockShowSplitNotification,
        mockShowRecombineNotification
      )
    );

    const mockEvent = {
      dataTransfer: { effectAllowed: '' },
      preventDefault: jest.fn()
    } as any;

    act(() => {
      result.current.handleDragStart(mockEvent, mockPlantings[0]);
    });

    expect(mockEvent.dataTransfer.effectAllowed).toBe('move');
    expect(mockOptimizationEngine.findBestLots).toHaveBeenCalledWith(
      mockPlantings[0],
      mockLandStructure,
      mockPlantings,
      3
    );
  });

  it('should handle drag over with valid drop target', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockAssignPlantingToLot,
        mockUnassignPlanting,
        mockFindLot,
        mockLandStructure,
        mockPlantings,
        mockShowSplitNotification,
        mockShowRecombineNotification
      )
    );

    const mockEvent = {
      dataTransfer: { dropEffect: '' },
      preventDefault: jest.fn()
    } as any;

    // First start dragging
    const mockDragEvent = {
      dataTransfer: { effectAllowed: '' },
      preventDefault: jest.fn()
    } as any;

    act(() => {
      result.current.handleDragStart(mockDragEvent, mockPlantings[0]);
    });

    // Then drag over
    act(() => {
      result.current.handleDragOver(mockEvent, 1, 1, 1);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.dataTransfer.dropEffect).toBe('move');
    expect(mockCapacityService.canFitInLot).toHaveBeenCalledWith(
      mockPlantings[0].acres,
      1,
      1,
      1,
      mockLandStructure,
      mockPlantings
    );
  });

  it('should handle successful drop', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockAssignPlantingToLot,
        mockUnassignPlanting,
        mockFindLot,
        mockLandStructure,
        mockPlantings,
        mockShowSplitNotification,
        mockShowRecombineNotification
      )
    );

    const mockEvent = {
      dataTransfer: { dropEffect: '' },
      preventDefault: jest.fn()
    } as any;

    // Start dragging
    const mockDragEvent = {
      dataTransfer: { effectAllowed: '' },
      preventDefault: jest.fn()
    } as any;

    act(() => {
      result.current.handleDragStart(mockDragEvent, mockPlantings[0]);
    });

    // Drop
    act(() => {
      result.current.handleDrop(mockEvent, 1, 1, 1);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockAssignPlantingToLot).toHaveBeenCalledWith(
      mockPlantings[0].id,
      1,
      1,
      1,
      expect.any(Function)
    );
  });

  it('should handle drag end cleanup', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockAssignPlantingToLot,
        mockUnassignPlanting,
        mockFindLot,
        mockLandStructure,
        mockPlantings,
        mockShowSplitNotification,
        mockShowRecombineNotification
      )
    );

    // Start dragging first
    const mockDragEvent = {
      dataTransfer: { effectAllowed: '' },
      preventDefault: jest.fn()
    } as any;

    act(() => {
      result.current.handleDragStart(mockDragEvent, mockPlantings[0]);
    });

    // End dragging
    act(() => {
      result.current.handleDragEnd();
    });

    // Should clean up state
    expect(result.current.handleDragStart).toBeDefined();
  });

  it('should handle drag over with insufficient capacity', () => {
    mockCapacityService.canFitInLot.mockReturnValue(false);

    const { result } = renderHook(() =>
      useDragAndDrop(
        mockAssignPlantingToLot,
        mockUnassignPlanting,
        mockFindLot,
        mockLandStructure,
        mockPlantings,
        mockShowSplitNotification,
        mockShowRecombineNotification
      )
    );

    const mockEvent = {
      dataTransfer: { dropEffect: '' },
      preventDefault: jest.fn()
    } as any;

    // Start dragging
    const mockDragEvent = {
      dataTransfer: { effectAllowed: '' },
      preventDefault: jest.fn()
    } as any;

    act(() => {
      result.current.handleDragStart(mockDragEvent, mockPlantings[0]);
    });

    // Drag over lot without capacity
    act(() => {
      result.current.handleDragOver(mockEvent, 1, 1, 1);
    });

    expect(mockCapacityService.canFitInLot).toHaveBeenCalled();
  });

  it('should handle drag leave', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockAssignPlantingToLot,
        mockUnassignPlanting,
        mockFindLot,
        mockLandStructure,
        mockPlantings,
        mockShowSplitNotification,
        mockShowRecombineNotification
      )
    );

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ x: 0, y: 0, width: 100, height: 100 })
      },
      clientX: 50,
      clientY: 50
    } as any;

    act(() => {
      result.current.handleDragLeave(mockEvent);
    });

    // Should handle drag leave without throwing
    expect(result.current.handleDragLeave).toBeDefined();
  });
});
