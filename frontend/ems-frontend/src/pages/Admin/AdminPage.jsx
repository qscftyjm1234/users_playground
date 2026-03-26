import React from 'react';
import { Activity, Users, ShieldAlert, Database, AlertCircle } from 'lucide-react';

export default function AdminPage({ isDarkMode }) {
  const systemStats = [
    { label: '總用戶數', value: '1,245', icon: Users, color: 'text-blue-500' },
    { label: '活躍群組', value: '382', icon: Database, color: 'text-emerald-500' },
    { label: '系統負載', value: '12%', icon: Activity, color: 'text-purple-500' },
    { label: '異常警告', value: '0', icon: ShieldAlert, color: 'text-rose-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>系統管理員商業後台</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold text-xs rounded-lg">
          <AlertCircle size={14} />
          最高權限模式
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <stat.icon size={28} className={stat.color} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
              <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>最新註冊用戶</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`flex justify-between items-center p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white shadow text-slate-600'}`}>
                    U{i}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>user_{i}@example.com</p>
                    <p className="text-xs text-slate-500">10 分鐘前註冊</p>
                  </div>
                </div>
                <button className={`text-xs font-bold px-3 py-1 rounded-lg ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  管理
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>系統健康監控</h3>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-400">
            [此處將串接 Recharts 顯示伺服器負載曲線]
          </div>
        </div>
      </div>
    </div>
  );
}
