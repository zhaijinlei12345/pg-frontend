import { useState, useEffect, useCallback } from 'react';
import { auditLogsAPI } from '../api/auditLogs.api';
import type { AuditLog } from '../api/auditLogs.api';

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actionFilter, setActionFilter] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogsAPI.list({
        page,
        limit: pageSize,
        action: actionFilter || undefined,
      });
      setLogs(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('获取操作日志失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return {
    logs, loading, total,
    page, pageSize, actionFilter,
    setPage, setPageSize, setActionFilter,
    fetchLogs,
  };
}
