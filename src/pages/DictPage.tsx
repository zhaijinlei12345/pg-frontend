import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Typography,
  Card,
  App,
  Tag,
  Row,
  Col,
  Switch,
} from 'antd';
import { PlusOutlined, ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { dictAPI } from '../api/dict.api';
import type { DictType, DictEntry } from '../api/dict.api';
import { useDictTypes, useDictEntries } from '../hooks/useDict';

const { Title, Text } = Typography;

export default function DictPage() {
  const { t } = useTranslation();
  const { message: msg } = App.useApp();
  const { types, loading: typesLoading, refresh: refreshTypes } = useDictTypes();
  const [selectedType, setSelectedType] = useState<string>('');
  const { entries, loading: entriesLoading, refresh: refreshEntries } = useDictEntries(selectedType);

  const [typeModal, setTypeModal] = useState(false);
  const [typeEdit, setTypeEdit] = useState<DictType | null>(null);
  const [typeForm] = Form.useForm();
  const openTypeCreate = () => {
    setTypeEdit(null);
    typeForm.resetFields();
    setTypeModal(true);
  };
  const openTypeEdit = (dt: DictType) => {
    setTypeEdit(dt);
    typeForm.setFieldsValue({ name: dt.name, description: dt.description });
    setTypeModal(true);
  };
  const handleTypeDelete = async (code: string) => {
    try {
      await dictAPI.deleteType(code);
      msg.success(t('common.delete') + ' OK');
      if (selectedType === code) setSelectedType('');
      refreshTypes();
    } catch {
      msg.error(t('common.delete') + ' Failed');
    }
  };
  const handleTypeOk = async () => {
    try {
      const values = await typeForm.validateFields();
      if (typeEdit) {
        await dictAPI.updateType(typeEdit.code, values);
      } else {
        await dictAPI.createType(values);
      }
      msg.success(typeEdit ? t('common.edit') + ' OK' : t('dict.createType') + ' OK');
      setTypeModal(false);
      refreshTypes();
    } catch {
      /* validation */
    }
  };

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
    entryForm.setFieldsValue({
      key: e.key,
      label: e.label,
      color: e.color,
      sort_order: e.sort_order,
      enabled: e.enabled,
    });
    setEntryModal(true);
  };
  const handleEntryDelete = async (key: string) => {
    try {
      await dictAPI.deleteEntry(selectedType, key);
      msg.success(t('common.delete') + ' OK');
      refreshEntries();
    } catch {
      msg.error(t('common.delete') + ' Failed');
    }
  };
  const handleEntryOk = async () => {
    try {
      const values = await entryForm.validateFields();
      if (entryEdit) {
        await dictAPI.updateEntry(selectedType, entryEdit.key, values);
      } else {
        await dictAPI.createEntry(selectedType, values);
      }
      msg.success(entryEdit ? t('common.edit') + ' OK' : t('dict.createEntry') + ' OK');
      setEntryModal(false);
      refreshEntries();
    } catch {
      /* validation */
    }
  };

  const typeColumns: ColumnsType<DictType> = [
    {
      title: t('dict.code'),
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    { title: t('dict.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('dict.desc_field'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v: string | null) => v || '-',
    },
    { title: t('dict.entryCount'), dataIndex: 'entry_count', key: 'entry_count', width: 80, align: 'center' },
    {
      title: t('users.action'),
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_, r) => (
        <Space wrap>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedType(r.code);
            }}
          >
            {t('dict.viewEntries')}
          </Button>
          <Button type="link" size="small" onClick={() => openTypeEdit(r)}>
            {t('common.edit')}
          </Button>
          {r.entry_count === '0' && (
            <Popconfirm title={t('users.confirmDelete')} onConfirm={() => handleTypeDelete(r.code)}>
              <Button type="link" size="small" danger>
                {t('common.delete')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const entryColumns: ColumnsType<DictEntry> = [
    { title: t('dict.key'), dataIndex: 'key', key: 'key', width: 120, render: (v: string) => <Tag>{v}</Tag> },
    { title: t('dict.label'), dataIndex: 'label', key: 'label', width: 120 },
    {
      title: t('dict.color'),
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (v: string | null) => (v ? <Tag color={v}>{v}</Tag> : '-'),
    },
    { title: t('dict.sort'), dataIndex: 'sort_order', key: 'sort_order', width: 70 },
    {
      title: t('dict.enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      width: 70,
      render: (v: boolean) =>
        v ? <Tag color="green">{t('common.yes')}</Tag> : <Tag color="red">{t('common.no')}</Tag>,
    },
    {
      title: t('users.action'),
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_, r) => (
        <Space wrap>
          <Button type="link" size="small" onClick={() => openEntryEdit(r)}>
            {t('common.edit')}
          </Button>
          <Popconfirm title={t('users.confirmDelete')} onConfirm={() => handleEntryDelete(r.key)}>
            <Button type="link" size="small" danger>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          {t('dict.title')}
        </Title>
        <Text type="secondary">{t('dict.desc')}</Text>
      </div>
      <Row gutter={16}>
        <Col span={selectedType ? 12 : 24}>
          <Card
            title={t('dict.types')}
            extra={
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openTypeCreate}>
                {t('dict.createType')}
              </Button>
            }
            style={{ background: 'transparent' }}
          >
            <Table
              columns={typeColumns}
              dataSource={types}
              rowKey="code"
              loading={typesLoading}
              scroll={{ x: 750 }}
              size="middle"
              pagination={false}
              locale={{ emptyText: t('dict.noTypes') }}
              onRow={(r) => ({
                onClick: () => setSelectedType(r.code),
                style: { background: selectedType === r.code ? 'rgba(99,102,241,0.08)' : undefined, cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>
        {selectedType && (
          <Col span={12}>
            <Card
              title={`${selectedType} ${t('dict.entries')}`}
              extra={
                <Space>
                  <Button size="small" icon={<ReloadOutlined />} onClick={refreshEntries}>
                    {t('dict.refresh')}
                  </Button>
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openEntryCreate}>
                    {t('dict.createEntry')}
                  </Button>
                  <Button size="small" icon={<CloseOutlined />} onClick={() => setSelectedType('')}>
                    {t('dict.close')}
                  </Button>
                </Space>
              }
              style={{ background: 'transparent' }}
            >
              <Table
                columns={entryColumns}
                dataSource={entries}
                rowKey="key"
                loading={entriesLoading}
                scroll={{ x: 650 }}
                size="middle"
                pagination={false}
                locale={{ emptyText: t('dict.noEntries') }}
              />
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title={typeEdit ? t('dict.editType') : t('dict.createTypeTitle')}
        open={typeModal}
        onOk={handleTypeOk}
        onCancel={() => setTypeModal(false)}
        destroyOnClose
      >
        <Form form={typeForm} layout="vertical" style={{ marginTop: 16 }}>
          {!typeEdit && (
            <Form.Item name="code" label={t('dict.code')} rules={[{ required: true }, { pattern: /^[a-z_]+$/ }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="name" label={t('dict.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('dict.desc_field')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={entryEdit ? t('common.edit') : `${selectedType} ${t('dict.createEntry')}`}
        open={entryModal}
        onOk={handleEntryOk}
        onCancel={() => setEntryModal(false)}
        destroyOnClose
      >
        <Form form={entryForm} layout="vertical" style={{ marginTop: 16 }}>
          {!entryEdit && (
            <Form.Item name="key" label={t('dict.key')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="label" label={t('dict.label')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label={t('dict.color')}>
            <Input />
          </Form.Item>
          <Form.Item name="sort_order" label={t('dict.sort')}>
            <Input type="number" />
          </Form.Item>
          {entryEdit && (
            <Form.Item name="enabled" label={t('dict.enabled')} valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
