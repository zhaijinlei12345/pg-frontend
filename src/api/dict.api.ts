import client from './client';

// -------- 类型 --------

export interface DictType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  entry_count: string;
  created_at: string;
}

export interface DictEntry {
  id: number;
  type_code: string;
  key: string;
  label: string;
  color: string | null;
  sort_order: number;
  enabled: boolean;
  created_at: string;
}

export interface DictData {
  code: string;
  name: string;
  entries: { key: string; label: string; color: string | null }[];
}

// -------- API --------

export const dictAPI = {
  // 快捷接口
  get: (code: string) =>
    client.get<{ success: boolean; data: DictData }>(`/dict/${code}`),

  // 类型
  listTypes: () =>
    client.get<{ success: boolean; data: DictType[] }>('/dict-types'),
  createType: (data: { code: string; name: string; description?: string }) =>
    client.post('/dict-types', data),
  updateType: (code: string, data: { name?: string; description?: string }) =>
    client.put(`/dict-types/${code}`, data),
  deleteType: (code: string) =>
    client.delete(`/dict-types/${code}`),

  // 条目
  listEntries: (code: string) =>
    client.get<{ success: boolean; data: DictEntry[] }>(`/dict-types/${code}/entries`),
  createEntry: (code: string, data: { key: string; label: string; color?: string; sort_order?: number }) =>
    client.post(`/dict-types/${code}/entries`, data),
  updateEntry: (code: string, key: string, data: { label?: string; color?: string; sort_order?: number; enabled?: boolean }) =>
    client.put(`/dict-types/${code}/entries/${key}`, data),
  deleteEntry: (code: string, key: string) =>
    client.delete(`/dict-types/${code}/entries/${key}`),
};
