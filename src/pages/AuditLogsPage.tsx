import { Select, Typography, Card, Table, Tag } from 'antd';
import type { AuditLog } from '../api/auditLogs.api';
import type { ColumnsType } from 'antd/es/table';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useDictData } from '../hooks/useDict';

const { Title } = Typography;

export default function AuditLogsPage() {
  const { data: actionDict } = useDictData('audit_action');

  function actionTag(a: string) {
    const e = actionDict?.entries.find(x => x.key === a);
    return <Tag color={e?.color || undefined}>{e?.label || a}</Tag>;
  }

  const {
    logs, loading, total,
    page, pageSize, actionFilter,
    setPage, setPageSize, setActionFilter,
  } = useAuditLogs();

  const columns: ColumnsType<AuditLog> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '操作人', dataIndex: 'user_name', key: 'user_name', width: 180 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 100, render: actionTag },
    { title: '目标', key: 'target', width: 160, render: (_, r) => `${r.target_type} #${r.target_id}` },
    { title: '详情', dataIndex: 'details', key: 'details', ellipsis: true,
      render: (v: string | null) => {
        if (!v) return '-';
        try { return JSON.stringify(JSON.parse(v)); } catch { return v; }
      },
    },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: '#e1e4ed', marginBottom: 4 }}>📋 操作日志</Title>
        <Typography.Text type="secondary">记录所有用户增删改操作</Typography.Text>
      </div>

      <Card style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div style={{ marginBottom: 16 }}>
          <Select
            value={actionFilter}
            onChange={v => { setActionFilter(v); setPage(1); }}
            style={{ width: 130 }}
            allowClear
            placeholder="全部操作"
            options={(actionDict?.entries || []).map(e => ({ value: e.key, label: e.label }))}
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
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          locale={{ emptyText: '暂无日志' }}
        />
      </Card>
    </div>
  );
}
