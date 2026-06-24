import client from './client';

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  order_no: string;
  customer_name: string;
  customer_phone: string | null;
  total_amount: string;
  status: string;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export const ordersAPI = {
  list: (params: { page?: number; limit?: number; status?: string; search?: string }) =>
    client.get<{ success: boolean; data: Order[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/orders', { params }),
  create: (data: Partial<Order> & { items: { product_name: string; quantity: number; unit_price: number }[] }) =>
    client.post('/orders', data),
  updateStatus: (id: number, status: string) =>
    client.put(`/orders/${id}/status`, { status }),
  delete: (id: number) =>
    client.delete(`/orders/${id}`),
};
