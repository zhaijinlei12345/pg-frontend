import { useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Tag, Select } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  BookOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  GlobalOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { usePerms } from '../hooks/usePerms';
import { useTheme } from '../context/ThemeContext';
import { useDictData } from '../hooks/useDict';
import { ROUTES } from '../routes';

const { Sider, Content } = AntLayout;

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { mode, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: roleDict } = useDictData('role');
  const perm = usePerms('audit');
  const dictPerm = usePerms('dict');

  const roleEntry = roleDict?.entries.find((e) => e.key === user?.role);
  const roleLabel = roleEntry?.label || user?.role || '用户';
  const roleColor = roleEntry?.color || 'default';

  const menuItems = [
    { key: ROUTES.DASHBOARD, icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: ROUTES.USERS, icon: <TeamOutlined />, label: t('menu.users') },
    { key: ROUTES.PRODUCTS, icon: <ShoppingOutlined />, label: t('menu.products') },
    { key: ROUTES.ORDERS, icon: <OrderedListOutlined />, label: t('menu.orders') },
    ...(perm.canRead ? [{ key: ROUTES.AUDIT_LOGS, icon: <FileTextOutlined />, label: t('menu.audit') }] : []),
    ...(dictPerm.canManage ? [{ key: ROUTES.DICT, icon: <BookOutlined />, label: t('menu.dict') }] : []),
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: t('user.profile') },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: t('user.logout'), danger: true },
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
          background: mode === 'dark' ? 'rgba(17,19,31,0.95)' : '#fff',
          backdropFilter: 'blur(20px)',
          borderRight: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="sidebar-logo">
          <ThunderboltOutlined style={{ color: '#6366f1', fontSize: 22 }} />
          {t('app.title')}
        </div>

        {/* 语言切换 */}
        <div style={{ padding: '0 24px 12px' }}>
          <Select
            size="small"
            value={i18n.language}
            onChange={(lang) => i18n.changeLanguage(lang)}
            style={{ width: '100%' }}
            suffixIcon={<GlobalOutlined />}
            options={[
              { value: 'zh-CN', label: '🇨🇳 中文' },
              { value: 'en-US', label: '🇺🇸 English' },
            ]}
          />
        </div>

        {/* 主题切换 */}
        <div style={{ padding: '0 24px 12px' }}>
          <Button block size="small" icon={<BulbOutlined />} onClick={toggle}>
            {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </Button>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderInlineEnd: 'none', flex: 1, overflow: 'auto' }}
          theme={mode}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            padding: '12px 16px',
            background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Avatar icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: mode === 'dark' ? '#e1e4ed' : '#333',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 2,
              }}
            >
              {user?.email}
            </div>
            <Tag color={roleColor} style={{ fontSize: 10, lineHeight: '16px' }}>
              {roleLabel}
            </Tag>
          </div>
          <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<LogoutOutlined />}
              style={{ color: mode === 'dark' ? '#9ca3af' : '#666' }}
            />
          </Dropdown>
        </div>
      </Sider>

      <Content style={{ padding: '32px 40px', overflow: 'auto' }}>{children}</Content>
    </AntLayout>
  );
}
