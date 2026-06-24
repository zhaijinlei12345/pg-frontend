import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Drawer, Tag, Select, Input, Space, Typography, Card, App, Descriptions, Popconfirm } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useOrders } from '../hooks/useOrders';
import { useDictData } from '../hooks/useDict';
import { usePerms } from '../hooks/usePerms';
import type { Order } from '../api/orders.api';

const { Title, Text } = Typography;

export default function OrdersPage() {
  const { t } = useTranslation();
  const { message: msg } = App.useApp();
  const { data: statusDict } = useDictData('order_status');
  const perm = usePerms('orders');
  const { orders, loading, total, page, pageSize, status, search, setPage, setPageSize, setStatus, setSearch, fetch, updateStatus, remove } = useOrders();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);

  const statusTag = (s: string) => { const e = statusDict?.entries.find(x => x.key === s); return <Tag color={e?.color || undefined}>{e?.label || s}</Tag>; };
  const handleStatus = async (id: number, newStatus: string) => { try { await updateStatus(id, newStatus); msg.success(t('orders.markComplete') + ' OK'); } catch { msg.error('Failed'); } };

  const columns: ColumnsType<Order> = [
    { title: t('orders.search'), dataIndex: 'order_no', width: 140 },
    { title: t('orders.customer'), dataIndex: 'customer_name', width: 100 },
    { title: t('orders.amount'), dataIndex: 'total_amount', width: 100, render: (v: string) => `¥${Number(v).toFixed(2)}` },
    { title: t('orders.status'), dataIndex: 'status', width: 100, render: statusTag },
    { title: t('users.createdAt'), dataIndex: 'created_at', width: 160, render: (v: string) => new Date(v).toLocaleString('zh-CN') },
    { title: t('users.action'), key: 'action', width: 200, fixed: 'right' as const, render: (_, r: Order) => (
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setDetail(r); setDetailOpen(true); }}>{t('common.detail')}</Button>
        {perm.canManage && r.status === 'pending' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'paid')}>{t('orders.markPaid')}</Button>}
        {perm.canManage && r.status === 'paid' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'shipped')}>{t('orders.markShipped')}</Button>}
        {perm.canManage && r.status === 'shipped' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'completed')}>{t('orders.markComplete')}</Button>}
        {perm.canDelete && (r.status === 'pending' || r.status === 'cancelled') && (
          <Popconfirm title={t('users.confirmDelete')} onConfirm={async () => { try { await remove(r.id); msg.success(t('orders.delete') + ' OK'); } catch { msg.error('Failed'); } }}>
            <Button type="link" size="small" danger>{t('orders.delete')}</Button>
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>{t('orders.title')}</Title>
        <Text type="secondary">{t('orders.desc')}</Text>
      </div>
      <Card style={{ background: 'transparent' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input prefix={<SearchOutlined />} placeholder={t('orders.search')} value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => { setPage(1); fetch(); }} style={{ width: 200 }} allowClear />
          <Select value={status} onChange={v => { setStatus(v); setPage(1); }} style={{ width: 120 }} allowClear placeholder={t('orders.status')} options={(statusDict?.entries || []).map(e => ({ value: e.key, label: e.label }))} />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>{t('orders.reset')}</Button>
        </div>
        <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} scroll={{ x: 900 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: cnt => `${cnt}`, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
          locale={{ emptyText: t('orders.noData') }} />
      </Card>
      <Drawer title={`${t('orders.detail')} - ${detail?.order_no || ''}`} open={detailOpen} onClose={() => setDetailOpen(false)} width={520}>
        {detail && (<>
          <Descriptions column={1} size="small" labelStyle={{ color: '#6b7280' }} contentStyle={{ color: '#e1e4ed' }}>
            <Descriptions.Item label={t('orders.customer')}>{detail.customer_name}</Descriptions.Item>
            <Descriptions.Item label={t('orders.phone')}>{detail.customer_phone || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('orders.amount')}>¥{Number(detail.total_amount).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label={t('orders.status')}>{statusTag(detail.status)}</Descriptions.Item>
            <Descriptions.Item label={t('orders.notes')}>{detail.notes || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('users.createdAt')}>{new Date(detail.created_at).toLocaleString('zh-CN')}</Descriptions.Item>
          </Descriptions>
          <Title level={5} style={{ color: '#e1e4ed', marginTop: 20 }}>{t('orders.items')}</Title>
          <Table dataSource={detail.items || []} rowKey="id" size="small" pagination={false}
            columns={[
              { title: t('orders.product'), dataIndex: 'product_name' },
              { title: t('orders.unitPrice'), dataIndex: 'unit_price', render: v => `¥${Number(v).toFixed(2)}` },
              { title: t('orders.quantity'), dataIndex: 'quantity' },
              { title: t('orders.subtotal'), dataIndex: 'subtotal', render: v => `¥${Number(v).toFixed(2)}` },
            ]} />
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            {detail.status === 'pending' && <Button type="primary" onClick={() => { handleStatus(detail.id, 'paid'); setDetail({ ...detail, status: 'paid' }); }}>{t('orders.markPaid')}</Button>}
            {detail.status === 'paid' && <Button type="primary" onClick={() => { handleStatus(detail.id, 'shipped'); setDetail({ ...detail, status: 'shipped' }); }}>{t('orders.markShipped')}</Button>}
            {detail.status === 'shipped' && <Button type="primary" onClick={() => { handleStatus(detail.id, 'completed'); setDetail({ ...detail, status: 'completed' }); }}>{t('orders.markComplete')}</Button>}
          </div>
        </>)}
      </Drawer>
    </div>
  );
}
