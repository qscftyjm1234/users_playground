import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Receipt, Search, X, Check, Users as UsersIcon, Loader2, Trash2 } from 'lucide-react';
import { message, Popconfirm, Select, Modal, Form, InputNumber, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { cn } from '../../lib/utils';
import Input from '../../components/uiInterface/Input';
import groupDetailApi from '../../api/groupDetailApi';

export default function ExpensesPage({ isDarkMode, groupData, groupId, user }) {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, sumRes] = await Promise.all([
        groupDetailApi.expenses.getAll(groupId),
        groupDetailApi.expenses.getSummary(groupId)
      ]);
      setExpenses(expRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to fetch expense data:', err);
      message.error('無法載入支出資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchData();
  }, [groupId]);

  // 2. Handle Add
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        amount: values.amount,
        category: values.category || '一般',
        notes: values.notes,
        splitUserIds: values.splitUserIds
      };
      await groupDetailApi.expenses.add(groupId, payload);
      message.success('支出已記錄');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      message.error('新增支出失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    try {
      await groupDetailApi.expenses.delete(groupId, id);
      message.success('支出已刪除');
      fetchData();
    } catch (err) {
      message.error('刪除失敗');
    }
  };

  const mySummary = summary.find(s => s.userId === user?.id);

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
            {groupData?.name || '群組'} 支出紀錄
          </h2>
          <p className="text-sm text-slate-500 font-medium">管理群組中的所有開銷細目</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 flex items-center gap-2 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          記一筆
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="搜尋支出紀錄..." prefix={<Search size={18} className="text-slate-400" />} />
            </div>
          </div>

          <div className={cn(
            "rounded-[32px] border shadow-sm overflow-hidden",
            { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
          )}>
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center opacity-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="font-bold tracking-widest uppercase text-xs">資料同步中...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-20 text-center opacity-50">
                <p className="font-bold text-slate-400">目前沒有支出紀錄</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={cn(
                    "border-b text-[10px] uppercase tracking-widest font-black",
                    { "border-slate-800 text-slate-500": isDarkMode, "border-slate-100 text-slate-400": !isDarkMode }
                  )}>
                    <th className="p-6">類別項目</th>
                    <th className="p-6">金額 / 個人分擔</th>
                    <th className="p-6 text-right">管理</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {expenses.map(e => {
                    const shareCount = e.shares?.length || 1;
                    const perPerson = (e.amount / shareCount).toFixed(0);
                    return (
                      <tr key={e.id} className={cn(
                        "group border-b last:border-0 transition-colors",
                        { "border-slate-800 hover:bg-slate-800/40": isDarkMode, "border-slate-50 hover:bg-slate-50/50": !isDarkMode }
                      )}>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center",
                              { "bg-slate-800 text-blue-400": isDarkMode, "bg-blue-50 text-blue-600": !isDarkMode }
                            )}>
                              <Receipt size={22} />
                            </div>
                            <div>
                              <p className={cn("font-bold text-base", { "text-white": isDarkMode, "text-slate-800": !isDarkMode })}>
                                {e.notes || e.category}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                {dayjs(e.date).format('YYYY-MM-DD')} • {e.category} • {e.paidBy} 支付
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className={cn("font-black text-lg", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>${e.amount.toLocaleString()}</p>
                          <p className="text-xs text-emerald-500 font-bold">每人應付 ${perPerson}</p>
                        </td>
                        <td className="p-6 text-right">
                          <Popconfirm
                            title="確定要刪除這筆支出嗎？"
                            onConfirm={() => handleDelete(e.id)}
                            okText="確定"
                            cancelText="取消"
                          >
                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </Popconfirm>
                        </td>
                      </tr>
                    )})}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* 我的結算概況 */}
          <div className={cn(
            "p-8 rounded-[32px] border shadow-sm",
            { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
          )}>
            <h3 className={cn("text-lg font-bold mb-6 flex items-center gap-2", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
              <Wallet size={20} className="text-blue-500" />
              我的結算概況
            </h3>
            {loading ? (
              <div className="h-40 flex items-center justify-center opacity-30">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">總計代付</span>
                  <span className="text-sm font-black text-emerald-500">+${mySummary?.totalPaid.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">總計應付 (欠款)</span>
                  <span className="text-sm font-black text-red-500">-${mySummary?.totalOwed.toLocaleString() || 0}</span>
                </div>
                
                <div className={cn(
                  "text-center py-6 rounded-3xl border-2 border-dashed transition-all",
                  { 
                    "bg-emerald-500/10 border-emerald-500/20": (mySummary?.netBalance || 0) > 0,
                    "bg-red-500/10 border-red-500/20": (mySummary?.netBalance || 0) < 0,
                    "bg-slate-100 dark:bg-slate-800 border-transparent": (mySummary?.netBalance || 0) === 0
                  }
                )}>
                  <p className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-[0.2em]">目前的淨結算</p>
                  <h1 className={cn("text-4xl font-black", { 
                    "text-emerald-500": (mySummary?.netBalance || 0) > 0,
                    "text-red-500": (mySummary?.netBalance || 0) < 0,
                    "text-slate-400": (mySummary?.netBalance || 0) === 0
                  })}>
                    {(mySummary?.netBalance || 0) > 0 ? '+' : ''}${Math.abs(mySummary?.netBalance || 0).toLocaleString()}
                  </h1>
                  <p className="text-xs font-bold opacity-60 mt-1">
                    {(mySummary?.netBalance || 0) > 0 ? '別人該給你' : (mySummary?.netBalance || 0) < 0 ? '你該給別人' : '已全部清空'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 群組成員排行/概況 */}
          <div className={cn(
            "p-8 rounded-[32px] border shadow-sm",
            { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
          )}>
            <h3 className={cn("text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6", { "text-slate-500": isDarkMode })}>
              群組結算列表
            </h3>
            <div className="space-y-4">
              {summary.map(s => (
                <div key={s.userId} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-black">
                      {s.username[0]}
                    </div>
                    <span className={cn("text-sm font-bold", { "text-white": isDarkMode, "text-slate-700": !isDarkMode })}>{s.username}</span>
                  </div>
                  <span className={cn("text-xs font-black", { "text-emerald-500": s.netBalance > 0, "text-red-500": s.netBalance < 0, "text-slate-400": s.netBalance === 0 })}>
                    {s.netBalance > 0 ? '+' : ''}${s.netBalance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 新增支出視窗 */}
      <Modal
        title={<span className="text-xl font-black">記一筆新支出</span>}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
        width={500}
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          initialValues={{
            splitUserIds: groupData?.members?.map(m => m.id) || [],
            date: dayjs()
          }}
          className="mt-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="amount"
              label={<span className="font-bold">金額</span>}
              rules={[{ required: true, message: '請輸入金額' }]}
            >
              <InputNumber 
                className="w-full h-12 flex items-center rounded-xl overflow-hidden text-lg font-black" 
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            <Form.Item
              name="category"
              label={<span className="font-bold">類別</span>}
            >
              <Select className="h-12 w-full rounded-xl" placeholder="選擇分類">
                <Select.Option value="餐飲">餐飲</Select.Option>
                <Select.Option value="生活家居">生活家居</Select.Option>
                <Select.Option value="交通">交通</Select.Option>
                <Select.Option value="娛樂">娛樂</Select.Option>
                <Select.Option value="一般">一般</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span className="font-bold">備註項目</span>}
            rules={[{ required: true, message: '請輸入項目名稱' }]}
          >
            <Input placeholder="例如：買菜、水費、晚餐" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="splitUserIds"
            label={<div className="flex justify-between w-full font-bold"><span>參與分攤成員</span></div>}
            rules={[{ required: true, message: '至少選擇一位成員' }]}
          >
            <Select 
              mode="multiple" 
              className="w-full"
              placeholder="選擇參與成員"
              maxTagCount="responsive"
            >
              {groupData?.members?.map(m => (
                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 mt-8">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
              確認新增並同步
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
