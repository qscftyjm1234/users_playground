import React, { useState, useEffect } from 'react';
import { Wallet, ListTodo, Calendar, TrendingUp, UserPlus, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Modal, Form, Input, Button, message } from 'antd';
import { cn } from '../../lib/utils';
import groupApi from '../../api/groupApi';
import userApi from '../../api/userApi';

export default function DashboardPage({ isDarkMode, groupData }) {
  const isGroupMode = !!groupData;

  // --- 個人模式：Stats from API ---
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!isGroupMode) {
      const fetch = async () => {
        try {
          setLoadingSummary(true);
          const res = await userApi.getSummary();
          setSummary(res.data);
        } catch (err) {
          console.error('Failed to load summary:', err);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetch();
    }
  }, [isGroupMode]);

  // --- 群組模式：邀請成員 ---
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async (values) => {
    try {
      setSubmitting(true);
      await groupApi.invite(groupData.id, values.searchTerm);
      message.success('已成功邀請成員！');
      setIsInviteModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data || '邀請失敗，請確認使用者帳號或 Email 是否正確');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Stats 卡片資料 ---
  const fmt = (n) => (n != null ? `$${Number(n).toLocaleString()}` : '—');

  const stats = [
    {
      title: isGroupMode ? '群組本月總支出' : '個人已付出金額',
      value: isGroupMode
        ? (groupData.monthlyStats?.total != null ? fmt(groupData.monthlyStats.total) : '—')
        : (loadingSummary ? '...' : fmt(summary?.totalPaid)),
      icon: Wallet,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: '待辦任務',
      value: isGroupMode ? '—' : (loadingSummary ? '...' : (summary?.pendingTaskCount ?? 0).toString()),
      icon: ListTodo,
      color: 'text-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      title: '今天活動',
      value: isGroupMode ? '—' : (loadingSummary ? '...' : (summary?.todayEventCount ?? 0).toString()),
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30'
    },
  ];

  return (
    <div className="space-y-6">
      {/* 群組模式：藍色頂部 banner */}
      {isGroupMode && (
        <div className={cn(
          "p-8 rounded-[40px] border shadow-2xl relative overflow-hidden mb-8 transition-colors",
          { "bg-blue-600 border-blue-500 text-white": true }
        )}>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="w-full md:w-auto text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <p className="text-blue-100 font-bold text-sm opacity-80 uppercase tracking-widest leading-none">
                  本月預算執行概況 ({groupData.name})
                </p>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition backdrop-blur-md border border-white/10"
                >
                  <UserPlus size={12} />
                  邀請成員
                </button>
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-2">
                {groupData.monthlyStats?.total != null ? fmt(groupData.monthlyStats.total) : '—'}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  狀態：{groupData.monthlyStats?.status ?? '計算中'}
                </span>
                <span className="text-blue-100 text-xs font-medium opacity-80 italic">最後更新：剛才</span>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-blue-100 font-bold text-xs mb-1 opacity-80">您的應付 / 應收</p>
              <h2 className="text-3xl font-black">
                {groupData.monthlyStats?.personal != null ? fmt(groupData.monthlyStats.personal) : '—'}
              </h2>
              <button className="mt-4 px-6 py-2 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition shadow-lg">
                立即結算
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
        </div>
      )}

      {/* 個人模式：財務淨額大字顯示 */}
      {!isGroupMode && (
        <div className={cn(
          "p-8 rounded-[40px] border shadow-sm relative overflow-hidden mb-2 transition-colors",
          { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
        )}>
          {loadingSummary ? (
            <div className="flex items-center gap-3 opacity-40">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <span className="font-bold text-sm">統計資料載入中...</span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* 淨額 */}
              <div className="text-center md:text-left">
                <p className={cn("text-xs font-black uppercase tracking-widest mb-1", { "text-slate-400": isDarkMode, "text-slate-500": !isDarkMode })}>
                  跨群組淨收支
                </p>
                <h1 className={cn(
                  "text-5xl font-black tracking-tighter",
                  (summary?.netBalance ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {(summary?.netBalance ?? 0) >= 0 ? '+' : ''}{fmt(summary?.netBalance ?? 0)}
                </h1>
                <p className={cn("text-xs mt-1 font-bold", { "text-slate-500": isDarkMode, "text-slate-400": !isDarkMode })}>
                  {(summary?.netBalance ?? 0) >= 0 ? '別人欠你的比你欠別人的多' : '你欠別人的比別人欠你的多'}
                </p>
              </div>
              {/* 付出 / 欠款 明細 */}
              <div className="flex gap-6 md:ml-auto">
                <div className={cn("flex items-center gap-3 p-4 rounded-2xl", { "bg-slate-800": isDarkMode, "bg-emerald-50": !isDarkMode })}>
                  <ArrowUpRight className="text-emerald-500" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-400">我付出去的</p>
                    <p className={cn("text-xl font-black text-emerald-500")}>{fmt(summary?.totalPaid)}</p>
                  </div>
                </div>
                <div className={cn("flex items-center gap-3 p-4 rounded-2xl", { "bg-slate-800": isDarkMode, "bg-rose-50": !isDarkMode })}>
                  <ArrowDownRight className="text-rose-500" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-400">我欠別人的</p>
                    <p className={cn("text-xl font-black text-rose-500")}>{fmt(summary?.totalOwed)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={cn(
            "p-6 rounded-3xl border shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1",
            { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
          )}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg}`}>
              <s.icon size={26} className={s.color} />
            </div>
            <div>
              <p className={cn("text-sm font-semibold mb-1", { "text-slate-400": isDarkMode, "text-slate-500": !isDarkMode })}>{s.title}</p>
              <h3 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
                {loadingSummary && !isGroupMode
                  ? <Loader2 className="animate-spin" size={20} />
                  : s.value
                }
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* 邀請成員 Modal（群組模式用） */}
      <Modal
        title={<span className="text-xl font-black">邀請新夥伴加入</span>}
        open={isInviteModalOpen}
        onCancel={() => { setIsInviteModalOpen(false); form.resetFields(); }}
        footer={null}
        centered
        className={isDarkMode ? 'dark-modal' : ''}
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <UserPlus size={32} />
          </div>
          <p className="text-slate-500 text-center text-sm">
            輸入對方的 <b>Email</b> 或 <b>登入帳號</b>，<br />
            我們會直接將他們加入到 <b>{groupData?.name}</b>。
          </p>
        </div>
        <Form form={form} layout="vertical" onFinish={handleInvite}>
          <Form.Item
            name="searchTerm"
            label={<span className={cn("font-bold", isDarkMode ? 'text-slate-300' : 'text-slate-700')}>搜尋使用者</span>}
            rules={[{ required: true, message: '請輸入 Email 或帳號' }]}
          >
            <Input size="large" placeholder="例如：user@example.com 或 username" className="rounded-xl" />
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
              傳送邀請並加入
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


