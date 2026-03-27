import React from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function GroupCard({ group, isDarkMode }) {
  return (
    <div key={group.id} className={cn(
      "group p-8 rounded-[40px] border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden",
      { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-hover:rotate-6">
          <UsersIcon size={28} />
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", { "bg-blue-900/30 text-blue-400": isDarkMode, "bg-blue-50 text-blue-600": !isDarkMode })}>
          {group.role}
        </div>
      </div>
      
      <h3 className={cn("text-2xl font-black mb-2", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>{group.name}</h3>
      <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
        {group.description}
      </p>
      
      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{group.membersCount} 位成員</span>
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
