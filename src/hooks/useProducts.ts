import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../api/products.api';
import type { Product } from '../api/products.api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsAPI.list({ page, limit: pageSize, search, category, status });
      setProducts(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, category, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (data: any) => { await productsAPI.create(data); fetch(); };
  const update = async (id: number, data: any) => { await productsAPI.update(id, data); fetch(); };
  const remove = async (id: number) => { await productsAPI.delete(id); fetch(); };

  return {
    products, loading, total, page, pageSize, search, category, status,
    setPage, setPageSize, setSearch, setCategory, setStatus,
    fetch, create, update, remove,
  };
}
