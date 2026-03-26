import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import Input from '../../components/uiInterface/Input';

export default function CalendarPage({ isDarkMode, groupData }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([
    { id: 1, title: '王小明生日趴', date: '2026-03-28', time: '18:00', location: '錢櫃 KTV', type: 'Party' },
    { id: 2, title: '月底大掃除', date: '2026-03-29', time: '10:00', location: '租屋處', type: 'Chore' },
    { id: 3, title: '繳電費截止', date: '2026-03-25', time: '23:59', location: '線上', type: 'Payment' }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', location: '', type: 'Activity'
  });

  // Calendar logic
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1));

  const days = [];
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const getTypeColor = (type) => {
    switch(type) {
      case 'Party': return 'bg-pink-500';
      case 'Chore': return 'bg-amber-500';
      case 'Payment': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setIsModalOpen(false);
    setNewEvent({ title: '', date: '', time: '', location: '', type: 'Activity' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>群組共同行程表</h2>
          <p className="text-sm text-slate-500 font-medium">{groupData?.name} 的活動規劃</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 flex items-center gap-2 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-transform active:scale-95"
        >
          <Plus size={20} />
          新增行程
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar View */}
        <div className={cn(
          "lg:col-span-3 p-8 rounded-[40px] border shadow-sm",
          { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
        )}>
          <div className="flex justify-between items-center mb-8 px-4">
            <h3 className={cn("text-xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
              {year} 年 {month + 1} 月
            </h3>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-400">
                <ChevronLeft size={24} />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-400">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-4">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest p-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {days.map((day, i) => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateStr);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              return (
                <div 
                  key={i} 
                  className={cn(
                    "min-h-[120px] p-2 transition-colors",
                    {
                      "bg-slate-900 hover:bg-slate-800/50": isDarkMode,
                      "bg-white hover:bg-slate-50": !isDarkMode,
                      "bg-slate-900/50": !day && isDarkMode,
                      "bg-slate-50/30": !day && !isDarkMode
                    }
                  )}
                >
                  {day && (
                    <>
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-full text-sm font-black transition-all",
                          {
                            "bg-blue-600 text-white shadow-lg shadow-blue-200": isToday,
                            "text-slate-400": !isToday && isDarkMode,
                            "text-slate-600": !isToday && !isDarkMode
                          }
                        )}>
                          {day}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map(ev => (
                          <div 
                            key={ev.id} 
                            title={`${ev.time} ${ev.title}`}
                            className={cn(
                              "px-2 py-1 rounded-md text-[9px] font-black text-white truncate cursor-pointer hover:brightness-110 shadow-sm",
                              getTypeColor(ev.type)
                            )}
                          >
                            {ev.time} {ev.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming List */}
        <div className="space-y-6">
          <h3 className={cn("text-lg font-bold px-2", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>即將到來</h3>
          <div className="space-y-4">
            {events
              .filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(ev => (
                <div key={ev.id} className={cn(
                  "p-5 rounded-3xl border shadow-sm transition hover:shadow-md hover:border-blue-400",
                  { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className={cn("font-black text-sm", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>{ev.title}</h4>
                    <div className={cn("w-2 h-2 rounded-full", getTypeColor(ev.type))} />
                  </div>
                  <div className="space-y-2 text-[11px] font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-blue-500" />
                      {ev.date} {ev.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-emerald-500" />
                      {ev.location}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className={cn(
            "relative w-full max-w-md rounded-[32px] shadow-2xl p-8 scale-in",
            { "bg-slate-900 border border-slate-800": isDarkMode, "bg-white": !isDarkMode }
          )}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>新增行程</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-5">
              <Input label="行程內容" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="例如：大掃除、好友聚餐" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="日期" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                <Input type="time" label="時間" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
              </div>
              <Input label="地點" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="地址或線上" />
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">行程類型</label>
                <div className="flex flex-wrap gap-2">
                  {['Activity', 'Party', 'Chore', 'Payment'].map(t => {
                    const isActive = newEvent.type === t;
                    return (
                      <button 
                        key={t}
                        type="button"
                        onClick={() => setNewEvent({...newEvent, type: t})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          {
                            "bg-blue-600 text-white shadow-md scale-105": isActive,
                            "bg-slate-800 text-slate-400": !isActive && isDarkMode,
                            "bg-slate-50 text-slate-500": !isActive && !isDarkMode
                          }
                        )}
                      >
                        {t === 'Activity' ? '一般活動' : t === 'Party' ? '聚會' : t === 'Chore' ? '家務' : '費用'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 mt-4">
                儲存行程
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
