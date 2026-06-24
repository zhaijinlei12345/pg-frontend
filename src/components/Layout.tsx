import { useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Tag } from 'antd';
import {
  UserOutlined, TeamOutlined, LogoutOutlined, ThunderboltOutlined,
  FileTextOutlined, BookOutlined, DashboardOutlined, ShoppingOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useDictData } from '../hooks/useDict';
import { ROUTES } from '../routes';

const { Sider, Content } = AntLayout;

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: roleDict } = useDictData('role');

  const isAdmin = user?.role === 'admin';

  // 从字典获取角色标签和颜色
  const roleEntry = roleDict?.entries.find(e => e.key === user?.role);
  const roleLabel = roleEntry?.label || user?.role || '用户';
  const roleColor = roleEntry?.color || 'default';

  const menuItems = [
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: ROUTES.USERS,
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: ROUTES.PRODUCTS,
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: ROUTES.ORDERS,
      icon: <OrderedListOutlined />,
      label: '订单管理',
    },
    ...(isAdmin ? [
      {
        key: ROUTES.AUDIT_LOGS,
        icon: <FileTextOutlined />,
        label: '操作日志',
      },
      {
        key: ROUTES.DICT,
        icon: <BookOutlined />,
        label: '数据字典',
      },
    ] : []),
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'profile') navigate(ROUTES.PROFILE);
      if (key === 'logout') logout();
    },
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        style={{
          background: 'rgba(17,19,31,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="sidebar-logo">
          <ThunderboltOutlined style={{ color: '#6366f1', fontSize: 22 }} />
          Admin Panel
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderInlineEnd: 'none',
            marginTop: 8,
          }}
          theme="dark"
        />

        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e1e4ed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
              {user?.email}
            </div>
            <Tag color={roleColor} style={{ fontSize: 10, lineHeight: '16px' }}>
              {roleLabel}
            </Tag>
          </div>
          <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
            <Button type="text" size="small" icon={<LogoutOutlined />} style={{ color: '#9ca3af' }} />
          </Dropdown>
        </div>
      </Sider>

      <Content style={{ padding: '32px 40px', overflow: 'auto' }}>
        {children}
      </Content>
    </AntLayout>
  );
}
