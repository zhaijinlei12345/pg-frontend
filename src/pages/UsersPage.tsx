import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Typography, Statistic, Row, Col, Card, App } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { usersAPI } from '../api/client';
import type { User } from '../api/client';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function UsersPage() {
  const { isAuthenticated } = useAuth();
  const { message: msg } = App.useApp();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | undefined>(undefined);

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, searchField, sortField, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: any,
    sorter: SorterResult<User> | SorterResult<User>[]
  ) => {
    setPage(pag.current || 1);
    setPageSize(pag.pageSize || 10);
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s.order) {
      setSortField(s.field as string);
      setSortOrder(s.order === 'ascend' ? 'ascend' : 'descend');
    } else {
      setSortField('id');
      setSortOrder(undefined);
    }
  };

  const handleReset = () => {
    setSearch('');
    setSearchField('all');
    setSortField('id');
    setSortOrder(undefined);
    setPage(1);
  };

  // 弹窗
  const openCreate = () => {
    setModalMode('create');
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (user: User) => {
    setModalMode('edit');
    setEditingUser(user);
    form.setFieldsValue({ name: user.name, email: user.email, age: user.age });
    setModalOpen(true);
  };
  const handleDelete = async (id: number) => {
    try { await usersAPI.delete(id); msg.success('删除成功'); fetchUsers(); }
    catch { msg.error('删除失败'); }
  };
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const data = { ...values, age: values.age ? Number(values.age) : undefined };
      if (modalMode === 'create') {
        await usersAPI.create(data);
        msg.success('新增成功');
      } else if (editingUser) {
        await usersAPI.update(editingUser.id, data);
        msg.success('更新成功');
      }
      setModalOpen(false);
      fetchUsers();
    } catch { /* validation failed */ }
    finally { setSubmitting(false); }
  };

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: true, sortOrder: sortField === 'id' ? sortOrder : undefined },
    { title: '姓名', dataIndex: 'name', key: 'name', sorter: true, sortOrder: sortField === 'name' ? sortOrder : undefined },
    { title: '邮箱', dataIndex: 'email', key: 'email', sorter: true, sortOrder: sortField === 'email' ? sortOrder : undefined },
    {
      title: '年龄', dataIndex: 'age', key: 'age', width: 80, sorter: true,
      sortOrder: sortField === 'age' ? sortOrder : undefined,
      render: (v: number | null) => v ?? '-',
    },
    {
      title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180, sorter: true,
      sortOrder: sortField === 'created_at' ? sortOrder : undefined,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    ...(isAuthenticated ? [{
      title: '操作', key: 'action', width: 160,
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)} okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  const avgAge = users.length > 0
    ? Math.round(users.filter(u => u.age != null).reduce((s, u) => s + (u.age || 0), 0) / users.filter(u => u.age != null).length)
    : 0;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: '#e1e4ed', marginBottom: 4 }}>👥 用户管理</Title>
        <Typography.Text type="secondary">管理系统中的所有注册用户</Typography.Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="用户总数" value={total} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="当前页" value={`${page} / ${Math.max(1, Math.ceil(total / pageSize))}`} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="平均年龄" value={avgAge || '-'} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="状态" value={isAuthenticated ? '已登录' : '未登录'} /></Card></Col>
      </Row>

      <Card style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            value={searchField}
            onChange={setSearchField}
            style={{ width: 110 }}
            options={[
              { value: 'all', label: '全部字段' },
              { value: 'id', label: 'ID' },
              { value: 'name', label: '姓名' },
              { value: 'email', label: '邮箱' },
              { value: 'age', label: '年龄' },
            ]}
          />
          <Input
            placeholder="输入关键字…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={() => { setPage(1); fetchUsers(); }}
            style={{ width: 220 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Button type="primary" onClick={() => { setPage(1); fetchUsers(); }}>搜索</Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          <div style={{ flex: 1 }} />
          {isAuthenticated && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
              style={{ background: '#10b981', borderColor: '#10b981' }}>
              新增用户
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新增用户' : '编辑用户'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="age" label="年龄" rules={[
            { type: 'number', min: 0, max: 200, message: '年龄须在 0-200 之间', transform: (v: string) => v ? Number(v) : undefined },
          ]}>
            <Input placeholder="请输入年龄（选填，0-200）" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
