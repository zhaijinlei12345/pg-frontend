import { useState, useEffect, useCallback } from 'react';
import { dictAPI } from '../api/dict.api';
import type { DictData, DictType, DictEntry } from '../api/dict.api';

/**
 * 获取单个字典数据（下拉框用）
 */
export function useDictData(code: string) {
  const [data, setData] = useState<DictData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dictAPI.get(code);
      setData(res.data.data);
    } catch (err) {
      console.error(`加载字典 ${code} 失败:`, err);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refresh: fetch };
}

/**
 * 字典管理页面用：类型列表
 */
export function useDictTypes() {
  const [types, setTypes] = useState<DictType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dictAPI.listTypes();
      setTypes(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { types, loading, refresh: fetch };
}

/**
 * 字典管理页面用：条目列表
 */
export function useDictEntries(typeCode: string) {
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!typeCode) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const res = await dictAPI.listEntries(typeCode);
      setEntries(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [typeCode]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { entries, loading, refresh: fetch };
}
