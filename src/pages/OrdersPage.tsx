import { useState } from 'react';
import { Table, Button, Drawer, Tag, Select, Input, Space, Typography, Card, App, Descriptions, Popconfirm } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useOrders } from '../hooks/useOrders';
import { useDictData } from '../hooks/useDict';
import type { Order } from '../api/orders.api';

const { Title, Text } = Typography;

export default function OrdersPage() {
  const { message: msg } = App.useApp();
  const { data: statusDict } = useDictData('order_status');
  const {
    orders, loading, total, page, pageSize, status, search,
    setPage, setPageSize, setStatus, setSearch, fetch, updateStatus, remove,
  } = useOrders();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);

  const statusTag = (s: string) => {
    const e = statusDict?.entries.find(x => x.key === s);
    return <Tag color={e?.color || undefined}>{e?.label || s}</Tag>;
  };

  const handleStatus = async (id: number, newStatus: string) => {
    try { await updateStatus(id, newStatus); msg.success('状态已更新'); } catch { msg.error('失败'); }
  };

  const columns: ColumnsType<Order> = [
    { title: '订单号', dataIndex: 'order_no', width: 140 },
    { title: '客户', dataIndex: 'customer_name', width: 100 },
    { title: '金额', dataIndex: 'total_amount', width: 100, render: (v: string) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', width: 100, render: statusTag },
    { title: '时间', dataIndex: 'created_at', width: 160, render: (v: string) => new Date(v).toLocaleString('zh-CN') },
    {
      title: '操作', key: 'action', width: 200, fixed: 'right' as const,
      render: (_, r: Order) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setDetail(r); setDetailOpen(true); }}>详情</Button>
          {r.status === 'pending' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'paid')}>标记已付</Button>}
          {r.status === 'paid' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'shipped')}>发货</Button>}
          {r.status === 'shipped' && <Button type="link" size="small" onClick={() => handleStatus(r.id, 'completed')}>完成</Button>}
          {(r.status === 'pending' || r.status === 'cancelled') && (
            <Popconfirm title="确定删除？" onConfirm={async () => { try { await remove(r.id); msg.success('已删除'); } catch { msg.error('失败'); } }}>
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: '#e1e4ed', marginBottom: 4 }}>📋 订单管理</Title>
        <Text type="secondary">管理订单，支持状态流转</Text>
      </div>

      <Card style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input prefix={<SearchOutlined />} placeholder="订单号/客户名…" value={search} onChange={e => setSearch(e.target.value)} onPressEnter={() => { setPage(1); fetch(); }} style={{ width: 200 }} allowClear />
          <Select value={status} onChange={v => { setStatus(v); setPage(1); }} style={{ width: 120 }} allowClear placeholder="状态"
            options={(statusDict?.entries || []).map(e => ({ value: e.key, label: e.label }))} />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>重置</Button>
        </div>
        <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} scroll={{ x: 900 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: t => `共 ${t} 单`, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
          locale={{ emptyText: '暂无订单' }} />
      </Card>

      <Drawer title={`订单详情 - ${detail?.order_no || ''}`} open={detailOpen} onClose={() => setDetailOpen(false)} width={520}>
        {detail && (
          <>
            <Descriptions column={1} size="small" labelStyle={{ color: '#6b7280' }} contentStyle={{ color: '#e1e4ed' }}>
              <Descriptions.Item label="客户">{detail.customer_name}</Descriptions.Item>
              <Descriptions.Item label="电话">{detail.customer_phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="金额">¥{Number(detail.total_amount).toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="状态">{statusTag(detail.status)}</Descriptions.Item>
              <Descriptions.Item label="备注">{detail.notes || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(detail.created_at).toLocaleString('zh-CN')}</Descriptions.Item>
            </Descriptions>
            <Title level={5} style={{ color: '#e1e4ed', marginTop: 20 }}>订单明细</Title>
            <Table dataSource={detail.items || []} rowKey="id" size="small" pagination={false}
              columns={[
                { title: '商品', dataIndex: 'product_name' },
                { title: '单价', dataIndex: 'unit_price', render: v => `¥${Number(v).toFixed(2)}` },
                { title: '数量', dataIndex: 'quantity' },
                { title: '小计', dataIndex: 'subtotal', render: v => `¥${Number(v).toFixed(2)}` },
              ]} />
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              {detail.status === 'pending' && <Button type="primary" onClick={() => { handleStatus(detail.id, 'paid'); setDetail({ ...detail, status: 'paid' }); }}>标记已支付</Button>}
              {detail.status === 'paid' && <Button type="primary" onClick={() => { handleStatus(detail.id, 'shipped'); setDetail({ ...detail, status: 'shipped' }); }}>确认发货</Button>}
              {detail.status === 'shipped' && <Button type="primary" onClick={() => { handleStatus(detail.id, 'completed'); setDetail({ ...detail, status: 'completed' }); }}>标记完成</Button>}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
