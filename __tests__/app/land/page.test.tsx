import React from 'react';
import { render } from '@testing-library/react';
import LandPage from '@/app/land/page';
import { useAppContext } from '@/components/layout';

// Mock the LandFeature component
jest.mock('@/components/land', () => ({
  LandFeature: ({ landStructure, plantings, dragHandlers, landManagement, splitNotification, recombineNotification, optimizationResults, isOptimizing }: any) => (
    <div data-testid="land-feature">
      <div data-testid="land-structure">{landStructure ? 'has-structure' : 'no-structure'}</div>
      <div data-testid="plantings-count">{plantings ? plantings.length : 0}</div>
      <div data-testid="has-drag-handlers">{dragHandlers ? 'true' : 'false'}</div>
      <div data-testid="has-land-management">{landManagement ? 'true' : 'false'}</div>
      <div data-testid="split-notification">{splitNotification ? 'has-split' : 'no-split'}</div>
      <div data-testid="recombine-notification">{recombineNotification ? 'has-recombine' : 'no-recombine'}</div>
      <div data-testid="optimization-results">{optimizationResults ? 'has-results' : 'no-results'}</div>
      <div data-testid="is-optimizing">{isOptimizing ? 'optimizing' : 'not-optimizing'}</div>
    </div>
  ),
}));

// Mock the useAppContext hook
jest.mock('@/components/layout', () => ({
  useAppContext: jest.fn(),
}));

const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

describe('LandPage', () => {
  const mockContextValue = {
    landStructure: { regions: [] },
    plantings: [
      { id: '1', landBlockId: 'block1', variety: 'variety1', plantingDate: '2024-01-01', harvestDate: '2024-03-01' },
      { id: '2', landBlockId: 'block2', variety: 'variety2', plantingDate: '2024-01-15', harvestDate: '2024-03-15' }
    ],
    dragHandlers: {
      onDragStart: jest.fn(),
      onDragEnd: jest.fn(),
    },
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
    // Required properties for context
    orders: [],
    commodities: [],
    landBlocks: [],
    notifications: [],
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
  };

  beforeEach(() => {
    mockUseAppContext.mockReturnValue(mockContextValue);
    jest.clearAllMocks();
  });

  it('should render LandFeature with correct props', () => {
    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('land-feature')).toBeInTheDocument();
    expect(getByTestId('land-structure')).toHaveTextContent('has-structure');
    expect(getByTestId('plantings-count')).toHaveTextContent('2');
  });

  it('should pass landStructure from context', () => {
    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('land-structure')).toHaveTextContent('has-structure');
  });

  it('should pass plantings from context', () => {
    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('plantings-count')).toHaveTextContent('2');
  });

  it('should pass dragHandlers from context', () => {
    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('has-drag-handlers')).toHaveTextContent('true');
  });

  it('should create landManagement object with all required functions', () => {
    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('has-land-management')).toHaveTextContent('true');
  });

  it('should pass notification states from context', () => {
    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('split-notification')).toHaveTextContent('no-split');
    expect(getByTestId('recombine-notification')).toHaveTextContent('no-recombine');
  });

  it('should pass optimization states from context', () => {
    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('optimization-results')).toHaveTextContent('no-results');
    expect(getByTestId('is-optimizing')).toHaveTextContent('not-optimizing');
  });

  it('should handle when splitNotification is present', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      splitNotification: { message: 'Split notification' },
    });

    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('split-notification')).toHaveTextContent('has-split');
  });

  it('should handle when optimization is in progress', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      isOptimizing: true,
      optimizationResults: { improved: 5, total: 10 },
    });

    const { getByTestId } = render(<LandPage />);
    
    expect(getByTestId('is-optimizing')).toHaveTextContent('optimizing');
    expect(getByTestId('optimization-results')).toHaveTextContent('has-results');
  });

  it('should call useAppContext hook', () => {
    render(<LandPage />);
    
    expect(mockUseAppContext).toHaveBeenCalledTimes(1);
  });
});
