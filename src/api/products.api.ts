import client from './client';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const productsAPI = {
  list: (params: ProductListParams) =>
    client.get<{ success: boolean; data: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/products', { params }),
  create: (data: Partial<Product>) =>
    client.post('/products', data),
  update: (id: number, data: Partial<Product>) =>
    client.put(`/products/${id}`, data),
  delete: (id: number) =>
    client.delete(`/products/${id}`),
};
