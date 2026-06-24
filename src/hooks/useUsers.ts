import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../api/users.api';
import type { User } from '../api/users.api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | undefined>(undefined);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersAPI.list({
        page,
        limit: pageSize,
        search,
        searchField,
        sort: sortField,
        order: sortOrder === 'descend' ? 'desc' : 'asc',
      });
      setUsers(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('获取用户列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, searchField, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(
    async (data: { name: string; email: string; age?: number; role?: string }) => {
      await usersAPI.create(data);
      fetchUsers();
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (id: number, data: { name?: string; email?: string; age?: number; role?: string }) => {
      await usersAPI.update(id, data);
      fetchUsers();
    },
    [fetchUsers],
  );

  const deleteUser = useCallback(
    async (id: number) => {
      await usersAPI.delete(id);
      fetchUsers();
    },
    [fetchUsers],
  );

  return {
    users,
    loading,
    total,
    page,
    pageSize,
    search,
    searchField,
    sortField,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setSearchField,
    setSortField,
    setSortOrder,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
