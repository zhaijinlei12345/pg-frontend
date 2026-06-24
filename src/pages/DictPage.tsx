import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Typography, Card, App, Tag, Row, Col, Switch } from 'antd';
import { PlusOutlined, ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { dictAPI } from '../api/dict.api';
import type { DictType, DictEntry } from '../api/dict.api';
import { useDictTypes, useDictEntries } from '../hooks/useDict';

const { Title } = Typography;

export default function DictPage() {
  const { message: msg } = App.useApp();
  const { types, loading: typesLoading, refresh: refreshTypes } = useDictTypes();
  const [selectedType, setSelectedType] = useState<string>('');
  const { entries, loading: entriesLoading, refresh: refreshEntries } = useDictEntries(selectedType);

  // ------ 类型弹窗 ------
  const [typeModal, setTypeModal] = useState(false);
  const [typeEdit, setTypeEdit] = useState<DictType | null>(null);
  const [typeForm] = Form.useForm();

  const openTypeCreate = () => {
    setTypeEdit(null);
    typeForm.resetFields();
    setTypeModal(true);
  };
  const openTypeEdit = (t: DictType) => {
    setTypeEdit(t);
    typeForm.setFieldsValue({ name: t.name, description: t.description });
    setTypeModal(true);
  };
  const handleTypeDelete = async (code: string) => {
    try { await dictAPI.deleteType(code); msg.success('已删除'); if (selectedType === code) setSelectedType(''); refreshTypes(); }
    catch { msg.error('删除失败'); }
  };
  const handleTypeOk = async () => {
    try {
      const values = await typeForm.validateFields();
      if (typeEdit) {
        await dictAPI.updateType(typeEdit.code, values);
      } else {
        await dictAPI.createType(values);
        // 新建成功后不允许改 code，直接关
      }
      msg.success(typeEdit ? '更新成功' : '创建成功');
      setTypeModal(false);
      refreshTypes();
    } catch { /* validation */ }
  };

  // ------ 条目弹窗 ------
  const [entryModal, setEntryModal] = useState(false);
  const [entryEdit, setEntryEdit] = useState<DictEntry | null>(null);
  const [entryForm] = Form.useForm();

  const openEntryCreate = () => {
    setEntryEdit(null);
    entryForm.resetFields();
    setEntryModal(true);
  };
  const openEntryEdit = (e: DictEntry) => {
    setEntryEdit(e);
    entryForm.setFieldsValue({ key: e.key, label: e.label, color: e.color, sort_order: e.sort_order, enabled: e.enabled });
    setEntryModal(true);
  };
  const handleEntryDelete = async (key: string) => {
    try { await dictAPI.deleteEntry(selectedType, key); msg.success('已删除'); refreshEntries(); }
    catch { msg.error('删除失败'); }
  };
  const handleEntryOk = async () => {
    try {
      const values = await entryForm.validateFields();
      if (entryEdit) {
        await dictAPI.updateEntry(selectedType, entryEdit.key, values);
      } else {
        await dictAPI.createEntry(selectedType, values);
      }
      msg.success(entryEdit ? '更新成功' : '创建成功');
      setEntryModal(false);
      refreshEntries();
    } catch { /* validation */ }
  };

  // ------ 表格列 ------
  const typeColumns: ColumnsType<DictType> = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 160, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true, render: (v: string | null) => v || '-' },
    { title: '条目数', dataIndex: 'entry_count', key: 'entry_count', width: 80, align: 'center' },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right' as const,
      render: (_, r) => (
        <Space wrap>
          <Button type="link" size="small" onClick={() => { setSelectedType(r.code); }}>查看条目</Button>
          <Button type="link" size="small" onClick={() => openTypeEdit(r)}>编辑</Button>
          {r.entry_count === '0' && (
            <Popconfirm title="确定删除？" onConfirm={() => handleTypeDelete(r.code)}>
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const entryColumns: ColumnsType<DictEntry> = [
    { title: 'Key', dataIndex: 'key', key: 'key', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: '显示名', dataIndex: 'label', key: 'label', width: 120 },
    { title: '颜色', dataIndex: 'color', key: 'color', width: 100,
      render: (v: string | null) => v ? <Tag color={v}>{v}</Tag> : '-',
    },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 70 },
    { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 70,
      render: (v: boolean) => v ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
    },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right' as const,
      render: (_, r) => (
        <Space wrap>
          <Button type="link" size="small" onClick={() => openEntryEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleEntryDelete(r.key)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: '#e1e4ed', marginBottom: 4 }}>📖 数据字典</Title>
        <Typography.Text type="secondary">管理系统中所有枚举值和下拉选项</Typography.Text>
      </div>

      <Row gutter={16}>
        {/* 左侧：类型列表 */}
        <Col span={selectedType ? 12 : 24}>
          <Card
            title="字典类型"
            extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={openTypeCreate}>新增</Button>}
            style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <Table
              columns={typeColumns}
              dataSource={types}
              rowKey="code"
              loading={typesLoading}
              scroll={{ x: 750 }}
              size="middle"
              pagination={false}
              locale={{ emptyText: '暂无字典类型' }}
              onRow={(r) => ({
                onClick: () => setSelectedType(r.code),
                style: {
                  background: selectedType === r.code ? 'rgba(99,102,241,0.08)' : undefined,
                  cursor: 'pointer',
                },
              })}
            />
          </Card>
        </Col>

        {/* 右侧：条目列表 */}
        {selectedType && (
          <Col span={12}>
            <Card
              title={`${selectedType} 的条目`}
              extra={
                <Space>
                  <Button size="small" icon={<ReloadOutlined />} onClick={refreshEntries}>刷新</Button>
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openEntryCreate}>新增条目</Button>
                  <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedType('')}>关闭</Button>
                </Space>
              }
              style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <Table
                columns={entryColumns}
                dataSource={entries}
                rowKey="key"
                loading={entriesLoading}
                scroll={{ x: 650 }}
                size="middle"
                pagination={false}
                locale={{ emptyText: '暂无条目' }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* 类型 Modal */}
      <Modal
        title={typeEdit ? '编辑字典类型' : '新增字典类型'}
        open={typeModal}
        onOk={handleTypeOk}
        onCancel={() => setTypeModal(false)}
        destroyOnClose
      >
        <Form form={typeForm} layout="vertical" style={{ marginTop: 16 }}>
          {!typeEdit && (
            <Form.Item name="code" label="编码" rules={[
              { required: true, message: '请输入编码' },
              { pattern: /^[a-z_]+$/, message: '只能小写字母+下划线' },
            ]}>
              <Input placeholder="如: user_status" />
            </Form.Item>
          )}
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="如: 用户状态" />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={2} placeholder="描述该字典的用途" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 条目 Modal */}
      <Modal
        title={entryEdit ? '编辑条目' : `为 ${selectedType} 新增条目`}
        open={entryModal}
        onOk={handleEntryOk}
        onCancel={() => setEntryModal(false)}
        destroyOnClose
      >
        <Form form={entryForm} layout="vertical" style={{ marginTop: 16 }}>
          {!entryEdit && (
            <Form.Item name="key" label="Key" rules={[{ required: true }]}>
              <Input placeholder="如: active" />
            </Form.Item>
          )}
          <Form.Item name="label" label="显示名" rules={[{ required: true }]}>
            <Input placeholder="如: 激活" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input placeholder="如: green / #10b981" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
          {entryEdit && (
            <Form.Item name="enabled" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
