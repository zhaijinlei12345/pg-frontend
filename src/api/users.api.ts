import client from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  age: number | null;
  role: string;
  created_at: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const usersAPI = {
  list: (params: UserListParams) =>
    client.get<{
      success: boolean;
      data: User[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/users', { params }),
  getById: (id: number) => client.get<{ success: boolean; data: User }>(`/users/${id}`),
  create: (data: { name: string; email: string; age?: number; role?: string }) => client.post('/users', data),
  update: (id: number, data: { name?: string; email?: string; age?: number; role?: string }) =>
    client.put(`/users/${id}`, data),
  delete: (id: number) => client.delete(`/users/${id}`),
};
