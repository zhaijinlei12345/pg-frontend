import client from './client';

import type { User } from './users.api';

export const authAPI = {
  register: (data: { name: string; email: string; password: string; age?: number }) =>
    client.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    client.post('/auth/login', data),
  me: () =>
    client.get<{ success: boolean; data: { user: User; token: string } }>('/auth/me'),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    client.put('/auth/password', data),
  updateProfile: (data: { name?: string; email?: string; age?: number }) =>
    client.put<{ success: boolean; data: { user: User; token: string }; message: string }>('/auth/profile', data),
};
