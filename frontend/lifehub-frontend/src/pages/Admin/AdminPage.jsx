import React, { useState, useEffect } from 'react';
import { 
  Table, Tag, Space, Button, message, Card, 
  Statistic, Row, Col, Modal, Form, Input, Select, Divider 
} from 'antd';
import { 
  Users as UserIcon, 
  Shield as ShieldIcon, 
  UserPlus as UserAddIcon, 
  RefreshCw as ReloadIcon,
  Edit as EditIcon,
  Key as KeyIcon
} from 'lucide-react';
import adminApi from '../../api/adminApi';

const AdminPage = ({ isDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 編輯 Modal 狀態
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm] = Form.useForm();
  
  // 密碼重設狀態
  const [isResetPasswordVisible, setIsResetPasswordVisible] = useState(false);
  const [resetForm] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('無法讀取使用者列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 開啟編輯 Modal
  const showEditModal = (user) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role
    });
    setIsEditModalVisible(true);
  };

  // 執行資料更新
  const handleUpdateUser = async (values) => {
    try {
      await adminApi.updateUser(editingUser.id, values);
      message.success('使用者資料更新成功');
      setIsEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('更新失敗：' + (error.response?.data || '未知錯誤'));
    }
  };

  // 執行密碼重設
  const handleResetPassword = async (values) => {
    try {
      await adminApi.resetPassword(editingUser.id, values.newPassword);
      message.success('密碼已成功強制重設');
      setIsResetPasswordVisible(false);
      resetForm.resetFields();
    } catch (error) {
      message.error('密碼重設失敗');
    }
  };

  const columns = [
    {
      title: '帳號',
      dataIndex: 'loginAccount',
      key: 'loginAccount',
      render: text => <span className="font-bold">{text}</span>
    },
    {
      title: '顯示名稱',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email',
      render: text => text || <span className="text-slate-400 italic">未提供</span>
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (role, record) => (
        <Tag color={record.role === 1 ? 'gold' : 'blue'}>
          {record.role === 1 ? '管理員' : '一般用戶'}
        </Tag>
      ),
    },
    {
      title: '註冊時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary"
            ghost
            icon={<EditIcon size={14} />}
            size="small"
            className="flex items-center gap-1 rounded-lg"
            onClick={() => showEditModal(record)}
          >
            編輯
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          系統管理員控制台
        </h2>
        <Button 
          icon={<ReloadIcon size={16} />} 
          onClick={fetchUsers}
          loading={loading}
          className="rounded-xl flex items-center"
        >
          重新整理
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} className={`shadow-sm rounded-3xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <Statistic
              title={<span className={isDarkMode ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}>總使用者</span>}
              value={users.length}
              prefix={<UserIcon size={20} className="text-blue-500 mr-1" />}
              valueStyle={{ color: isDarkMode ? '#fff' : '#000', fontWeight: '900' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className={`shadow-sm rounded-3xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <Statistic
              title={<span className={isDarkMode ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}>管理員人數</span>}
              value={users.filter(u => u.role === 1).length}
              prefix={<ShieldIcon size={20} className="text-rose-500 mr-1" />}
              valueStyle={{ color: isDarkMode ? '#fff' : '#000', fontWeight: '900' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className={`shadow-sm rounded-3xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <Statistic
              title={<span className={isDarkMode ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold'}>今日新增</span>}
              value={users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length}
              prefix={<UserAddIcon size={20} className="text-emerald-500 mr-1" />}
              valueStyle={{ color: isDarkMode ? '#fff' : '#000', fontWeight: '900' }}
            />
          </Card>
        </Col>
      </Row>

      <div className={`p-6 rounded-3xl border shadow-md overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            dataSource={users} 
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            className={isDarkMode ? 'custom-antd-dark' : ''}
          />
        </div>
      </div>

      {/* 編輯使用者資料 Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2">
            <EditIcon size={20} className="text-blue-500" />
            <span>編輯使用者：{editingUser?.loginAccount}</span>
          </div>
        }
        open={isEditModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setIsEditModalVisible(false)}
        okText="儲存變更"
        cancelText="取消"
        destroyOnClose
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateUser}
          className="mt-4"
        >
          <Form.Item
            name="username"
            label="顯示姓名"
            rules={[{ required: true, message: '請輸入姓名' }]}
          >
            <Input placeholder="使用者顯示的名稱" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="電子郵件"
          >
            <Input placeholder="example@mail.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="系統角色"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={0}>一般用戶 (User)</Select.Option>
              <Select.Option value={1}>系統管理員 (SystemAdmin)</Select.Option>
            </Select>
          </Form.Item>

          <Divider />
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold mb-3 flex items-center gap-2">
              <KeyIcon size={16} className="text-rose-500" />
              危險操作：強制重設密碼
            </p>
            {!isResetPasswordVisible ? (
              <Button 
                danger 
                type="dashed" 
                block 
                onClick={() => setIsResetPasswordVisible(true)}
              >
                顯示密碼重設表單
              </Button>
            ) : (
              <Form
                form={resetForm}
                layout="inline"
                onFinish={handleResetPassword}
                className="flex items-start"
              >
                <Form.Item
                  name="newPassword"
                  rules={[{ required: true, message: '請輸入新密碼' }, { min: 6, message: '至少 6 位' }]}
                  className="flex-1 !mr-2"
                >
                  <Input.Password placeholder="輸入新密碼" />
                </Form.Item>
                <Button type="primary" danger onClick={() => resetForm.submit()}>
                  確認重設
                </Button>
                <Button 
                  type="text" 
                  onClick={() => setIsResetPasswordVisible(false)}
                  className="mt-1"
                >
                  取消
                </Button>
              </Form>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;
