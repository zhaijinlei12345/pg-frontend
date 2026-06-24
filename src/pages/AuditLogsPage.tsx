import { useTranslation } from 'react-i18next';
import { Select, Typography, Card, Table, Tag } from 'antd';
import type { AuditLog } from '../api/auditLogs.api';
import type { ColumnsType } from 'antd/es/table';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useDictData } from '../hooks/useDict';

const { Title, Text } = Typography;

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const { data: actionDict } = useDictData('audit_action');
  const { logs, loading, total, page, pageSize, actionFilter, setPage, setPageSize, setActionFilter } = useAuditLogs();

  function actionTag(a: string) {
    const e = actionDict?.entries.find((x) => x.key === a);
    return <Tag color={e?.color || undefined}>{e?.label || a}</Tag>;
  }

  const columns: ColumnsType<AuditLog> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: t('users.name'), dataIndex: 'user_name', key: 'user_name', width: 180 },
    { title: t('users.action'), dataIndex: 'action', key: 'action', width: 100, render: actionTag },
    { title: t('common.detail'), key: 'target', width: 160, render: (_, r) => `${r.target_type} #${r.target_id}` },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (v: string | null) => {
        if (!v) return '-';
        try {
          return JSON.stringify(JSON.parse(v));
        } catch {
          return v;
        }
      },
    },
    {
      title: t('users.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          {t('menu.audit')}
        </Title>
        <Text type="secondary">{t('users.desc')}</Text>
      </div>
      <Card style={{ background: 'transparent' }}>
        <div style={{ marginBottom: 16 }}>
          <Select
            value={actionFilter}
            onChange={(v) => {
              setActionFilter(v);
              setPage(1);
            }}
            style={{ width: 130 }}
            allowClear
            placeholder={t('users.action')}
            options={(actionDict?.entries || []).map((e) => ({ value: e.key, label: e.label }))}
          />
        </div>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (cnt) => `${cnt}`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          locale={{ emptyText: t('common.noData') }}
        />
      </Card>
    </div>
  );
}
