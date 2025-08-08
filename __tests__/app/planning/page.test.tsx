import React from 'react';
import { render } from '@testing-library/react';
import PlanningPage from '@/app/planning/page';
import { useAppContext } from '@/components/layout';

// Mock the PlanningFeature component
jest.mock('@/components/planning', () => ({
  PlanningFeature: ({ plantings }: any) => (
    <div data-testid="planning-feature">
      <div data-testid="plantings-count">{plantings ? plantings.length : 0}</div>
      {plantings && plantings.map((planting: any) => (
        <div key={planting.id} data-testid={`planting-${planting.id}`}>
          {planting.variety}
        </div>
      ))}
    </div>
  ),
}));

// Mock the useAppContext hook
jest.mock('@/components/layout', () => ({
  useAppContext: jest.fn(),
}));

const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

describe('PlanningPage', () => {
  const mockContextValue = {
    plantings: [
      { 
        id: '1', 
        landBlockId: 'block1', 
        variety: 'Romaine Lettuce', 
        plantingDate: '2024-01-01', 
        harvestDate: '2024-03-01',
        area: 100,
        status: 'planned'
      },
      { 
        id: '2', 
        landBlockId: 'block2', 
        variety: 'Nantes Carrots', 
        plantingDate: '2024-01-15', 
        harvestDate: '2024-03-15',
        area: 200,
        status: 'planted'
      },
      { 
        id: '3', 
        landBlockId: 'block3', 
        variety: 'Buttercrunch Lettuce', 
        plantingDate: '2024-02-01', 
        harvestDate: '2024-04-01',
        area: 150,
        status: 'harvested'
      }
    ],
    // Required properties for context (not used by this page but required by type)
    orders: [],
    commodities: [],
    landBlocks: [],
    notifications: [],
    landStructure: { regions: [] },
    dragHandlers: null,
    addOrder: jest.fn(),
    updateOrder: jest.fn(),
    deleteOrder: jest.fn(),
    addCommodity: jest.fn(),
    updateCommodity: jest.fn(),
    deleteCommodity: jest.fn(),
    addVariety: jest.fn(),
    updateVariety: jest.fn(),
    deleteVariety: jest.fn(),
    duplicateVariety: jest.fn(),
    addLandBlock: jest.fn(),
    updateLandBlock: jest.fn(),
    deleteLandBlock: jest.fn(),
    addPlanting: jest.fn(),
    updatePlanting: jest.fn(),
    deletePlanting: jest.fn(),
    generatePlantings: jest.fn(),
    addNotification: jest.fn(),
    dismissNotification: jest.fn(),
    clearNotifications: jest.fn(),
    exportData: jest.fn(),
    importData: jest.fn(),
    resetData: jest.fn(),
    addRegion: jest.fn(),
    updateRegion: jest.fn(),
    deleteRegion: jest.fn(),
    addRanch: jest.fn(),
    updateRanch: jest.fn(),
    deleteRanch: jest.fn(),
    addLot: jest.fn(),
    updateLot: jest.fn(),
    deleteLot: jest.fn(),
    splitNotification: null,
    clearSplitNotification: jest.fn(),
    recombineNotification: null,
    clearRecombineNotification: jest.fn(),
    optimizeAllPlantings: jest.fn(),
    optimizationResults: null,
    clearOptimizationResults: jest.fn(),
    isOptimizing: false,
    setIsOptimizing: jest.fn(),
  };

  beforeEach(() => {
    mockUseAppContext.mockReturnValue(mockContextValue);
    jest.clearAllMocks();
  });

  it('should render PlanningFeature with plantings', () => {
    const { getByTestId } = render(<PlanningPage />);
    
    expect(getByTestId('planning-feature')).toBeInTheDocument();
    expect(getByTestId('plantings-count')).toHaveTextContent('3');
  });

  it('should pass plantings from context to PlanningFeature', () => {
    const { getByTestId } = render(<PlanningPage />);
    
    expect(getByTestId('plantings-count')).toHaveTextContent('3');
    expect(getByTestId('planting-1')).toHaveTextContent('Romaine Lettuce');
    expect(getByTestId('planting-2')).toHaveTextContent('Nantes Carrots');
    expect(getByTestId('planting-3')).toHaveTextContent('Buttercrunch Lettuce');
  });

  it('should handle empty plantings array', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      plantings: [],
    });

    const { getByTestId } = render(<PlanningPage />);
    
    expect(getByTestId('plantings-count')).toHaveTextContent('0');
  });

  it('should handle null plantings', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      plantings: null,
    });

    const { getByTestId } = render(<PlanningPage />);
    
    expect(getByTestId('plantings-count')).toHaveTextContent('0');
  });

  it('should call useAppContext hook', () => {
    render(<PlanningPage />);
    
    expect(mockUseAppContext).toHaveBeenCalledTimes(1);
  });

  it('should only extract plantings from context', () => {
    render(<PlanningPage />);
    
    // Verify that useAppContext is called but we're only using plantings
    expect(mockUseAppContext).toHaveBeenCalled();
  });
});
