import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Typography, Card, App, Tag, Image, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useDictData } from '../hooks/useDict';
import DictSelect from '../components/DictSelect';
import type { Product } from '../api/products.api';

const { Title, Text } = Typography;

export default function ProductsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'leader';
  const canDelete = user?.role === 'admin';
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
  const openEdit = (p: Product) => {
    setEditing(p);
    form.setFieldsValue({ ...p, price: Number(p.price) });
    setModalOpen(true);
  };
  const handleDelete = async (id: number) => {
    try { await remove(id); msg.success('已删除'); } catch { msg.error('删除失败'); }
  };
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await update(editing.id, values);
        msg.success('更新成功');
      } else {
        await create(values);
        msg.success('创建成功');
      }
      setModalOpen(false);
    } catch { /* validation */ }
    finally { setSubmitting(false); }
  };

  const catTag = (c: string | null) => {
    if (!c) return '-';
    const e = catDict?.entries.find(x => x.key === c);
    return <Tag color={e?.color || undefined}>{e?.label || c}</Tag>;
  };
  const statusTag = (s: string) => {
    const e = statusDict?.entries.find(x => x.key === s);
    return <Tag color={e?.color || undefined}>{e?.label || s}</Tag>;
  };

  const columns: ColumnsType<Product> = [
    {
      title: '图片', dataIndex: 'image_url', width: 70,
      render: (v: string | null) => v ? <Image src={v} width={36} height={36} style={{ borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} />,
    },
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '分类', dataIndex: 'category', width: 100, render: catTag },
    { title: '价格', dataIndex: 'price', width: 100, render: (v: string) => `¥${Number(v).toFixed(2)}` },
    { title: '库存', dataIndex: 'stock', width: 80, align: 'center' as const },
    { title: '状态', dataIndex: 'status', width: 80, render: statusTag },
    ...(canEdit ? [{
      title: '操作', key: 'action', width: 140, fixed: 'right' as const,
      render: (_: any, r: Product) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
          {canDelete && (
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: '#e1e4ed', marginBottom: 4 }}>📦 商品管理</Title>
        <Text type="secondary">管理商品信息，支持分类和库存</Text>
      </div>

      <Card style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="搜索商品…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={() => { setPage(1); fetch(); }}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            value={category}
            onChange={v => { setCategory(v); setPage(1); }}
            style={{ width: 120 }}
            allowClear
            placeholder="分类"
            options={(catDict?.entries || []).map(e => ({ value: e.key, label: e.label }))}
          />
          <Select
            value={status}
            onChange={v => { setStatus(v); setPage(1); }}
            style={{ width: 100 }}
            allowClear
            placeholder="状态"
            options={(statusDict?.entries || []).map(e => ({ value: e.key, label: e.label }))}
          />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setCategory(''); setStatus(''); setPage(1); }}>重置</Button>
          <div style={{ flex: 1 }} />
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
              style={{ background: '#10b981', borderColor: '#10b981' }}>新增商品</Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (t) => `共 ${t} 件`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          locale={{ emptyText: '暂无商品' }}
        />
      </Card>

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input placeholder="如: 无线蓝牙耳机" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="商品简介" />
          </Form.Item>
          <Space style={{ display: 'flex' }} size={16}>
            <Form.Item name="price" label="价格" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} prefix="¥" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="stock" label="库存">
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} size={16}>
            <Form.Item name="category" label="分类" style={{ width: 200 }}>
              <DictSelect dictCode="product_category" />
            </Form.Item>
            <Form.Item name="status" label="状态" style={{ width: 120 }}>
              <DictSelect dictCode="product_status" />
            </Form.Item>
          </Space>
          <Form.Item name="image_url" label="图片地址">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
