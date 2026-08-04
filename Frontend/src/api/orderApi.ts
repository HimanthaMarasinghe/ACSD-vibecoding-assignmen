import api from './axios';

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPayload {
  customer_name: string;
  email: string;
  address: string;
  phone: string;
  total_amount: number;
  items: OrderItem[];
  status?: string;
}

export interface Order extends OrderPayload {
  id: string;
  created_at: string;
}

/**
 * Order Management API Service
 */
export const orderApi = {
  /**
   * Fetch all orders (Admin)
   */
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  /**
   * Create a new order during checkout
   */
  createOrder: async (orderPayload: OrderPayload): Promise<Order> => {
    const response = await api.post<Order>('/orders', orderPayload);
    return response.data;
  },

  /**
   * Update status of an existing order
   */
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  }
};
