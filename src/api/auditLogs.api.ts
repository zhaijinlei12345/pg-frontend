import client from './client';

export interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  target_type: string;
  target_id: number | null;
  details: string | null;
  created_at: string;
}

export const auditLogsAPI = {
  list: (params: { page?: number; limit?: number; action?: string }) =>
    client.get<{ success: boolean; data: AuditLog[]; pagination: { total: number } }>('/audit-logs', { params }),
};
