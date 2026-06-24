import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, Typography, App, Divider, Descriptions, Tag } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';
import { useDictData } from '../hooks/useDict';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { t } = useTranslation();
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
      const res = await authAPI.updateProfile({ ...values, age: values.age ? Number(values.age) : undefined });
      updateAuth(res.data.data.user, res.data.data.token);
      msg.success(t('profile.save'));
    } catch (err: any) { msg.error(err.response?.data?.message || 'Failed'); }
    finally { setProfileLoading(false); }
  };

  const handlePassword = async (values: { oldPassword: string; newPassword: string }) => {
    setPwdLoading(true);
    try {
      await authAPI.changePassword(values);
      msg.success(t('profile.changePwdBtn') + ' OK');
      pwdForm.resetFields();
    } catch (err: any) { msg.error(err.response?.data?.message || 'Failed'); }
    finally { setPwdLoading(false); }
  };

  return (
    <div className="page-transition" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>{t('profile.title')}</Title>
        <Text type="secondary">{t('profile.desc')}</Text>
      </div>
      <Card title={t('profile.basicInfo')} style={{ background: 'transparent', marginBottom: 24 }}>
        <Descriptions column={1} size="small" style={{ marginBottom: 24 }} labelStyle={{ color: '#6b7280' }} contentStyle={{ color: '#e1e4ed' }}>
          <Descriptions.Item label={t('profile.registeredAt')}>{user?.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
          <Descriptions.Item label={t('profile.role')}><Tag color={roleEntry?.color || undefined}>{roleEntry?.label || user?.role || 'User'}</Tag></Descriptions.Item>
        </Descriptions>
        <Divider style={{ margin: '0 0 20px', borderColor: 'rgba(255,255,255,0.06)' }} />
        <Form form={profileForm} layout="vertical" onFinish={handleProfile} initialValues={{ name: user?.name, email: user?.email, age: user?.age }}>
          <Form.Item name="name" label={t('profile.name')} rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item>
          <Form.Item name="email" label={t('profile.email')} rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} /></Form.Item>
          <Form.Item name="age" label={t('profile.age')}><Input type="number" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={profileLoading} icon={<SaveOutlined />}>{t('profile.save')}</Button>
        </Form>
      </Card>
      <Card title={t('profile.changePwd')} style={{ background: 'transparent' }}>
        <Form form={pwdForm} layout="vertical" onFinish={handlePassword}>
          <Form.Item name="oldPassword" label={t('profile.oldPwd')} rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} /></Form.Item>
          <Form.Item name="newPassword" label={t('profile.newPwd')} rules={[{ required: true, min: 6 }]}><Input.Password prefix={<LockOutlined />} /></Form.Item>
          <Form.Item name="confirmPassword" label={t('profile.confirmPwd')} dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) return Promise.resolve(); return Promise.reject(new Error(t('profile.pwdMismatch'))); } })]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={pwdLoading} icon={<LockOutlined />}>{t('profile.changePwdBtn')}</Button>
        </Form>
      </Card>
    </div>
  );
}
