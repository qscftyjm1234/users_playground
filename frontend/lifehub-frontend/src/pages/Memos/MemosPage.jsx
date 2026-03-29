import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Search, Tag, X, Trash2, Loader2 } from 'lucide-react';
import { message, Popconfirm } from 'antd';
import { cn } from '../../lib/utils';
import Input from '../../components/uiInterface/Input';
import groupDetailApi from '../../api/groupDetailApi';

export default function MemosPage({ isDarkMode, groupData, groupId }) {
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memos, setMemos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [newMemo, setNewMemo] = useState({ content: '', tags: '', color: 'bg-blue-100' });

  // 1. Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await groupDetailApi.memos.getAll(groupId);
      // Backend memos might not have "color", we can assign one based on index or keep it simple
      const colors = ['bg-amber-100', 'bg-blue-100', 'bg-emerald-100', 'bg-rose-100', 'bg-slate-100'];
      setMemos(res.data.map((m, idx) => ({
        ...m,
        tags: m.tags ? m.tags.split(',').map(t => t.trim()) : [],
        color: colors[idx % colors.length]
      })));
    } catch (err) {
      message.error('無法載入筆記');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchData();
  }, [groupId]);

  const allTags = ['All', ...new Set(memos.flatMap(m => m.tags))];
  const filteredMemos = filterTag === 'All' ? memos : memos.filter(m => m.tags.includes(filterTag));

  const handleAddMemo = async (e) => {
    e.preventDefault();
    if (!newMemo.content) return;
    
    try {
      setSubmitting(true);
      await groupDetailApi.memos.create(groupId, {
        content: newMemo.content,
        tags: newMemo.tags
      });
      message.success('筆記已儲存');
      setIsModalOpen(false);
      setNewMemo({ content: '', tags: '', color: 'bg-blue-100' });
      fetchData();
    } catch (err) {
      message.error('儲存失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await groupDetailApi.memos.delete(groupId, id);
      message.success('筆記已刪除');
      fetchData();
    } catch (err) {
      message.error('刪除失敗');
    }
  };

  const COLORS = [
    { name: 'Amber', class: 'bg-amber-100' },
    { name: 'Blue', class: 'bg-blue-100' },
    { name: 'Emerald', class: 'bg-emerald-100' },
    { name: 'Rose', class: 'bg-rose-100' },
    { name: 'Slate', class: 'bg-slate-100' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>群組備忘錄</h2>
          <p className="text-sm text-slate-500 font-medium">記錄生活中的點點滴滴與靈感</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 flex items-center gap-2 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-transform active:scale-95"
        >
          <Plus size={20} />
          新增一則筆記
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 max-w-sm">
          <Input placeholder="搜尋筆記..." prefix={<Search size={18} className="text-slate-400" />} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {allTags.map(tag => {
            const isActive = filterTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  {
                    "bg-blue-600 text-white shadow-md": isActive,
                    "bg-slate-900 border border-slate-800 text-slate-400": !isActive && isDarkMode,
                    "bg-white border border-slate-100 text-slate-500": !isActive && !isDarkMode
                  }
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 opacity-30">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="font-bold tracking-widest text-xs uppercase">筆記載入中...</p>
        </div>
      ) : filteredMemos.length === 0 ? (
        <div className="p-20 text-center opacity-30">
           <p className="font-bold">目前沒有筆記</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMemos.map(m => (
            <div 
              key={m.id} 
              className={cn(
                "group p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative flex flex-col min-h-[220px]",
                m.color,
                "text-slate-800 dark:text-slate-900" 
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <StickyNote size={24} className="opacity-40" />
                <Popconfirm title="確定刪除？" onConfirm={() => handleDelete(m.id)} okText="是" cancelText="否">
                  <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-black/5 rounded-full transition text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </Popconfirm>
              </div>
              <p className="font-bold whitespace-pre-line leading-relaxed mb-6 flex-1 text-base">{m.content}</p>
              
              <div className="flex flex-wrap gap-2">
                {m.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-white/40 border border-white/20">
                    <Tag size={10} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className={cn(
            "relative w-full max-w-md rounded-[32px] shadow-2xl p-8 scale-in",
            { "bg-slate-900 border border-slate-800": isDarkMode, "bg-white": !isDarkMode }
          )}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>新增一則筆記</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddMemo} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">筆記內容</label>
                <textarea 
                  className={cn(
                    "w-full p-4 rounded-2xl border font-bold text-sm focus:ring-2 focus:ring-blue-500 transition outline-none min-h-[120px]",
                    { "bg-slate-800 border-slate-700 text-white": isDarkMode, "bg-slate-50 border-slate-100 text-slate-900": !isDarkMode }
                  )}
                  placeholder="輸入內容..."
                  value={newMemo.content}
                  onChange={e => setNewMemo({...newMemo, content: e.target.value})}
                  required
                />
              </div>
              
              <Input 
                label="標籤 (逗號分隔)" 
                placeholder="例如：重要, 購物" 
                value={newMemo.tags}
                onChange={e => setNewMemo({...newMemo, tags: e.target.value})}
              />

              <button 
                disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                完成筆記
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
