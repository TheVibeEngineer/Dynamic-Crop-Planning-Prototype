// =============================================================================
// USE ORDERS HOOK TEST SUITE
// =============================================================================

import { renderHook, act } from '@testing-library/react';
import { useOrders } from '../../hooks/useOrders';
import { persistenceService } from '../../lib/services/persistence';
import { STORAGE_KEYS } from '../../lib/constants';

// Mock the persistence service
jest.mock('../../lib/services/persistence', () => ({
  persistenceService: {
    load: jest.fn((key: string, defaultValue: any) => defaultValue),
    save: jest.fn(),
  },
}));

const mockedPersistenceService = persistenceService as jest.Mocked<typeof persistenceService>;

describe('useOrders Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default behavior: return the default value when no data exists
    mockedPersistenceService.load.mockImplementation((key: string, defaultValue: any) => defaultValue);
    mockedPersistenceService.save.mockReturnValue(true);
  });

  describe('initialization', () => {
    it('should initialize with default orders when no saved data exists', () => {
      // Mock will return default value passed to it
      mockedPersistenceService.load.mockImplementation((key: string, defaultValue: any) => defaultValue);
      
      const { result } = renderHook(() => useOrders());
      
      expect(result.current.orders).toHaveLength(6); // Default orders
      expect(result.current.orders[0]).toMatchObject({
        id: 1,
        customer: 'Fresh Farms Co',
        commodity: 'Romaine',
        marketType: 'Fresh Cut'
      });
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(STORAGE_KEYS.ORDERS, expect.any(Array));
    });

    it('should initialize with saved orders when data exists', () => {
      const savedOrders = [
        { id: 1, customer: 'Test Customer', commodity: 'Test Commodity', volume: 100, marketType: 'Test', deliveryDate: '2024-01-01', isWeekly: false }
      ];
      mockedPersistenceService.load.mockImplementation(() => savedOrders);
      
      const { result } = renderHook(() => useOrders());
      
      expect(result.current.orders).toEqual(savedOrders);
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(STORAGE_KEYS.ORDERS, expect.any(Array));
    });

    it('should auto-save orders on initialization', () => {
      const { result } = renderHook(() => useOrders());
      
      // Should save after initial render
      expect(mockedPersistenceService.save).toHaveBeenCalledWith(STORAGE_KEYS.ORDERS, result.current.orders);
    });
  });

  describe('addOrder', () => {
    it('should add a new order with generated ID', () => {
      const { result } = renderHook(() => useOrders());
      const initialCount = result.current.orders.length;
      
      act(() => {
        result.current.addOrder({
          customer: 'New Customer',
          commodity: 'New Commodity',
          volume: 500,
          marketType: 'Fresh Cut',
          deliveryDate: '2024-06-01',
          isWeekly: true
        });
      });
      
      expect(result.current.orders).toHaveLength(initialCount + 1);
      const newOrder = result.current.orders[result.current.orders.length - 1];
      expect(newOrder).toMatchObject({
        customer: 'New Customer',
        commodity: 'New Commodity',
        volume: 500,
        marketType: 'Fresh Cut',
        deliveryDate: '2024-06-01',
        isWeekly: true
      });
      expect(newOrder.id).toBeDefined();
      expect(typeof newOrder.id).toBe('number');
    });

    it('should handle partial order data with defaults', () => {
      const { result } = renderHook(() => useOrders());
      
      act(() => {
        result.current.addOrder({
          customer: 'Partial Customer'
        });
      });
      
      const newOrder = result.current.orders[result.current.orders.length - 1];
      expect(newOrder).toMatchObject({
        customer: 'Partial Customer',
        commodity: '',
        volume: 0,
        marketType: '',
        deliveryDate: '',
        isWeekly: false
      });
    });

    it('should handle string volume conversion', () => {
      const { result } = renderHook(() => useOrders());
      
      act(() => {
        result.current.addOrder({
          customer: 'Test Customer',
          volume: '123.45' as any // String volume
        });
      });
      
      const newOrder = result.current.orders[result.current.orders.length - 1];
      expect(newOrder.volume).toBe(123.45);
    });

    it('should auto-save after adding order', () => {
      const { result } = renderHook(() => useOrders());
      
      act(() => {
        result.current.addOrder({
          customer: 'Test Customer',
          commodity: 'Test Commodity'
        });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.ORDERS, 
        result.current.orders
      );
    });
  });

  describe('updateOrder', () => {
    it('should update existing order', () => {
      const { result } = renderHook(() => useOrders());
      const orderId = result.current.orders[0].id;
      
      act(() => {
        result.current.updateOrder(orderId, {
          customer: 'Updated Customer',
          volume: 999
        });
      });
      
      const updatedOrder = result.current.orders.find(order => order.id === orderId);
      expect(updatedOrder).toMatchObject({
        customer: 'Updated Customer',
        volume: 999
      });
      // Should preserve other fields
      expect(updatedOrder?.id).toBe(orderId);
    });

    it('should handle string volume conversion in updates', () => {
      const { result } = renderHook(() => useOrders());
      const orderId = result.current.orders[0].id;
      
      act(() => {
        result.current.updateOrder(orderId, {
          volume: '456.78' as any
        });
      });
      
      const updatedOrder = result.current.orders.find(order => order.id === orderId);
      expect(updatedOrder?.volume).toBe(456.78);
    });

    it('should not update non-existent order', () => {
      const { result } = renderHook(() => useOrders());
      const initialOrders = [...result.current.orders];
      
      act(() => {
        result.current.updateOrder(99999, {
          customer: 'Should Not Update'
        });
      });
      
      expect(result.current.orders).toEqual(initialOrders);
    });

    it('should preserve order ID during update', () => {
      const { result } = renderHook(() => useOrders());
      const orderId = result.current.orders[0].id;
      
      act(() => {
        result.current.updateOrder(orderId, {
          id: 88888, // Try to change ID
          customer: 'Updated Customer'
        });
      });
      
      const updatedOrder = result.current.orders.find(order => order.id === orderId);
      expect(updatedOrder?.id).toBe(orderId); // Should keep original ID
      expect(updatedOrder?.customer).toBe('Updated Customer');
    });

    it('should auto-save after updating order', () => {
      const { result } = renderHook(() => useOrders());
      const orderId = result.current.orders[0].id;
      
      act(() => {
        result.current.updateOrder(orderId, {
          customer: 'Updated Customer'
        });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.ORDERS, 
        result.current.orders
      );
    });
  });

  describe('deleteOrder', () => {
    it('should delete existing order', () => {
      const { result } = renderHook(() => useOrders());
      const orderId = result.current.orders[0].id;
      const initialCount = result.current.orders.length;
      
      act(() => {
        result.current.deleteOrder(orderId);
      });
      
      expect(result.current.orders).toHaveLength(initialCount - 1);
      expect(result.current.orders.find(order => order.id === orderId)).toBeUndefined();
    });

    it('should not affect orders when deleting non-existent order', () => {
      const { result } = renderHook(() => useOrders());
      const initialOrders = [...result.current.orders];
      
      act(() => {
        result.current.deleteOrder(99999);
      });
      
      expect(result.current.orders).toEqual(initialOrders);
    });

    it('should auto-save after deleting order', () => {
      const { result } = renderHook(() => useOrders());
      const orderId = result.current.orders[0].id;
      
      act(() => {
        result.current.deleteOrder(orderId);
      });
      
      expect(mockedPersistenceService.save).toHaveBeenLastCalledWith(
        STORAGE_KEYS.ORDERS, 
        result.current.orders
      );
    });
  });

  describe('persistence integration', () => {
    it('should load orders from persistence on mount', () => {
      renderHook(() => useOrders());
      
      expect(mockedPersistenceService.load).toHaveBeenCalledWith(
        STORAGE_KEYS.ORDERS, 
        expect.any(Array)
      );
    });

    it('should save orders after each state change', () => {
      const { result } = renderHook(() => useOrders());
      const callCountAfterInit = mockedPersistenceService.save.mock.calls.length;
      
      // Add order
      act(() => {
        result.current.addOrder({ customer: 'Test' });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledTimes(callCountAfterInit + 1);
      
      // Update order
      const orderId = result.current.orders[0].id;
      act(() => {
        result.current.updateOrder(orderId, { customer: 'Updated' });
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledTimes(callCountAfterInit + 2);
      
      // Delete order
      act(() => {
        result.current.deleteOrder(orderId);
      });
      
      expect(mockedPersistenceService.save).toHaveBeenCalledTimes(callCountAfterInit + 3);
    });
  });
});
