// =============================================================================
// ORDER TYPES - Order management related types
// =============================================================================

export interface Order {
  id: number;
  customer: string;
  commodity: string;
  volume: number;
  marketType: string;
  deliveryDate: string;
  isWeekly: boolean;
}

export interface OrderFormData {
  customer: string;
  commodity: string;
  volume: string | number;
  marketType: string;
  deliveryDate: string;
  isWeekly: boolean;
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface OrdersActions {
  addOrder: (orderData: Partial<Order>) => void;
  updateOrder: (id: number, orderData: Partial<Order>) => void;
  deleteOrder: (id: number) => void;
}
