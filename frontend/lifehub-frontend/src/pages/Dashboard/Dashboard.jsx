import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Activity, TrendingUp, ChevronRight, UserPlus, Clock, History, User, Tag } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion } from 'framer-motion';
import employeeApi from '../../api/employeeApi';
import auditApi from '../../api/auditApi';
import { getEmployeeStatusConfig } from '../../utils/statusAdapter';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ icon: Icon, label, value, colorClass, isDarkMode, index = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="premium-card p-6 flex items-center gap-6"
  >
    <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center text-white shadow-lg`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mt-0.5`}>{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = ({ isDarkMode }) => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          employeeApi.getStats(),
          auditApi.getRecentLogs(5)
        ]);
        setStats(statsRes.data);
        setRecentLogs(logsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-slate-400 animate-pulse text-xl">載入數據中...</p>
    </div>
  );

  const statusData = stats?.employeesByStatus.map(s => ({
    name: getEmployeeStatusConfig(s.status).label,
    value: s.count,
    status: s.status
  })) || [];

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          index={0}
          icon={Users} 
          label="總人數" 
          value={stats?.totalEmployees || 0} 
          colorClass="bg-blue-600 shadow-blue-200"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          index={1}
          icon={Activity} 
          label="活躍率" 
          value={`${Math.round((stats?.employeesByStatus.find(s => s.status === 1)?.count || 0) / (stats?.totalEmployees || 1) * 100)}%`} 
          colorClass="bg-emerald-500 shadow-emerald-200"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          index={2}
          icon={Briefcase} 
          label="部門數量" 
          value={stats?.employeesByDepartment.length || 0} 
          colorClass="bg-indigo-600 shadow-indigo-200"
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Distribution (2/3 width) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="premium-card p-8 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <TrendingUp size={24} className="text-blue-600" />
              部門人力分佈圖
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.employeesByDepartment || []}>
                <XAxis 
                  dataKey="departmentName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#2563eb" 
                  radius={[8, 8, 8, 8]} 
                  barSize={40}
                  label={{ position: 'top', fill: '#64748b', fontSize: 12, fontWeight: 800 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Breakdown (1/3 width) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="premium-card p-8"
        >
           <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-10 flex items-center gap-2`}>
            <Clock size={24} className="text-emerald-500" />
            成員狀態佔比
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
           <div className="mt-8 grid grid-cols-2 gap-3">
              {stats?.employeesByStatus.map((s, idx) => (
                <div 
                  key={s.status} 
                  className={`p-4 rounded-2xl border flex flex-col items-center group transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' 
                      : 'bg-slate-50 border-slate-100 hover:bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <span className={`text-xl font-black transition-transform group-hover:scale-110 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.count}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{getEmployeeStatusConfig(s.status).label}</span>
                </div>
              ))}
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="premium-card p-8 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-10 flex items-center gap-2`}>
            <Clock size={24} className="text-emerald-500" />
            最近系統活動
          </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">查看更多</button>
          </div>
          <div className="space-y-6">
            {recentLogs.map((log, idx) => (
              <div 
                key={log.id} 
                className={`flex gap-4 items-start p-3 rounded-2xl transition-all cursor-pointer group ${
                  isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`mt-1 w-10 h-10 rounded-xl border flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-400' 
                    : 'bg-white border-slate-200 text-slate-500 shadow-sm'
                }`}>
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {log.performedBy || '系統管理員'} 
                      <span className={`mx-2 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>執行了</span>
                      <span className={`premium-badge ml-1 ${
                        log.action === 'CREATE' ? 'badge-success' :
                        log.action === 'UPDATE' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {log.action}
                      </span>
                    </p>
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className={`text-xs mt-1.5 flex items-center gap-1.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-50" />
                    {log.changes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tips / Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="premium-card p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <UserPlus size={24} />
              </div>
              <h4 className="text-2xl font-black mb-2">快速操作</h4>
              <p className="text-blue-100 text-sm font-medium leading-relaxed mb-8">
                目前系統運行穩定，您可以快速新增成員或查看最新營運報告。
              </p>
              <button className="w-full py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-colors shadow-xl">
                立即新增成員
              </button>
            </div>
            {/* Geometric Ornaments */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          </div>

          <div className={`premium-card p-6 border-dashed border-2 ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50/50 border-slate-200'} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-emerald-950/50' : 'bg-emerald-100'} flex items-center justify-center ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">系統穩定度</p>
              <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>100% 正常</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
