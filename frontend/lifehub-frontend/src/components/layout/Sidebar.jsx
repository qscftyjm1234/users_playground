import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  WalletCards, 
  ListTodo, 
  CalendarDays, 
  StickyNote, 
  ShieldCheck, 
  Moon, 
  Sun 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import SidebarItem from './SidebarItem';

export default function Sidebar({ isDarkMode, setIsDarkMode, activeGroup, isGroupContext, onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isDashboard = currentPath === '/' || currentPath === '/dashboard';
  const isGroupsList = currentPath === '/groups';
  const isSettings = currentPath.startsWith('/settings');
  const isAdmin = currentPath.startsWith('/admin');

  // 檢查是否為管理員
  const isUserAdmin = user && (user.role === 'SystemAdmin' || user.role === 1);

  // Group specific paths
  // ... (previous logic)
  const activeGroupId = activeGroup?.id;
  const isGroupDashboard = activeGroupId && (currentPath === `/groups/${activeGroupId}`);
  const isExpenses = currentPath.includes('/expenses');
  const isTasks = currentPath.includes('/tasks');
  const isCalendar = currentPath.includes('/calendar');
  const isMemos = currentPath.includes('/memos');

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full w-64 border-r z-50 p-6 flex flex-col gap-6 transition-colors duration-300",
      { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
    )}>
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Users className="text-white" size={24} />
        </div>
        <span className={cn("font-black text-xl tracking-tight transition-colors", { "text-white": isDarkMode, "text-slate-950": !isDarkMode })}>
          LifeHub
        </span>
      </div>

      <nav className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
        <div className={cn("text-xs uppercase tracking-wider mb-2 px-4", { "text-slate-500": isDarkMode, "text-slate-400 font-bold": !isDarkMode })}>
          功能選單
        </div>

        <SidebarItem icon={LayoutDashboard} label="個人總覽" active={isDashboard} onClick={() => navigate('/dashboard')} isDarkMode={isDarkMode} />
        <SidebarItem icon={Users} label="我的群組" active={isGroupsList} onClick={() => navigate('/groups')} isDarkMode={isDarkMode} />

        {/* Group Context Menu */}
        {isGroupContext && (
          <>
            <div className={cn("text-xs uppercase tracking-wider mt-6 mb-2 px-4", { "text-slate-500": isDarkMode, "text-slate-400 font-bold": !isDarkMode })}>
              當前群組：{activeGroup?.name || '未選取'}
            </div>
            <SidebarItem icon={LayoutDashboard} label="群組首頁" active={isGroupDashboard} onClick={() => navigate(`/groups/${activeGroupId}`)} isDarkMode={isDarkMode} />
            <SidebarItem icon={WalletCards} label="支出明細" active={isExpenses} onClick={() => navigate(`/groups/${activeGroupId}/expenses`)} isDarkMode={isDarkMode} />
            <SidebarItem icon={ListTodo} label="家務任務" active={isTasks} onClick={() => navigate(`/groups/${activeGroupId}/tasks`)} isDarkMode={isDarkMode} />
            <SidebarItem icon={CalendarDays} label="活動行程" active={isCalendar} onClick={() => navigate(`/groups/${activeGroupId}/calendar`)} isDarkMode={isDarkMode} />
            <SidebarItem icon={StickyNote} label="備忘錄" active={isMemos} onClick={() => navigate(`/groups/${activeGroupId}/memos`)} isDarkMode={isDarkMode} />
          </>
        )}

        <div className={cn("text-xs uppercase tracking-wider mt-6 mb-2 px-4", { "text-slate-500": isDarkMode, "text-slate-400 font-bold": !isDarkMode })}>
          系統與設定
        </div>
        <SidebarItem icon={Settings} label="個人設定" active={isSettings} onClick={() => navigate('/settings')} isDarkMode={isDarkMode} />
        {isUserAdmin && (
          <SidebarItem icon={ShieldCheck} label="後台管理" active={isAdmin} onClick={() => navigate('/admin')} isDarkMode={isDarkMode} />
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
        <div
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer text-slate-500 mb-2",
            { "hover:bg-slate-800": isDarkMode, "hover:bg-blue-50/80": !isDarkMode }
          )}
        >
          <div className={cn("transition-colors", { "group-hover:text-white": isDarkMode, "group-hover:text-blue-600": !isDarkMode })}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <span className={cn("font-semibold text-sm transition-colors", { "group-hover:text-white": isDarkMode, "group-hover:text-blue-600": !isDarkMode })}>
            {isDarkMode ? '深色模式' : '淺色模式'}
          </span>
        </div>
        <SidebarItem icon={LogOut} label="登出" isDarkMode={isDarkMode} onClick={onLogout} />
      </div>
    </aside>
  );
}
