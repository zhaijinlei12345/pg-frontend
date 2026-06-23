import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动附加 token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：401 自动跳转登录
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 不在登录页才跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ---------- Auth API ----------
export const authAPI = {
  register: (data: { name: string; email: string; password: string; age?: number }) =>
    client.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    client.post('/auth/login', data),
};

// ---------- Users API ----------
export interface User {
  id: number;
  name: string;
  email: string;
  age: number | null;
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
    client.get<{ success: boolean; data: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/users', { params }),
  getById: (id: number) =>
    client.get<{ success: boolean; data: User }>(`/users/${id}`),
  create: (data: { name: string; email: string; age?: number }) =>
    client.post('/users', data),
  update: (id: number, data: { name?: string; email?: string; age?: number }) =>
    client.put(`/users/${id}`, data),
  delete: (id: number) =>
    client.delete(`/users/${id}`),
};

export default client;
