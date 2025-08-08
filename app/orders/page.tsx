// =============================================================================
// ORDERS PAGE - Customer order management
// =============================================================================

'use client';

import React from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { OrdersFeature } from '@/components/orders';
import { useAppContext } from '@/components/layout';

export default function OrdersPage() {
  const { orders, addOrder, updateOrder, deleteOrder, commodities } = useAppContext();

  return (
    <OrdersFeature
      orders={orders}
      onAddOrder={addOrder}
      onUpdateOrder={updateOrder}
      onDeleteOrder={deleteOrder}
      commodities={commodities}
    />
  );
}
