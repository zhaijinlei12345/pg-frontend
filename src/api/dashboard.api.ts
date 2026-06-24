import client from './client';
import type { AuditLog } from './auditLogs.api';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  roleDistribution: { role: string; count: string }[];
  newUserTrend: { date: string; count: string }[];
  orderStatusDistribution: { status: string; count: string }[];
  recentLogs: AuditLog[];
}

export const dashboardAPI = {
  stats: () => client.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats'),
};
