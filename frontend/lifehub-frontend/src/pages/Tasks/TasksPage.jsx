import React, { useState } from 'react';
import { Plus, CheckSquare, Clock, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function TasksPage({ isDarkMode, groupId }) {
  const [tasks, setTasks] = useState([
    { id: 1, title: '買咖啡', assignee: '小明', due: '今天 20:00', status: 'Pending' },
    { id: 2, title: '購買居家用品', assignee: '小華', due: '明天', status: 'InProgress' },
    { id: 3, title: '網路費報帳', assignee: '小強', due: '下週二', status: 'Done' }
  ]);

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const onDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.setData('taskId', id);
  };

  const onDragOver = (e, status) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const onDrop = (e, newStatus) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('taskId'));
    
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
    
    setDraggedId(null);
    setDragOverCol(null);
  };

  const columns = [
    { title: '待處理', status: 'Pending', color: 'bg-slate-400' },
    { title: '執行中', status: 'InProgress', color: 'bg-blue-500' },
    { title: '已完成', status: 'Done', color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>群組代辦事項</h2>
          <p className="text-sm text-slate-500 font-medium">所有成員的任務進度與修改進度</p>
        </div>
        <button className="px-5 py-2.5 flex items-center gap-2 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
          <Plus size={18} />
          新增事項
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full min-h-[600px]">
        {columns.map(col => {
          const isOver = dragOverCol === col.status;
          return (
            <div 
              key={col.status}
              onDragOver={(e) => onDragOver(e, col.status)}
              onDrop={(e) => onDrop(e, col.status)}
              onDragLeave={() => setDragOverCol(null)}
              className={cn(
                "p-5 rounded-[32px] border-2 transition-all duration-300 flex flex-col",
                {
                  "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[1.02]": isOver,
                  "bg-slate-900/50 border-slate-800": !isOver && isDarkMode,
                  "bg-slate-50/50 border-slate-100": !isOver && !isDarkMode
                }
              )}
            >
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={cn("w-3 h-3 rounded-full shadow-sm", col.color)}></div>
                <h3 className={cn("font-black tracking-tight", { "text-slate-200": isDarkMode, "text-slate-700": !isDarkMode })}>{col.title}</h3>
                <span className={cn(
                  "ml-auto text-[10px] font-black px-2 py-1 rounded-lg",
                  { "bg-slate-800 text-slate-400": isDarkMode, "bg-white text-slate-400 shadow-sm": !isDarkMode }
                )}>
                  {tasks.filter(t => t.status === col.status).length}
                </span>
              </div>

              <div className="space-y-4 flex-1">
                {tasks.filter(t => t.status === col.status).map(t => (
                  <TaskCard 
                    key={t.id} 
                    task={t} 
                    isDarkMode={isDarkMode} 
                    onDragStart={(e) => onDragStart(e, t.id)}
                    isDragging={draggedId === t.id}
                    opacity={col.status === 'Done' ? 'opacity-60' : ''}
                  />
                ))}
                
                {isOver && (
                  <div className="border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-3xl h-24 transition-all" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, isDarkMode, onDragStart, isDragging, opacity = '' }) {
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      className={cn(
        "group p-5 rounded-3xl border shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-blue-400/50",
        {
          "opacity-20 scale-95": isDragging,
          "opacity-100": !isDragging,
          "bg-slate-800 border-slate-700": isDarkMode,
          "bg-white border-slate-100": !isDarkMode
        },
        opacity
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className={cn("font-bold text-sm leading-snug", { "text-white": isDarkMode, "text-slate-800": !isDarkMode })}>{task.title}</h4>
        <GripVertical size={16} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-900 shadow-sm",
            { "bg-slate-700 text-slate-300": isDarkMode, "bg-blue-500 text-white": !isDarkMode }
          )}>
            {task.assignee[0]}
          </div>
          <span className={cn("text-[11px] font-bold", { "text-slate-400": isDarkMode, "text-slate-500": !isDarkMode })}>{task.assignee}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black",
          { "bg-slate-700/50 text-slate-500": isDarkMode, "bg-slate-100 text-slate-400": !isDarkMode }
        )}>
          <Clock size={12} strokeWidth={3} />
          {task.due}
        </div>
      </div>
    </div>
  );
}
