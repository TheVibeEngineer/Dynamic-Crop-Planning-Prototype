// =============================================================================
// USE ORDERS HOOK - Orders state management
// =============================================================================

import { useState, useEffect } from 'react';
import type { Order, OrdersActions } from '@/types';
import { persistenceService } from '@/lib/services/persistence';
import { STORAGE_KEYS } from '@/lib/constants';

export const useOrders = (): OrdersActions & { orders: Order[] } => {
  // Default orders data
  const defaultOrders: Order[] = [
    { id: 1, customer: 'Fresh Farms Co', commodity: 'Romaine', volume: 10000, marketType: 'Fresh Cut', deliveryDate: '2025-09-15', isWeekly: false },
    { id: 2, customer: 'Valley Produce', commodity: 'Carrots', volume: 50000, marketType: 'Bulk', deliveryDate: '2025-10-01', isWeekly: true },
    { id: 3, customer: 'Premium Greens', commodity: 'Iceberg', volume: 7500, marketType: 'Fresh Cut', deliveryDate: '2025-08-20', isWeekly: false },
    { id: 4, customer: 'Green Valley Co', commodity: 'Romaine', volume: 8000, marketType: 'Fresh Cut', deliveryDate: '2025-08-30', isWeekly: false },
    { id: 5, customer: 'Desert Fresh', commodity: 'Carrots', volume: 30000, marketType: 'Bulk', deliveryDate: '2025-11-15', isWeekly: false },
    { id: 6, customer: 'Coastal Greens', commodity: 'Iceberg', volume: 12000, marketType: 'Fresh Cut', deliveryDate: '2025-09-01', isWeekly: false }
  ];

  // Initialize with saved data or default
  const [orders, setOrders] = useState<Order[]>(() => {
    return persistenceService.load(STORAGE_KEYS.ORDERS, defaultOrders);
  });

  // Auto-save orders when they change
  useEffect(() => {
    persistenceService.save(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  const addOrder = (orderData: Partial<Order>) => {
    const order: Order = {
      id: Date.now(),
      customer: orderData.customer || '',
      commodity: orderData.commodity || '',
      volume: parseFloat(orderData.volume?.toString() || '0'),
      marketType: orderData.marketType || '',
      deliveryDate: orderData.deliveryDate || '',
      isWeekly: orderData.isWeekly || false
    };
    setOrders((prev) => [...prev, order]);
  };

  const updateOrder = (id: number, orderData: Partial<Order>) => {
    setOrders((prev) => prev.map((order) => 
      order.id === id ? { 
        ...order,
        ...orderData, 
        id, 
        volume: parseFloat(orderData.volume?.toString() || order.volume.toString())
      } : order
    ));
  };

  const deleteOrder = (id: number) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return { orders, addOrder, updateOrder, deleteOrder };
};
