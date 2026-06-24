import client from './client';

export const authAPI = {
  register: (data: { name: string; email: string; password: string; age?: number }) =>
    client.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    client.post('/auth/login', data),
  me: () =>
    client.get('/auth/me'),
};
