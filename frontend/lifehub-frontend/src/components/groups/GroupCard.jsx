import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, ArrowRight, MoreVertical, LogOut } from 'lucide-react';
import { Dropdown, message, Popconfirm } from 'antd';
import { cn } from '../../lib/utils';
import groupApi from '../../api/groupApi';

export default function GroupCard({ group, isDarkMode, onRefresh }) {
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    try {
      setLeaving(true);
      await groupApi.leave(group.id);
      message.success(`已退出群組：${group.name}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      message.error('退出群組失敗');
    } finally {
      setLeaving(false);
    }
  };

  const items = [
    {
      key: 'leave',
      label: (
        <Popconfirm
          title="確定要退出此群組嗎？"
          description="退出後您將無法查看此群組的帳務與任務。"
          onConfirm={handleLeave}
          okText="確定退出"
          cancelText="取消"
          okButtonProps={{ danger: true, loading: leaving }}
        >
          <div className="flex items-center gap-2 text-red-500 font-bold px-1 py-1">
            <LogOut size={16} />
            <span>退出群組</span>
          </div>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className={cn(
      "group p-8 rounded-[40px] border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden",
      { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-hover:rotate-6">
          <UsersIcon size={28} />
        </div>
        <div className="flex gap-2 items-center">
          <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", { "bg-blue-900/30 text-blue-400": isDarkMode, "bg-blue-50 text-blue-600": !isDarkMode })}>
            {group.role === 'Admin' ? '管理員' : '成員'}
          </div>
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <button className={cn("p-2 rounded-xl transition-colors", { "hover:bg-slate-800 text-slate-400": isDarkMode, "hover:bg-slate-50 text-slate-500": !isDarkMode })}>
              <MoreVertical size={18} />
            </button>
          </Dropdown>
        </div>
      </div>
      
      <h3 className={cn("text-2xl font-black mb-2", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>{group.name}</h3>
      <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed h-10 overflow-hidden line-clamp-2">
        {group.description || '這個群組還沒有描述...'}
      </p>
      
      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{group.membersCount} 位成員</span>
          {group.inviteCode && (
            <span className="text-[10px] font-bold text-blue-500/60 mt-1 uppercase tracking-tighter">Code: {group.inviteCode}</span>
          )}
        </div>
        <Link 
          to={`/groups/${group.id}`}
          className="flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 transition"
        >
          進入群組
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
