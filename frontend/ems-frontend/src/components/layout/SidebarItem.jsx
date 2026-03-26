import React from 'react';
import { cn } from '../../lib/utils';

export default function SidebarItem({ icon: Icon, label, active = false, onClick, isDarkMode }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95",
        {
          "bg-blue-600 text-white shadow-lg shadow-blue-200": active,
          "text-slate-400 hover:bg-slate-800": !active && isDarkMode,
          "text-slate-500 hover:bg-blue-50/80": !active && !isDarkMode
        }
      )}
    >
      <Icon 
        size={20} 
        className={cn(
          "transition-transform duration-300 group-hover:scale-110",
          {
            "text-white": active,
            "text-slate-500 group-hover:text-white": !active && isDarkMode,
            "text-slate-400 group-hover:text-blue-600": !active && !isDarkMode
          }
        )} 
      />
      <span className={cn(
        "font-semibold text-sm transition-colors",
        {
          "text-white": active,
          "text-slate-400 group-hover:text-white": !active && isDarkMode,
          "text-slate-500 group-hover:text-blue-600": !active && !isDarkMode
        }
      )}>
        {label}
      </span>
    </div>
  );
}
