import { useState } from 'react';
import { Card, Form, Input, Button, Typography, App, Divider, Descriptions, Tag } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';
import { useDictData } from '../hooks/useDict';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, updateAuth } = useAuth();
  const { message: msg } = App.useApp();
  const { data: roleDict } = useDictData('role');
  const [profileForm] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const roleEntry = roleDict?.entries.find(e => e.key === user?.role);

  const handleProfile = async (values: { name: string; email: string; age?: string }) => {
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile({
        ...values,
        age: values.age ? Number(values.age) : undefined,
      });
      // 更新 Context 中的用户信息和 token
      updateAuth(res.data.data.user, res.data.data.token);
      msg.success('个人信息已更新');
    } catch (err: any) {
      msg.error(err.response?.data?.message || '更新失败');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (values: { oldPassword: string; newPassword: string }) => {
    setPwdLoading(true);
    try {
      await authAPI.changePassword(values);
      msg.success('密码修改成功，请牢记新密码');
      pwdForm.resetFields();
    } catch (err: any) {
      msg.error(err.response?.data?.message || '修改失败');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: '#e1e4ed', marginBottom: 4 }}>👤 个人中心</Title>
        <Text type="secondary">管理你的账户信息和安全设置</Text>
      </div>

      {/* 基本信息 */}
      <Card
        title="基本信息"
        style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24 }}
      >
        <Descriptions column={1} size="small" style={{ marginBottom: 24 }}
          labelStyle={{ color: '#6b7280' }}
          contentStyle={{ color: '#e1e4ed' }}
        >
          <Descriptions.Item label="注册时间">
            {user?.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={roleEntry?.color || undefined}>{roleEntry?.label || user?.role || '用户'}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '0 0 20px', borderColor: 'rgba(255,255,255,0.06)' }} />

        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfile}
          initialValues={{ name: user?.name, email: user?.email, age: user?.age }}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input prefix={<UserOutlined />} placeholder="姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="age" label="年龄">
            <Input placeholder="年龄（选填）" type="number" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={profileLoading} icon={<SaveOutlined />}>
            保存修改
          </Button>
        </Form>
      </Card>

      {/* 修改密码 */}
      <Card
        title="修改密码"
        style={{ background: 'rgba(23,25,40,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <Form
          form={pwdForm}
          layout="vertical"
          onFinish={handlePassword}
        >
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="输入原密码" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '新密码至少6位' },
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="新密码（至少6位）" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={pwdLoading} icon={<LockOutlined />}>
            修改密码
          </Button>
        </Form>
      </Card>
    </div>
  );
}
