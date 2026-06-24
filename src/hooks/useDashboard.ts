import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../api/dashboard.api';
import type { DashboardStats } from '../api/dashboard.api';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.stats();
      setStats(res.data.data);
    } catch (err) {
      console.error('加载仪表盘数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, refresh: fetch };
}
