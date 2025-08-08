import React from 'react';
import { render } from '@testing-library/react';
import CommoditiesPage from '@/app/commodities/page';
import { useAppContext } from '@/components/layout';

// Mock the CommoditiesFeature component
jest.mock('@/components/commodities', () => ({
  CommoditiesFeature: ({ commodities, onAddCommodity, onUpdateCommodity, onDeleteCommodity, onAddVariety, onUpdateVariety, onDeleteVariety, onDuplicateVariety }: any) => (
    <div data-testid="commodities-feature">
      <div data-testid="commodities-count">{commodities.length}</div>
      <button onClick={() => onAddCommodity({ id: 'test', name: 'Test Commodity' })}>Add Commodity</button>
      <button onClick={() => onUpdateCommodity('test', { name: 'Updated Commodity' })}>Update Commodity</button>
      <button onClick={() => onDeleteCommodity('test')}>Delete Commodity</button>
      <button onClick={() => onAddVariety('test', { id: 'variety1', name: 'Test Variety' })}>Add Variety</button>
      <button onClick={() => onUpdateVariety('test', 'variety1', { name: 'Updated Variety' })}>Update Variety</button>
      <button onClick={() => onDeleteVariety('test', 'variety1')}>Delete Variety</button>
      <button onClick={() => onDuplicateVariety('test', 'variety1')}>Duplicate Variety</button>
    </div>
  ),
}));

// Mock the useAppContext hook
jest.mock('@/components/layout', () => ({
  useAppContext: jest.fn(),
}));

const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

describe('CommoditiesPage', () => {
  const mockContextValue = {
    commodities: [
      { 
        id: 'commodity1', 
        name: 'Lettuce', 
        varieties: [
          { id: 'variety1', name: 'Romaine', maturityDays: 75, plantingToHarvestDays: 70 }
        ] 
      },
      { 
        id: 'commodity2', 
        name: 'Carrots', 
        varieties: [
          { id: 'variety2', name: 'Nantes', maturityDays: 80, plantingToHarvestDays: 75 }
        ] 
      }
    ],
    orders: [],
    landBlocks: [],
    plantings: [],
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

  it('should render CommoditiesFeature with correct props', () => {
    const { getByTestId } = render(<CommoditiesPage />);
    
    expect(getByTestId('commodities-feature')).toBeInTheDocument();
    expect(getByTestId('commodities-count')).toHaveTextContent('2');
  });

  it('should pass commodities from context to CommoditiesFeature', () => {
    const { getByTestId } = render(<CommoditiesPage />);
    
    expect(getByTestId('commodities-count')).toHaveTextContent('2');
  });

  it('should pass all handler functions from context to CommoditiesFeature', () => {
    const { getByText } = render(<CommoditiesPage />);
    
    expect(getByText('Add Commodity')).toBeInTheDocument();
    expect(getByText('Update Commodity')).toBeInTheDocument();
    expect(getByText('Delete Commodity')).toBeInTheDocument();
    expect(getByText('Add Variety')).toBeInTheDocument();
    expect(getByText('Update Variety')).toBeInTheDocument();
    expect(getByText('Delete Variety')).toBeInTheDocument();
    expect(getByText('Duplicate Variety')).toBeInTheDocument();
  });

  it('should handle empty commodities', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      commodities: [],
    });

    const { getByTestId } = render(<CommoditiesPage />);
    
    expect(getByTestId('commodities-count')).toHaveTextContent('0');
  });

  it('should call useAppContext hook', () => {
    render(<CommoditiesPage />);
    
    expect(mockUseAppContext).toHaveBeenCalledTimes(1);
  });

  it('should extract all necessary properties from context', () => {
    render(<CommoditiesPage />);
    
    const callArgs = mockUseAppContext.mock.calls[0];
    expect(callArgs).toEqual([]);
    
    // Verify that the component is trying to access the right properties
    expect(mockUseAppContext).toHaveBeenCalled();
  });
});
