import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, Briefcase, Info } from 'lucide-react';
import employeeApi from '../api/employeeApi';
import Input from './uiInterface/Input';

const OrganizationModal = ({ isOpen, onClose, onSuccess, type, initialData = null, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDepartment = type === 'department';
  const title = isDepartment ? '部門' : '職位';
  const Icon = isDepartment ? ShieldCheck : Briefcase;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: initialData.name,
          description: initialData.description || ''
        });
      } else {
        setFormData({
          name: '',
          description: ''
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initialData) {
        if (isDepartment) {
          await employeeApi.updateDepartment(initialData.id, formData);
        } else {
          await employeeApi.updatePosition(initialData.id, formData);
        }
      } else {
        if (isDepartment) {
          await employeeApi.createDepartment(formData);
        } else {
          await employeeApi.createPosition(formData);
        }
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data || '操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ${isDarkMode ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-slate-200/50'}`}>
        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black tracking-tight dark:text-white">
              {initialData ? `編輯${title}` : `新增${title}`}
            </h2>
            <p className="text-sm text-slate-400 font-medium">請填寫此{title}的基本識別資訊</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
              <Info size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{title}名稱</label>
            <Input 
              required 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder={`例如：${isDepartment ? '研發部' : '資深工程師'}`} 
              prefix={<Icon size={18} className="text-slate-300" />}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{title}描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={`請輸入${title}的職責或相關說明...`}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 resize-none font-medium"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">
              取消
            </button>
            <button disabled={loading} type="submit" className="flex-2 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
              {initialData ? '更新存檔' : '確認新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationModal;
