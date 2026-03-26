import React from 'react';
import { Wallet, ListTodo, Calendar, Users, TrendingUp, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function DashboardPage({ isDarkMode, groupData }) {
  const isGroupMode = !!groupData;

  const stats = [
    { 
      title: isGroupMode ? '群組本月總支出' : '全域本月總支出', 
      value: isGroupMode ? `$${groupData.monthlyStats.total.toLocaleString()}` : '$24,800', 
      icon: Wallet, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-100 dark:bg-emerald-900/30' 
    },
    { title: '待辦家務', value: '3', icon: ListTodo, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: '即將到來行程', value: '1', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { 
      title: '群組成員', 
      value: isGroupMode ? `${groupData.membersCount} 人` : '12 人', 
      icon: Users, 
      color: 'text-purple-500', 
      bg: 'bg-purple-100 dark:bg-purple-900/30' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* 群組專屬：本月最終費用統計 */}
      {isGroupMode && (
        <div className={`p-8 rounded-[40px] border shadow-2xl relative overflow-hidden mb-8 ${isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-500 text-white'}`}>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-blue-100 font-bold text-sm mb-2 opacity-80 uppercase tracking-widest">本月最終結算金額 ({groupData.name})</p>
              <h1 className="text-5xl font-black tracking-tighter mb-2">${groupData.monthlyStats.total.toLocaleString()}</h1>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  狀態：{groupData.monthlyStats.status}
                </span>
                <span className="text-blue-100 text-xs font-medium opacity-80 italic">最後更新：剛才</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-blue-100 font-bold text-xs mb-1 opacity-80">您的預計應付/應收</p>
              <h2 className="text-3xl font-black">${groupData.monthlyStats.personal.toLocaleString()}</h2>
              <button className="mt-4 px-6 py-2 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition shadow-lg">
                立即結算
              </button>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg}`}>
              <s.icon size={26} className={s.color} />
            </div>
            <div>
              <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.title}</p>
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* 左側：詳細資訊 */}
        <div className="lg:col-span-2 space-y-8">
          <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp size={20} className="text-blue-500" />
              最近活動紀錄
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-2xl transition hover:ring-2 hover:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-white shadow-sm'}`}>🛒</div>
                    <div>
                      <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>全聯採購</p>
                      <p className="text-xs text-slate-500">昨天由 王小明 支付</p>
                    </div>
                  </div>
                  <div className={`font-black ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>-$850</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition">
              查看全部活動
            </button>
          </div>
        </div>

        {/* 右側：成員列表 (新功能) */}
        <div className="lg:col-span-1 space-y-8">
          <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <ShieldCheck size={20} className="text-blue-500" />
              {isGroupMode ? '群組成員' : '主要聯繫人'}
            </h3>
            <div className="space-y-5">
              {(isGroupMode ? groupData.members : [
                { id: 'u1', name: '王小明', role: '我', avatar: 'M' },
                { id: 'u2', name: '李小華', role: '室友', avatar: 'H' }
              ]).map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${isDarkMode ? 'bg-slate-800' : 'bg-blue-600'}`}>
                      {m.avatar}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{m.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{m.role}</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              管理成員
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
