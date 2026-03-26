import React, { useState } from 'react';
import { Wallet, Plus, Receipt, Search, X, Check, Users as UsersIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import Input from '../../components/uiInterface/Input';

export default function ExpensesPage({ isDarkMode, groupData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([
    { id: 1, category: '餐飲', item: '週末聚餐', amount: 1200, payer: '王小明', date: '2026-03-25', participants: ['王小明', '李小華', '陳阿滴'] },
    { id: 2, category: '生活用品', item: '衛生紙、洗髮精', amount: 450, payer: '李小華', date: '2026-03-24', participants: ['王小明', '李小華'] },
  ]);

  const [formData, setFormData] = useState({
    item: '',
    amount: '',
    category: '一般',
    date: new Date().toISOString().split('T')[0],
    payer: groupData?.members[0]?.name || '',
    selectedMembers: groupData?.members.map(m => m.name) || []
  });

  const handleToggleMember = (name) => {
    setFormData(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(name)
        ? prev.selectedMembers.filter(m => m !== name)
        : [...prev.selectedMembers, name]
    }));
  };

  const handleSelectAll = () => {
    if (formData.selectedMembers.length === groupData.members.length) {
      setFormData(prev => ({ ...prev, selectedMembers: [] }));
    } else {
      setFormData(prev => ({ ...prev, selectedMembers: groupData.members.map(m => m.name) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item || !formData.amount) return;

    const newEntry = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString().split('T')[0],
      participants: formData.selectedMembers
    };

    setExpenses([newEntry, ...expenses]);
    setIsModalOpen(false);
    setFormData({
      item: '',
      amount: '',
      category: '一般',
      payer: groupData?.members[0]?.name || '',
      selectedMembers: groupData?.members.map(m => m.name) || []
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
            {groupData?.name} 支出與分攤
          </h2>
          <p className="text-sm text-slate-500 font-medium">管理群組內的共同開銷</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 flex items-center gap-2 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          記一筆
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="搜尋支出紀錄..." prefix={<Search size={18} className="text-slate-400" />} />
            </div>
          </div>

          <div className={cn(
            "rounded-[32px] border shadow-sm overflow-hidden",
            { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
          )}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={cn(
                  "border-b text-[10px] uppercase tracking-widest font-black",
                  { "border-slate-800 text-slate-500": isDarkMode, "border-slate-100 text-slate-400": !isDarkMode }
                )}>
                  <th className="p-6">消費項目</th>
                  <th className="p-6">金額 / 個人負擔</th>
                  <th className="p-6 text-right">參與名單</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {expenses.map(e => {
                  const perPerson = (e.amount / e.participants.length).toFixed(0);
                  return (
                    <tr key={e.id} className={cn(
                      "group border-b last:border-0 transition-colors",
                      { "border-slate-800 hover:bg-slate-800/40": isDarkMode, "border-slate-50 hover:bg-slate-50/50": !isDarkMode }
                    )}>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            { "bg-slate-800 text-blue-400": isDarkMode, "bg-blue-50 text-blue-600": !isDarkMode }
                          )}>
                            <Receipt size={22} />
                          </div>
                          <div>
                            <p className={cn("font-bold text-base", { "text-white": isDarkMode, "text-slate-800": !isDarkMode })}>{e.item}</p>
                            <p className="text-xs text-slate-500 font-medium">{e.date} · {e.category} · {e.payer} 支付</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className={cn("font-black text-lg", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>${e.amount}</p>
                        <p className="text-xs text-emerald-500 font-bold">每人應付 ${perPerson}</p>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end -space-x-3">
                          {e.participants.map((p, idx) => (
                            <div 
                              key={idx} 
                              title={p}
                              className={cn(
                                "w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
                                { "border-slate-900 bg-slate-700": isDarkMode, "border-white bg-blue-500": !isDarkMode }
                              )}
                            >
                              {p[0]}
                            </div>
                          ))}
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400 font-bold">{e.participants.length} 人分攤</p>
                      </td>
                    </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className={cn(
            "p-8 rounded-[32px] border shadow-sm",
            { "bg-slate-900 border-slate-800": isDarkMode, "bg-white border-slate-100": !isDarkMode }
          )}>
            <h3 className={cn("text-lg font-bold mb-6 flex items-center gap-2", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
              <Wallet size={20} className="text-blue-500" />
              本月結算 summary
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">我的支出上限</span>
                <span className="text-sm font-bold text-slate-400">$10,000</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-blue-600 rounded-full" />
              </div>
              <div className={cn(
                "text-center py-4 rounded-2xl",
                { "bg-blue-900/10": isDarkMode, "bg-blue-50/30": !isDarkMode }
              )}>
                <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">目前應收回</p>
                <h1 className={cn("text-4xl font-black", { "text-blue-400": isDarkMode, "text-blue-600": !isDarkMode })}>$1,650</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 新增支出彈窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className={cn(
            "relative w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden scale-in",
            { "bg-slate-900 border border-slate-800": isDarkMode, "bg-white": !isDarkMode }
          )}>
            <div className="p-8 pb-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className={cn("text-2xl font-black", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>記一筆支出</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">消費項目、金額與日期</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <Input 
                        placeholder="項目" 
                        value={formData.item}
                        onChange={(e) => setFormData({...formData, item: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input 
                        type="number" 
                        placeholder="金額" 
                        prefix={<span className="font-bold text-slate-400">$</span>}
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <input 
                        type="date"
                        className={cn(
                          "w-full p-4 rounded-2xl border font-bold text-sm focus:ring-2 focus:ring-blue-500 transition outline-none",
                          { "bg-slate-800 border-slate-700 text-white": isDarkMode, "bg-slate-50 border-slate-100 text-slate-900": !isDarkMode }
                        )}
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">付款人</label>
                  <select 
                    className={cn(
                      "w-full p-4 rounded-2xl border font-bold text-sm focus:ring-2 focus:ring-blue-500 transition outline-none",
                      { "bg-slate-800 border-slate-700 text-white": isDarkMode, "bg-slate-50 border-slate-100 text-slate-900": !isDarkMode }
                    )}
                    value={formData.payer}
                    onChange={(e) => setFormData({...formData, payer: e.target.value})}
                  >
                    {groupData.members.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">需支付人員 (分攤參與者)</label>
                    <button 
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      {formData.selectedMembers.length === groupData.members.length ? '全部取消' : '全選'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {groupData.members.map(m => {
                      const isSelected = formData.selectedMembers.includes(m.name);
                      return (
                        <div 
                          key={m.id}
                          onClick={() => handleToggleMember(m.name)}
                          className={cn(
                            "p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all",
                            {
                              "bg-blue-600 border-blue-600 text-white shadow-md": isSelected,
                              "bg-slate-800 border-slate-700 text-slate-400": !isSelected && isDarkMode,
                              "bg-slate-50 border-slate-100 text-slate-600": !isSelected && !isDarkMode
                            }
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px]",
                            { "bg-white/20": isSelected, "bg-slate-700": !isSelected && isDarkMode, "bg-slate-200": !isSelected && !isDarkMode }
                          )}>
                            {isSelected ? <Check size={14} /> : m.avatar}
                          </div>
                          <span className="text-sm font-bold">{m.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    儲存支出
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
