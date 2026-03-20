import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Plus,
  Search,
  ChevronRight,
  ShieldCheck,
  History,
  FileDown,
  Moon,
  Sun
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeModal from './components/EmployeeModal';
import Dashboard from './pages/Dashboard/Dashboard';
import DepartmentList from './pages/Organization/DepartmentList';
import PositionList from './pages/Organization/PositionList';
import AuditLogList from './pages/AuditLogs/AuditLogList';
import Input from './components/uiInterface/Input';
import employeeApi from './api/employeeApi';

/** Utility for Tailwind classes */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function SidebarItem({ icon: Icon, label, active = false, onClick, isDarkMode }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
          : cn(
              "text-slate-500 active:scale-95",
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-blue-50/80"
            )
      )}
    >
      <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", !active && (isDarkMode ? "group-hover:text-white" : "group-hover:text-blue-600"))} />
      <span className={cn("font-semibold text-sm transition-colors", !active && (isDarkMode ? "group-hover:text-white" : "group-hover:text-blue-600"))}>{label}</span>
      {active && <ChevronRight size={16} className="ml-auto" />}
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ems-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 輔助函式：判斷當前視圖 (從 URL 解析)
  const currentPath = location.pathname;
  const isDashboard = currentPath === '/' || currentPath === '/dashboard';
  const isEmployees = currentPath.startsWith('/employees');
  const isOrganization = currentPath.startsWith('/organization');
  const isAudit = currentPath.startsWith('/audit');

  // 判斷組織子視圖
  const isPositions = currentPath.includes('/positions');
  const isDepartments = currentPath.includes('/departments') || (isOrganization && !isPositions);

  // Initialize theme and persist changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('ems-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('ems-theme', 'light');
    }
  }, [isDarkMode]);

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = async () => {
    try {
      await employeeApi.exportEmployees();
    } catch (err) {
      alert('匯出失敗');
    }
  };

  const renderContent = () => {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard isDarkMode={isDarkMode} />} />
        <Route path="/employees" element={<EmployeeList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} isDarkMode={isDarkMode} />} />
        <Route path="/organization/departments" element={<DepartmentList isDarkMode={isDarkMode} />} />
        <Route path="/organization/positions" element={<PositionList isDarkMode={isDarkMode} />} />
        <Route path="/organization" element={<Navigate to="/organization/departments" replace />} />
        <Route path="/audit" element={<AuditLogList isDarkMode={isDarkMode} />} />
        <Route path="*" element={<div className="p-20 text-center font-bold text-slate-400">頁面不存在</div>} />
      </Routes>
    );
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 16,
          fontFamily: 'inherit',
          colorBgContainer: isDarkMode ? '#0f172a' : '#ffffff',
          colorBgLayout: isDarkMode ? '#020617' : '#f8fafc', // slate-950 and slate-50
        },
        components: {
          Input: {
            activeShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
          },
          Select: {
            controlHeight: 48,
          }
        }
      }}
    >
      <div className={`flex min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
       {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-r z-50 p-6 flex flex-col gap-8 transition-colors duration-300`}>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Users className="text-white" size={24} />
          </div>
          <span className={`font-black text-xl tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>EMS Pro</span>
        </div>

        <nav className="flex flex-col gap-2">
          <div className={`micro-label mb-2 px-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600 font-bold'}`}>選單</div>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="數據儀表板" 
            active={isDashboard} 
            onClick={() => navigate('/dashboard')} 
            isDarkMode={isDarkMode}
          />
          <SidebarItem 
            icon={Users} 
            label="員工清單" 
            active={isEmployees} 
            onClick={() => navigate('/employees')} 
            isDarkMode={isDarkMode}
          />
          <SidebarItem 
            icon={ShieldCheck} 
            label="組織管理" 
            active={isOrganization} 
            onClick={() => navigate('/organization/departments')} 
            isDarkMode={isDarkMode}
          />
          <SidebarItem 
            icon={History} 
            label="操作日誌" 
            active={isAudit} 
            onClick={() => navigate('/audit')} 
            isDarkMode={isDarkMode}
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
           <div 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className={cn(
               "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer text-slate-500 mb-2",
               isDarkMode ? "hover:bg-slate-800" : "hover:bg-blue-50/80"
             )}
           >
             <div className={cn("transition-colors", isDarkMode ? "group-hover:text-white" : "group-hover:text-blue-600")}>
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </div>
             <span className={cn("font-semibold text-sm transition-colors", isDarkMode ? "group-hover:text-white" : "group-hover:text-blue-600")}>
               {isDarkMode ? '切換亮色' : '切換深色'}
             </span>
           </div>
          <SidebarItem icon={Settings} label="系統設定" isDarkMode={isDarkMode} />
          <SidebarItem icon={LogOut} label="登出系統" isDarkMode={isDarkMode} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className={`absolute top-0 right-0 w-96 h-96 ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50/50'} rounded-full -mr-48 -mt-48 blur-3xl -z-10`} />
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className={cn("text-3xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
              {isDashboard && '數據分析中心'}
              {isEmployees && '員工管理系統'}
              {isOrganization && '企業架構維護'}
              {isAudit && '稽核日誌紀錄'}
            </h1>
            <p className={`font-medium transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
              {isDashboard && '即時監控人力資源關鍵指標'}
              {isEmployees && '管理與追蹤全體成員詳細檔案'}
              {isOrganization && '維護公司部門、職位與階層關係'}
              {isAudit && '稽核系統內部的所有歷史操作軌跡'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isOrganization && (
              <div className="flex bg-slate-100/50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <button 
                  onClick={() => navigate('/organization/departments')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    isDepartments 
                      ? "bg-blue-600 text-white shadow-md active:scale-95" 
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  )}
                >
                  部門管理
                </button>
                <button 
                   onClick={() => navigate('/organization/positions')}
                   className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    isPositions 
                      ? "bg-blue-600 text-white shadow-md active:scale-95" 
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  )}
                >
                  職位管理
                </button>
              </div>
            )}
            {isEmployees && (
              <>
                <div className="w-64">
                  <Input 
                    placeholder="搜尋員工..." 
                    prefix={<Search size={18} className="text-slate-400" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <button 
                  onClick={handleExport} 
                  className={`p-3 rounded-2xl border transition-all shadow-sm flex items-center gap-2 font-bold text-sm ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileDown size={18} />
                  資料匯出
                </button>
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                  <Plus size={20} />
                  新增員工
                </button>
              </>
            )}
            {isDashboard && (
               <button onClick={handleExport} className="btn-primary flex items-center gap-2">
                  <FileDown size={20} />
                  全體員工資料匯出
               </button>
            )}
          </div>
        </header>

        <section>
          {renderContent()}
        </section>
      </main>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
        initialData={editingEmployee}
        isDarkMode={isDarkMode}
      />
    </div>
    </ConfigProvider>
  );
}

export default App;
