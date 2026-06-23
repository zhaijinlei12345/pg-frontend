import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, Typography, App } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
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
    try {
      await login(values.email, values.password);
      navigate('/users', { replace: true });
    } catch (err: any) {
      message.error(err.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { name: string; email: string; password: string; age?: string }) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password, values.age ? Number(values.age) : undefined);
      navigate('/users', { replace: true });
    } catch (err: any) {
      message.error(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>⚡</div>
        <Title level={3} style={{ margin: 0, color: '#e1e4ed' }}>Admin Panel</Title>
        <Text type="secondary">用户管理系统</Text>
      </div>

      <div style={{
        width: 420,
        background: 'rgba(23,25,40,0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.06)',
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

        <div style={{ padding: '24px 28px 28px' }}>
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

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {tab === 'login' ? '登 录' : '创 建 账 号'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
