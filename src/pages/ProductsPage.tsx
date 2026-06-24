import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, Card, App, Tag, Image, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useProducts } from '../hooks/useProducts';
import { useDictData } from '../hooks/useDict';
import DictSelect from '../components/DictSelect';
import { usePerms } from '../hooks/usePerms';
import type { Product } from '../api/products.api';

const { Title, Text } = Typography;

export default function ProductsPage() {
  const { t } = useTranslation();
  const perm = usePerms('products');
  const { message: msg } = App.useApp();
  const { data: catDict } = useDictData('product_category');
  const { data: statusDict } = useDictData('product_status');

  const {
    products, loading, total, page, pageSize, search, category, status,
    setPage, setPageSize, setSearch, setCategory, setStatus, fetch, create, update, remove,
  } = useProducts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); form.setFieldsValue({ ...p, price: Number(p.price) }); setModalOpen(true); };
  const handleDelete = async (id: number) => { try { await remove(id); msg.success(t('common.delete') + ' OK'); } catch { msg.error(t('common.delete') + ' Failed'); } };
  const handleOk = async () => {
    try {
      const values = await form.validateFields(); setSubmitting(true);
      if (editing) { await update(editing.id, values); msg.success(t('common.edit') + ' OK'); }
      else { await create(values); msg.success(t('products.create') + ' OK'); }
      setModalOpen(false);
    } catch { /* validation */ } finally { setSubmitting(false); }
  };

  const catTag = (c: string | null) => { if (!c) return '-'; const e = catDict?.entries.find(x => x.key === c); return <Tag color={e?.color || undefined}>{e?.label || c}</Tag>; };
  const statusTag = (s: string) => { const e = statusDict?.entries.find(x => x.key === s); return <Tag color={e?.color || undefined}>{e?.label || s}</Tag>; };

  const columns: ColumnsType<Product> = [
    { title: t('products.imageUrl'), dataIndex: 'image_url', width: 70, render: (v: string | null) => v ? <Image src={v} width={36} height={36} style={{ borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} /> },
    { title: t('products.name'), dataIndex: 'name', ellipsis: true },
    { title: t('products.category'), dataIndex: 'category', width: 100, render: catTag },
    { title: t('products.price'), dataIndex: 'price', width: 100, render: (v: string) => `¥${Number(v).toFixed(2)}` },
    { title: t('products.stock'), dataIndex: 'stock', width: 80, align: 'center' as const },
    { title: t('products.status'), dataIndex: 'status', width: 80, render: statusTag },
    ...(perm.canWrite ? [{ title: t('users.action'), key: 'action', width: 140, fixed: 'right' as const, render: (_: any, r: Product) => (
      <Space>
        <Button type="link" size="small" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
        {perm.canDelete && <Popconfirm title={t('users.confirmDelete')} onConfirm={() => handleDelete(r.id)}><Button type="link" size="small" danger>{t('common.delete')}</Button></Popconfirm>}
      </Space>
    )}] : []),
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>{t('products.title')}</Title>
        <Text type="secondary">{t('products.desc')}</Text>
      </div>
      <Card style={{ background: 'transparent' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input placeholder={t('products.search')} value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => { setPage(1); fetch(); }} style={{ width: 200 }} prefix={<SearchOutlined />} allowClear />
          <Select value={category} onChange={v => { setCategory(v); setPage(1); }} style={{ width: 120 }} allowClear placeholder={t('products.category')} options={(catDict?.entries || []).map(e => ({ value: e.key, label: e.label }))} />
          <Select value={status} onChange={v => { setStatus(v); setPage(1); }} style={{ width: 100 }} allowClear placeholder={t('products.status')} options={(statusDict?.entries || []).map(e => ({ value: e.key, label: e.label }))} />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setCategory(''); setStatus(''); setPage(1); }}>{t('products.reset')}</Button>
          <div style={{ flex: 1 }} />
          {perm.canWrite && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: '#10b981', borderColor: '#10b981' }}>{t('products.create')}</Button>}
        </div>
        <Table columns={columns} dataSource={products} rowKey="id" loading={loading} scroll={{ x: 900 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (cnt) => `${cnt} ${t('common.yes')}`, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
          locale={{ emptyText: t('products.noData') }} />
      </Card>
      <Modal title={editing ? t('products.edit') : t('products.create')} open={modalOpen} onOk={handleOk} onCancel={() => setModalOpen(false)} confirmLoading={submitting} destroyOnClose width={560}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('products.name')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label={t('products.description')}><Input.TextArea rows={2} /></Form.Item>
          <Space style={{ display: 'flex' }} size={16}>
            <Form.Item name="price" label={t('products.price')} rules={[{ required: true }]}><InputNumber min={0} step={0.01} prefix="¥" style={{ width: 150 }} /></Form.Item>
            <Form.Item name="stock" label={t('products.stock')}><InputNumber min={0} style={{ width: 120 }} /></Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} size={16}>
            <Form.Item name="category" label={t('products.category')} style={{ width: 200 }}><DictSelect dictCode="product_category" /></Form.Item>
            <Form.Item name="status" label={t('products.status')} style={{ width: 120 }}><DictSelect dictCode="product_status" /></Form.Item>
          </Space>
          <Form.Item name="image_url" label={t('products.imageUrl')}><Input placeholder="https://..." /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
