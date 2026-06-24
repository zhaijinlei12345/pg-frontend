import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Typography, Statistic, Row, Col, Card, App, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { useTranslation } from 'react-i18next';
import type { User } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { useDictData } from '../hooks/useDict';
import DictSelect from '../components/DictSelect';
import { usePerms } from '../hooks/usePerms';

const { Title } = Typography;

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: roleDict } = useDictData('role');
  const perm = usePerms('users');
  const { message: msg } = App.useApp();

  const {
    users, loading, total,
    page, pageSize, search, searchField, sortField, sortOrder,
    setPage, setPageSize, setSearch, setSearchField, setSortField, setSortOrder,
    fetchUsers, createUser, updateUser, deleteUser,
  } = useUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

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

  const openCreate = () => {
    setModalMode('create');
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setModalMode('edit');
    setEditingUser(u);
    form.setFieldsValue({ name: u.name, email: u.email, age: u.age });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try { await deleteUser(id); msg.success(t('users.delete') + ' OK'); }
    catch { msg.error(t('users.delete') + ' Failed'); }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const data = { ...values, age: values.age ? Number(values.age) : undefined };
      if (modalMode === 'create') {
        await createUser(data);
        msg.success(t('users.create') + ' OK');
      } else if (editingUser) {
        await updateUser(editingUser.id, data);
        msg.success(t('users.edit') + ' OK');
      }
      setModalOpen(false);
      fetchUsers();
    } catch { /* validation */ }
    finally { setSubmitting(false); }
  };

  function roleTag(r: string) {
    const e = roleDict?.entries.find(x => x.key === r);
    return <Tag color={e?.color || undefined}>{e?.label || r}</Tag>;
  }

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: true, sortOrder: sortField === 'id' ? sortOrder : undefined },
    { title: t('users.name'), dataIndex: 'name', key: 'name', sorter: true, sortOrder: sortField === 'name' ? sortOrder : undefined },
    { title: t('users.email'), dataIndex: 'email', key: 'email', sorter: true, sortOrder: sortField === 'email' ? sortOrder : undefined },
    { title: t('users.age'), dataIndex: 'age', key: 'age', width: 70, sorter: true, sortOrder: sortField === 'age' ? sortOrder : undefined, render: (v: number | null) => v ?? '-' },
    { title: t('users.role'), dataIndex: 'role', key: 'role', width: 90, render: roleTag },
    { title: t('users.createdAt'), dataIndex: 'created_at', key: 'created_at', width: 170, sorter: true, sortOrder: sortField === 'created_at' ? sortOrder : undefined, render: (v: string) => new Date(v).toLocaleString(i18n.language === 'en-US' ? 'en-US' : 'zh-CN') },
    ...(perm.canWrite ? [{
      title: t('users.action'), key: 'action', width: 160, fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>{t('users.editBtn')}</Button>
          {perm.canDelete && (
            <Popconfirm title={t('users.confirmDelete')} onConfirm={() => handleDelete(record.id)} okButtonProps={{ danger: true }}>
              <Button type="link" size="small" danger>{t('users.delete')}</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  const avgAge = users.length > 0
    ? Math.round(users.filter(u => u.age != null).reduce((s, u) => s + (u.age || 0), 0) / users.filter(u => u.age != null).length)
    : 0;

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>{t('users.title')}</Title>
        <Typography.Text type="secondary">{t('users.desc')}</Typography.Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title={t('users.totalUsers')} value={total} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title={t('users.currentPage')} value={`${page} / ${Math.max(1, Math.ceil(total / pageSize))}`} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title={t('users.avgAge')} value={avgAge || '-'} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title={t('users.status')} value={isAuthenticated ? t('users.loggedIn') : t('users.notLoggedIn')} /></Card></Col>
      </Row>

      <Card style={{ background: 'transparent' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select value={searchField} onChange={setSearchField} style={{ width: 110 }}
            options={[
              { value: 'all', label: t('users.searchAll') },
              { value: 'id', label: 'ID' },
              { value: 'name', label: t('users.name') },
              { value: 'email', label: t('users.email') },
              { value: 'age', label: t('users.age') },
            ]}
          />
          <Input placeholder={t('users.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            onPressEnter={() => { setPage(1); fetchUsers(); }} style={{ width: 220 }} prefix={<SearchOutlined />} allowClear />
          <Button type="primary" onClick={() => { setPage(1); fetchUsers(); }}>{t('users.search')}</Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>{t('users.reset')}</Button>
          <div style={{ flex: 1 }} />
          {perm.canWrite && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
              style={{ background: '#10b981', borderColor: '#10b981' }}>{t('users.create')}</Button>
          )}
        </div>

        <Table columns={columns} dataSource={users} rowKey="id" loading={loading} scroll={{ x: 1100 }}
          onChange={handleTableChange}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`, pageSizeOptions: ['5', '10', '20', '50'] }}
          locale={{ emptyText: t('users.noData') }} />
      </Card>

      <Modal title={modalMode === 'create' ? t('users.create') : t('users.edit')} open={modalOpen}
        onOk={handleModalOk} onCancel={() => setModalOpen(false)} confirmLoading={submitting} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('users.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('users.email')} rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="age" label={t('users.age')} rules={[{ type: 'number', min: 0, max: 200, transform: (v: string) => v ? Number(v) : undefined }]}>
            <Input />
          </Form.Item>
          {perm.canDelete && (
            <Form.Item name="role" label={t('users.role')}>
              <DictSelect dictCode="role" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
