import { Typography, Statistic, Row, Col, Card, Progress, Table, Tag, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { UserOutlined, PieChartOutlined, RiseOutlined, FileTextOutlined, ShoppingOutlined, OrderedListOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDashboard } from '../hooks/useDashboard';
import { useDictData } from '../hooks/useDict';
import type { AuditLog } from '../api/auditLogs.api';

const { Title, Text } = Typography;

const ROLE_COLORS: Record<string, string> = { admin: '#a855f7', leader: '#3b82f6', user: '#6b7280' };
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

function BarChart({ data }: { data: { date: string; count: string }[] }) {
  if (!data.length) return <Text type="secondary">暂无数据</Text>;
  const max = Math.max(...data.map(d => parseInt(d.count)), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: '#e1e4ed', marginBottom: 4 }}>{d.count}</Text>
          <div style={{
            width: '100%', maxWidth: 40,
            height: `${Math.max((parseInt(d.count) / max) * 100, 4)}%`,
            background: CHART_COLORS[i % CHART_COLORS.length],
            borderRadius: '4px 4px 0 0',
            minHeight: 4,
            transition: 'height 0.3s',
          }} />
          <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 6, whiteSpace: 'nowrap' }}>
            {d.date.slice(5)}
          </Text>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { stats, loading } = useDashboard();
  const { data: roleDict } = useDictData('role');
  const { data: actionDict } = useDictData('audit_action');
  const { data: statusDict } = useDictData('order_status');

  const roleDist = stats?.roleDistribution || [];
  const totalRole = roleDist.reduce((s, r) => s + parseInt(r.count), 0) || 1;
  const trend = stats?.newUserTrend || [];
  const logs = stats?.recentLogs || [];
  const today = trend.length > 0 ? parseInt(trend[trend.length - 1].count) : 0;
  const weekTotal = (trend).reduce((s, d) => s + parseInt(d.count), 0);

  const logColumns: ColumnsType<AuditLog> = [
    { title: '操作人', dataIndex: 'user_name', width: 120 },
    {
      title: '操作', dataIndex: 'action', width: 80,
      render: (a: string) => {
        const e = actionDict?.entries.find(x => x.key === a);
        return <Tag color={e?.color || undefined}>{e?.label || a}</Tag>;
      },
    },
    { title: '目标', width: 120, render: (_, r) => `${r.target_type} #${r.target_id}` },
    { title: '时间', dataIndex: 'created_at', width: 160, render: (v: string) => new Date(v).toLocaleString('zh-CN') },
  ];

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}><Spin size="large" /></div>;
  }

  return (
    <div className="page-transition">
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>{t('dashboard.title')}</Title>
        <Text type="secondary">{t("dashboard.desc")}</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={4}>
          <Card style={{ background: 'transparent' }}>
            <Statistic title={t("dashboard.totalUsers")} value={stats?.totalUsers || 0} prefix={<UserOutlined />}
              valueStyle={{ color: '#6366f1' }} />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card style={{ background: 'transparent' }}>
            <Statistic title={t("dashboard.todayNew")} value={today} prefix={<RiseOutlined />}
              valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card style={{ background: 'transparent' }}>
            <Statistic title={t("dashboard.totalProducts")} value={stats?.totalProducts || 0} prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#f59e0b' }} />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card style={{ background: 'transparent' }}>
            <Statistic title={t("dashboard.totalOrders")} value={stats?.totalOrders || 0} prefix={<OrderedListOutlined />}
              valueStyle={{ color: '#8b5cf6' }} />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card style={{ background: 'transparent' }}>
            <Statistic title={t("dashboard.weekNew")} value={weekTotal} prefix={<RiseOutlined />}
              valueStyle={{ color: '#ec4899' }} />
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card style={{ background: 'transparent' }}>
            <Statistic title={t("dashboard.recentLogs")} value={stats?.recentLogs?.length || 0} prefix={<FileTextOutlined />}
              valueStyle={{ color: '#ef4444' }} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 角色分布 */}
        <Col xs={24} md={8}>
          <Card title={<span><PieChartOutlined /> {t('dashboard.roleDist')}</span>}
            style={{ background: 'transparent' }}>
            {roleDist.map(r => {
              const entry = roleDict?.entries.find(e => e.key === r.role);
              const pct = Math.round((parseInt(r.count) / totalRole) * 100);
              return (
                <div key={r.role} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Tag color={entry?.color || undefined}>{entry?.label || r.role}</Tag>
                    <Text style={{ color: '#6b7280' }}>{r.count} 人</Text>
                  </div>
                  <Progress percent={pct} showInfo={false} strokeColor={ROLE_COLORS[r.role] || '#6366f1'}
                    trailColor="rgba(255,255,255,0.04)" size="small" />
                </div>
              );
            })}
            {roleDist.length === 0 && <Text type="secondary">暂无数据</Text>}
          </Card>
        </Col>

        {/* 订单状态分布 */}
        <Col xs={24} md={8}>
          <Card title={<span><OrderedListOutlined /> {t('dashboard.orderStatus')}</span>}
            style={{ background: 'transparent' }}>
            {(stats?.orderStatusDistribution || []).map(s => {
              const entry = statusDict?.entries.find(e => e.key === s.status);
              const totalOrders = stats?.totalOrders || 1;
              const pct = Math.round((parseInt(s.count) / totalOrders) * 100);
              return (
                <div key={s.status} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Tag color={entry?.color || undefined}>{entry?.label || s.status}</Tag>
                    <Text style={{ color: '#6b7280' }}>{s.count} 单</Text>
                  </div>
                  <Progress percent={pct} showInfo={false} strokeColor={entry?.color || '#6366f1'}
                    trailColor="rgba(255,255,255,0.04)" size="small" />
                </div>
              );
            })}
            {(!stats?.orderStatusDistribution || stats.orderStatusDistribution.length === 0) && <Text type="secondary">暂无数据</Text>}
          </Card>
        </Col>

        {/* 近7天趋势 */}
        <Col xs={24} md={8}>
          <Card title={<span><RiseOutlined /> {t('dashboard.trend')}</span>}
            style={{ background: 'transparent' }}>
            <BarChart data={trend} />
          </Card>
        </Col>
      </Row>

      {/* 最近操作 */}
      <Card title={<span><FileTextOutlined /> {t('dashboard.recentOps')}</span>}
        style={{ background: 'transparent' }}>
        <Table
          columns={logColumns}
          dataSource={logs}
          rowKey="id"
          size="small"
          scroll={{ x: 500 }}
          pagination={false}
          locale={{ emptyText: '暂无操作记录' }}
        />
      </Card>
    </div>
  );
}
