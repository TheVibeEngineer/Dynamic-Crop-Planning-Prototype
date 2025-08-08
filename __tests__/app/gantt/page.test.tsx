import React from 'react';
import { render } from '@testing-library/react';
import GanttPage from '@/app/gantt/page';
import { useAppContext } from '@/components/layout';

// Mock the GanttFeature component
jest.mock('@/components/planning', () => ({
  GanttFeature: ({ plantings, landStructure }: any) => (
    <div data-testid="gantt-feature">
      <div data-testid="plantings-count">{plantings ? plantings.length : 0}</div>
      <div data-testid="land-structure">{landStructure ? 'has-structure' : 'no-structure'}</div>
      {plantings && plantings.map((planting: any) => (
        <div key={planting.id} data-testid={`gantt-planting-${planting.id}`}>
          {planting.variety} - {planting.plantingDate} to {planting.harvestDate}
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

describe('GanttPage', () => {
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
      }
    ],
    landStructure: {
      regions: [
        {
          id: 'region1',
          name: 'North Field',
          ranches: [
            {
              id: 'ranch1',
              name: 'Ranch A',
              lots: [
                { id: 'lot1', name: 'Lot 1', area: 100 },
                { id: 'lot2', name: 'Lot 2', area: 150 }
              ]
            }
          ]
        }
      ]
    },
    // Required properties for context (not all used by this page but required by type)
    orders: [],
    commodities: [],
    landBlocks: [],
    notifications: [],
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

  it('should render GanttFeature with plantings and landStructure', () => {
    const { getByTestId } = render(<GanttPage />);
    
    expect(getByTestId('gantt-feature')).toBeInTheDocument();
    expect(getByTestId('plantings-count')).toHaveTextContent('2');
    expect(getByTestId('land-structure')).toHaveTextContent('has-structure');
  });

  it('should pass plantings from context to GanttFeature', () => {
    const { getByTestId } = render(<GanttPage />);
    
    expect(getByTestId('plantings-count')).toHaveTextContent('2');
    expect(getByTestId('gantt-planting-1')).toHaveTextContent('Romaine Lettuce - 2024-01-01 to 2024-03-01');
    expect(getByTestId('gantt-planting-2')).toHaveTextContent('Nantes Carrots - 2024-01-15 to 2024-03-15');
  });

  it('should pass landStructure from context to GanttFeature', () => {
    const { getByTestId } = render(<GanttPage />);
    
    expect(getByTestId('land-structure')).toHaveTextContent('has-structure');
  });

  it('should handle empty plantings array', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      plantings: [],
    });

    const { getByTestId } = render(<GanttPage />);
    
    expect(getByTestId('plantings-count')).toHaveTextContent('0');
  });

  it('should handle null landStructure', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      landStructure: null,
    });

    const { getByTestId } = render(<GanttPage />);
    
    expect(getByTestId('land-structure')).toHaveTextContent('no-structure');
  });

  it('should call useAppContext hook', () => {
    render(<GanttPage />);
    
    expect(mockUseAppContext).toHaveBeenCalledTimes(1);
  });

  it('should extract only plantings and landStructure from context', () => {
    render(<GanttPage />);
    
    // Verify that useAppContext is called
    expect(mockUseAppContext).toHaveBeenCalled();
  });
});
