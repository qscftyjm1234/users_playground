import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Plus, Loader2 } from 'lucide-react';
import { Modal, Form, Input, Button, message } from 'antd';
import GroupCard from '../../components/groups/GroupCard';
import groupApi from '../../api/groupApi';
import { cn } from '../../lib/utils';

export default function GroupsPage({ isDarkMode }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupApi.getMine();
      // Ensure we have membersCount for the cards (backend might not return it yet, so we fallback)
      const dataWithFallback = res.data.map(g => ({
        ...g,
        membersCount: g.membersCount || 1 // Just a placeholder if not in DTO yet
      }));
      setGroups(dataWithFallback);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      message.error('無法載入群組列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (values) => {
    try {
      setSubmitting(true);
      await groupApi.create(values);
      message.success('群組建立成功！');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchGroups();
    } catch (err) {
      message.error('建立群組失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async (values) => {
    try {
      setSubmitting(true);
      await groupApi.join(values.inviteCode);
      message.success('成功加入群組！');
      setIsJoinModalOpen(false);
      form.resetFields();
      fetchGroups();
    } catch (err) {
      message.error(err.response?.data || '加入群組失敗，請檢查邀請碼');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
          我的群組
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            className={cn(
              "px-4 py-2 font-bold text-sm rounded-xl border transition shadow-sm flex items-center gap-2",
              { 
                "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700": isDarkMode, 
                "bg-white border-slate-200 text-slate-600 hover:bg-gray-50": !isDarkMode 
              }
            )}
          >
            <UserPlus size={18} />
            加入群組
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2"
          >
            <Plus size={18} />
            建立新群組
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="font-bold tracking-widest uppercase text-xs">載入中...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className={cn(
          "flex flex-col items-center justify-center py-20 rounded-[40px] border-2 border-dashed",
          { "border-slate-800 bg-slate-900/50": isDarkMode, "border-slate-200 bg-slate-50": !isDarkMode }
        )}>
          <p className="text-slate-400 font-bold mb-4">您目前還沒有加入任何群組</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-blue-600 font-black hover:underline"
          >
            立即建立一個吧！
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(g => (
            <GroupCard 
              key={g.id} 
              group={g} 
              isDarkMode={isDarkMode} 
              onRefresh={fetchGroups}
            />
          ))}
        </div>
      )}

      {/* 建立群組 Modal */}
      <Modal
        title={<span className="text-xl font-black">建立新群組</span>}
        open={isCreateModalOpen}
        onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateGroup} className="mt-4">
          <Form.Item
            name="name"
            label={<span className={cn("font-bold", isDarkMode ? 'text-slate-300' : 'text-slate-700')}>群組名稱</span>}
            rules={[{ required: true, message: '請輸入群組名稱' }]}
          >
            <Input size="large" placeholder="例如：我的溫馨小家、台北探險隊" />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span className={cn("font-bold", isDarkMode ? 'text-slate-300' : 'text-slate-700')}>描述 (選填)</span>}
          >
            <Input.TextArea size="large" rows={3} placeholder="簡單介紹一下這個群組吧..." />
          </Form.Item>
          <Form.Item className="mb-0 mt-8">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting} 
              block 
              size="large"
              className="h-12 font-black rounded-xl bg-blue-600 hover:bg-blue-700 border-none shadow-lg shadow-blue-200"
            >
              確認建立
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 加入群組 Modal */}
      <Modal
        title={<span className="text-xl font-black">加入現有群組</span>}
        open={isJoinModalOpen}
        onCancel={() => { setIsJoinModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleJoinGroup} className="mt-4">
          <Form.Item
            name="inviteCode"
            label={<span className={cn("font-bold", isDarkMode ? 'text-slate-300' : 'text-slate-700')}>邀請碼 (6位數)</span>}
            rules={[{ required: true, message: '請輸入邀請碼' }, { len: 6, message: '邀請碼應為 6 位數字' }]}
          >
            <Input size="large" placeholder="輸入 6 位專屬代碼" className="text-center text-2xl tracking-[0.5em] font-black" />
          </Form.Item>
          <p className="text-slate-400 text-xs text-center mb-8">
            向群組內的成員索取邀請碼即可快速加入。
          </p>
          <Form.Item className="mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting} 
              block 
              size="large"
              className="h-12 font-black rounded-xl bg-blue-600 hover:bg-blue-700 border-none shadow-lg shadow-blue-200"
            >
              立即加入
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
