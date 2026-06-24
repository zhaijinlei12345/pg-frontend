import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, Typography, App } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try { await login(values.email, values.password); navigate('/users', { replace: true }); }
    catch (err: any) { message.error(err.response?.data?.message || '登录失败'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (values: { name: string; email: string; password: string; age?: string }) => {
    setLoading(true);
    try { await register(values.name, values.email, values.password, values.age ? Number(values.age) : undefined); navigate('/users', { replace: true }); }
    catch (err: any) { message.error(err.response?.data?.message || '注册失败'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0a0b14',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景光晕 */}
      <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '60%', height: '80%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '50%', height: '70%',
        background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* 左侧品牌区 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 60, position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, marginBottom: 28,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 40px rgba(99,102,241,0.35)',
        }}>
          <ThunderboltOutlined style={{ fontSize: 34, color: '#fff' }} />
        </div>
        <Title level={1} style={{ color: '#f1f5f9', marginBottom: 8, fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
          Admin Panel
        </Title>
        <Text style={{ color: '#64748b', fontSize: 16 }}>企业级用户管理系统</Text>
        <div style={{ marginTop: 48, display: 'flex', gap: 32 }}>
          {[
            { num: '三级', label: '角色体系' },
            { num: '实时', label: '操作日志' },
            { num: 'JWT', label: '安全认证' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#a5b4fc' }}>{item.num}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧登录卡片 */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(15,17,25,0.85)',
          backdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          <Tabs
            activeKey={tab}
            onChange={k => { setTab(k as 'login' | 'register'); form.resetFields(); }}
            centered
            items={[
              { key: 'login', label: '登 录' },
              { key: 'register', label: '注 册' },
            ]}
            style={{ padding: '0 24px' }}
            tabBarStyle={{ borderColor: 'rgba(255,255,255,0.06)', marginBottom: 0 }}
          />

          <div style={{ padding: '24px 28px 32px' }}>
            <Form form={form} onFinish={tab === 'login' ? handleLogin : handleRegister} layout="vertical" size="large">
              {tab === 'register' && (
                <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                  <Input prefix={<UserOutlined />} placeholder="姓名" />
                </Form.Item>
              )}

              <Form.Item name="email" rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}>
                <Input prefix={<MailOutlined />} placeholder="邮箱" />
              </Form.Item>

              <Form.Item name="password" rules={[
                { required: true, message: '请输入密码' },
                ...(tab === 'register' ? [{ min: 6, message: '密码至少6位' }] : []),
              ]}>
                <Input.Password prefix={<LockOutlined />} placeholder={tab === 'login' ? '密码' : '密码（至少6位）'} />
              </Form.Item>

              {tab === 'register' && (
                <Form.Item name="age" rules={[
                  { type: 'number', min: 0, max: 200, message: '年龄须在 0-200 之间', transform: (v: string) => v ? Number(v) : undefined },
                ]}>
                  <Input placeholder="年龄（选填，0-200）" />
                </Form.Item>
              )}

              <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                <Button type="primary" htmlType="submit" loading={loading} block size="large"
                  style={{ height: 44, fontSize: 16, fontWeight: 600, borderRadius: 10 }}>
                  {tab === 'login' ? '登 录' : '创 建 账 号'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
