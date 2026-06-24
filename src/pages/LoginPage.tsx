import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, Typography, App } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try { await login(values.email, values.password); navigate('/users', { replace: true }); }
    catch (err: any) { message.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (values: { name: string; email: string; password: string; age?: string }) => {
    setLoading(true);
    try { await register(values.name, values.email, values.password, values.age ? Number(values.age) : undefined); navigate('/users', { replace: true }); }
    catch (err: any) { message.error(err.response?.data?.message || 'Register failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0b14', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '60%', height: '80%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '50%', height: '70%',
        background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, marginBottom: 28, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 40px rgba(99,102,241,0.35)' }}>
          <ThunderboltOutlined style={{ fontSize: 34, color: '#fff' }} />
        </div>
        <Title level={1} style={{ color: '#f1f5f9', marginBottom: 8, fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
          {t('app.title')}
        </Title>
        <Text style={{ color: '#64748b', fontSize: 16 }}>{t('app.subtitle')}</Text>
        <div style={{ marginTop: 48, display: 'flex', gap: 32 }}>
          {['三级', '实时', 'JWT'].map((num, i) => {
            const labels = [t('menu.users'), t('menu.audit'), 'JWT Auth'];
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#a5b4fc' }}>{num}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{labels[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 400, background: 'rgba(15,17,25,0.85)', backdropFilter: 'blur(24px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
          <Tabs activeKey={tab} onChange={k => { setTab(k as 'login' | 'register'); form.resetFields(); }} centered
            items={[
              { key: 'login', label: t('auth.login') },
              { key: 'register', label: t('auth.register') },
            ]}
            style={{ padding: '0 24px' }}
            tabBarStyle={{ borderColor: 'rgba(255,255,255,0.06)', marginBottom: 0 }}
          />

          <div style={{ padding: '24px 28px 32px' }}>
            <Form form={form} onFinish={tab === 'login' ? handleLogin : handleRegister} layout="vertical" size="large">
              {tab === 'register' && (
                <Form.Item name="name" rules={[{ required: true, message: 'Required' }]}>
                  <Input prefix={<UserOutlined />} placeholder={t('auth.name')} />
                </Form.Item>
              )}
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder={t('auth.email')} />
              </Form.Item>
              <Form.Item name="password" rules={[
                { required: true },
                ...(tab === 'register' ? [{ min: 6 }] : []),
              ]}>
                <Input.Password prefix={<LockOutlined />} placeholder={tab === 'login' ? t('auth.password') : t('auth.passwordPlaceholder')} />
              </Form.Item>
              {tab === 'register' && (
                <Form.Item name="age" rules={[{ type: 'number', min: 0, max: 200, transform: (v: string) => v ? Number(v) : undefined }]}>
                  <Input placeholder={t('auth.agePlaceholder')} />
                </Form.Item>
              )}
              <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                <Button type="primary" htmlType="submit" loading={loading} block size="large"
                  style={{ height: 44, fontSize: 16, fontWeight: 600, borderRadius: 10 }}>
                  {tab === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
