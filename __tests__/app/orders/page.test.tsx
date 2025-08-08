import React from 'react';
import { render } from '@testing-library/react';
import OrdersPage from '@/app/orders/page';
import { useAppContext } from '@/components/layout';

// Mock the OrdersFeature component
jest.mock('@/components/orders', () => ({
  OrdersFeature: ({ orders, onAddOrder, onUpdateOrder, onDeleteOrder, commodities }: any) => (
    <div data-testid="orders-feature">
      <div data-testid="orders-count">{orders.length}</div>
      <div data-testid="commodities-count">{commodities.length}</div>
      <button onClick={() => onAddOrder({ id: 'test', customerName: 'Test' })}>Add Order</button>
      <button onClick={() => onUpdateOrder('test', { customerName: 'Updated' })}>Update Order</button>
      <button onClick={() => onDeleteOrder('test')}>Delete Order</button>
    </div>
  ),
}));

// Mock the useAppContext hook
jest.mock('@/components/layout', () => ({
  useAppContext: jest.fn(),
}));

const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

describe('OrdersPage', () => {
  const mockContextValue = {
    orders: [
      { id: '1', customerName: 'Customer 1', commodity: 'commodity1', variety: 'variety1', quantity: 100, deliveryDate: '2024-02-01', notes: '' },
      { id: '2', customerName: 'Customer 2', commodity: 'commodity2', variety: 'variety2', quantity: 200, deliveryDate: '2024-02-15', notes: '' }
    ],
    commodities: [
      { id: 'commodity1', name: 'Commodity 1', varieties: [] },
      { id: 'commodity2', name: 'Commodity 2', varieties: [] }
    ],
    addOrder: jest.fn(),
    updateOrder: jest.fn(),
    deleteOrder: jest.fn(),
    landBlocks: [],
    plantings: [],
    notifications: [],
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

  it('should render OrdersFeature with correct props', () => {
    const { getByTestId } = render(<OrdersPage />);
    
    expect(getByTestId('orders-feature')).toBeInTheDocument();
    expect(getByTestId('orders-count')).toHaveTextContent('2');
    expect(getByTestId('commodities-count')).toHaveTextContent('2');
  });

  it('should pass orders from context to OrdersFeature', () => {
    const { getByTestId } = render(<OrdersPage />);
    
    expect(getByTestId('orders-count')).toHaveTextContent('2');
  });

  it('should pass commodities from context to OrdersFeature', () => {
    const { getByTestId } = render(<OrdersPage />);
    
    expect(getByTestId('commodities-count')).toHaveTextContent('2');
  });

  it('should pass handler functions from context to OrdersFeature', () => {
    const { getByText } = render(<OrdersPage />);
    
    expect(getByText('Add Order')).toBeInTheDocument();
    expect(getByText('Update Order')).toBeInTheDocument();
    expect(getByText('Delete Order')).toBeInTheDocument();
  });

  it('should handle empty orders and commodities', () => {
    mockUseAppContext.mockReturnValue({
      ...mockContextValue,
      orders: [],
      commodities: [],
    });

    const { getByTestId } = render(<OrdersPage />);
    
    expect(getByTestId('orders-count')).toHaveTextContent('0');
    expect(getByTestId('commodities-count')).toHaveTextContent('0');
  });

  it('should call useAppContext hook', () => {
    render(<OrdersPage />);
    
    expect(mockUseAppContext).toHaveBeenCalledTimes(1);
  });
});
