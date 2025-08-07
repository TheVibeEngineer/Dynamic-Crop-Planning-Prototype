// =============================================================================
// ORDERS FEATURE - Order management interface
// =============================================================================

import React, { useState } from 'react';
import type { Order } from '@/types/orders';
import type { Commodity } from '@/types/commodities';
import { Button, Modal, Table } from '../common';
import { MARKET_TYPES } from '@/lib/constants';

export interface OrdersFeatureProps {
  orders: Order[];
  onAddOrder: (orderData: Partial<Order>) => void;
  onUpdateOrder: (id: number, orderData: Partial<Order>) => void;
  onDeleteOrder: (id: number) => void;
  commodities: Commodity[];
}

export const OrdersFeature: React.FC<OrdersFeatureProps> = ({ 
  orders, 
  onAddOrder, 
  onUpdateOrder, 
  onDeleteOrder, 
  commodities 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customer: '', 
    commodity: '', 
    volume: '', 
    marketType: 'Fresh Cut', 
    deliveryDate: '', 
    isWeekly: false
  });

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customer: order.customer,
      commodity: order.commodity,
      volume: order.volume.toString(),
      marketType: order.marketType,
      deliveryDate: order.deliveryDate,
      isWeekly: order.isWeekly
    });
    setShowForm(true);
  };

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (formData.customer && formData.commodity && formData.volume && formData.deliveryDate) {
      if (editingOrder) {
        onUpdateOrder(editingOrder.id, { ...formData, volume: parseFloat(formData.volume) });
      } else {
        onAddOrder({ ...formData, volume: parseFloat(formData.volume) });
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ 
      customer: '', 
      commodity: '', 
      volume: '', 
      marketType: 'Fresh Cut', 
      deliveryDate: '', 
      isWeekly: false 
    });
    setEditingOrder(null);
    setShowForm(false);
  };

  const columns = [
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'commodity', label: 'Commodity', sortable: true },
    { key: 'marketType', label: 'Market Type', sortable: true },
    { 
      key: 'volume', 
      label: 'Volume', 
      sortable: true,
      render: (value: number) => value.toLocaleString()
    },
    { key: 'deliveryDate', label: 'Delivery Date', sortable: true },
    { 
      key: 'isWeekly', 
      label: 'Type', 
      render: (value: boolean) => value ? 'Weekly' : 'One-time'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, order: Order) => (
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => handleEdit(order)}
            className="text-xs px-2 py-1"
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            onClick={() => onDeleteOrder(order.id)}
            className="text-xs px-2 py-1"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const formFooter = (
    <>
      <Button variant="secondary" onClick={resetForm}>
        Cancel
      </Button>
      <Button type="submit" onClick={() => handleSubmit()}>
        {editingOrder ? 'Update Order' : 'Add Order'}
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Customer Orders</h2>
        <Button onClick={() => setShowForm(true)}>Add Order</Button>
      </div>

      <Table 
        columns={columns} 
        data={orders}
        emptyMessage="No orders found. Add your first order to get started."
      />

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingOrder ? 'Edit Order' : 'Add New Order'}
        footer={formFooter}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="Customer Name"
              value={formData.customer}
              onChange={(e) => setFormData({...formData, customer: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commodity
            </label>
            <select
              value={formData.commodity}
              onChange={(e) => setFormData({...formData, commodity: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="">Select Commodity</option>
              {commodities.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Market Type
            </label>
            <select
              value={formData.marketType}
              onChange={(e) => setFormData({...formData, marketType: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
            >
              {MARKET_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume
              </label>
              <input
                type="number"
                placeholder="Volume"
                value={formData.volume}
                onChange={(e) => setFormData({...formData, volume: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isWeekly}
                onChange={(e) => setFormData({...formData, isWeekly: e.target.checked})}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Weekly recurring order</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
