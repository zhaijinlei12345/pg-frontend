import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../api/orders.api';
import type { Order } from '../api/orders.api';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.list({ page, limit: pageSize, status, search });
      setOrders(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (data: any) => {
    await ordersAPI.create(data);
    fetch();
  };
  const updateStatus = async (id: number, s: string) => {
    await ordersAPI.updateStatus(id, s);
    fetch();
  };
  const remove = async (id: number) => {
    await ordersAPI.delete(id);
    fetch();
  };

  return {
    orders,
    loading,
    total,
    page,
    pageSize,
    status,
    search,
    setPage,
    setPageSize,
    setStatus,
    setSearch,
    fetch,
    create,
    updateStatus,
    remove,
  };
}
