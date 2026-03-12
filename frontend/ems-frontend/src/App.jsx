import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Plus,
  Search,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import EmployeeList from './pages/Employees/EmployeeList';

/** Utility for Tailwind classes */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function SidebarItem({ icon: Icon, label, active = false }) {
  return (
    <div className={cn(
      "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
    )}>
      <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110")} />
      <span className="font-semibold text-sm">{label}</span>
      {active && <ChevronRight size={16} className="ml-auto" />}
    </div>
  );
}

function App() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-slate-100 z-50 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Users className="text-white" size={24} />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">EMS Pro</span>
        </div>

        <nav className="flex flex-col gap-2">
          <div className="micro-label mb-2 px-4">Menu</div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem icon={Users} label="Employees" active />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <SidebarItem icon={LogOut} label="Logout" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full -mr-48 -mt-48 blur-3xl -z-10" />
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">員工管理系統</h1>
            <p className="text-slate-500 font-medium">管理與追蹤企業員工資料</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="搜尋員工..." 
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              新增員工
            </button>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <EmployeeList />
        </section>
      </main>
    </div>
  );
}

export default App;
