import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message, Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, ShieldOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const AdminDashboard = ({ isDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handlePromote = async (id, currentRole) => {
    const newRole = currentRole === 'SystemAdmin' ? 0 : 1; // 0: User, 1: SystemAdmin
    try {
      await adminApi.updateUserRole(id, newRole);
      message.success('角色更新成功');
      fetchUsers();
    } catch (error) {
      message.error('角色更新失敗');
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
            type="link" 
            size="small"
            onClick={() => handlePromote(record.id, record.roleName)}
          >
            {record.role === 1 ? '降級為用戶' : '提升為管理員'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          系統管理後台
        </h2>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchUsers}
          loading={loading}
        >
          重新整理
        </Button>
      </div>

      <Row gap={16}>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <Statistic
              title="總使用者"
              value={users.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <Statistic
              title="管理員人數"
              value={users.filter(u => u.role === 1).length}
              prefix={<ShieldOutlined />}
              valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <Statistic
              title="今日新增"
              value={users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
        <Table 
          columns={columns} 
          dataSource={users} 
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className={isDarkMode ? 'ant-table-dark' : ''}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
