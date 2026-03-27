import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Calendar, Info } from 'lucide-react';
import employeeApi from '../api/employeeApi';
import Input from './uiInterface/Input';
import Select from './uiInterface/Select';

const EmployeeModal = ({ isOpen, onClose, onSuccess, initialData = null, isDarkMode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    positionId: '',
    status: 1,
    hireDate: new Date().toISOString().split('T')[0]
  });

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchLookups();
      if (initialData) {
        setFormData({
          id: initialData.id,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          email: initialData.email,
          phone: initialData.phone,
          departmentId: initialData.departmentId,
          positionId: initialData.positionId,
          status: initialData.status,
          hireDate: initialData.hireDate.split('T')[0]
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          departmentId: '',
          positionId: '',
          status: 1,
          hireDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, initialData]);

  const fetchLookups = async () => {
    try {
      const [depRes, posRes] = await Promise.all([
        employeeApi.getDepartments(),
        employeeApi.getPositions()
      ]);
      setDepartments(depRes.data);
      setPositions(posRes.data);
    } catch (err) {
      console.error('Error fetching lookups:', err);
    }
  };

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
        await employeeApi.update(initialData.id, {
          ...formData,
          departmentId: parseInt(formData.departmentId),
          positionId: parseInt(formData.positionId),
          status: parseInt(formData.status)
        });
      } else {
        await employeeApi.create({
          ...formData,
          departmentId: parseInt(formData.departmentId),
          positionId: parseInt(formData.positionId),
          status: parseInt(formData.status)
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data || '發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ${isDarkMode ? 'bg-slate-900 shadow-black/50' : 'bg-white shadow-slate-200/50'}`}>
        <div className={`p-8 pb-4 flex justify-between items-center border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{initialData ? '編輯員工' : '新增員工'}</h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>請填寫員工的基本資料與職位設定</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
              <Info size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">姓氏</label>
              <Input 
                required 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                placeholder="例如：張" 
                prefix={<User size={18} className="text-slate-400" />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">名字</label>
              <Input 
                required 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="例如：小明" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">電子郵件</label>
              <Input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="email@company.com" 
                prefix={<Mail size={18} className="text-slate-400" />}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">聯絡電話</label>
              <Input 
                required 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="09XX-XXX-XXX"
                prefix={<Phone size={18} className="text-slate-400" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">部門</label>
              <Select 
                showSearch
                placeholder="選擇部門"
                optionFilterProp="children"
                value={formData.departmentId || undefined}
                onChange={(val) => setFormData(prev => ({ ...prev, departmentId: val }))}
                className="premium-select"
                options={departments.map(d => ({ label: d.name, value: d.id }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">職位</label>
              <Select 
                showSearch
                placeholder="選擇職位"
                optionFilterProp="children"
                value={formData.positionId || undefined}
                onChange={(val) => setFormData(prev => ({ ...prev, positionId: val }))}
                options={positions.map(p => ({ label: p.name, value: p.id }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">入職日期</label>
              <Input 
                required 
                type="date" 
                name="hireDate" 
                value={formData.hireDate} 
                onChange={handleChange}
                prefix={<Calendar size={18} className="text-slate-300" />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">狀態</label>
              <Select 
                value={formData.status}
                onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                options={[
                  { label: '在職', value: 1 },
                  { label: '休假', value: 2 },
                  { label: '離職', value: 3 },
                ]}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
              取消
            </button>
            <button disabled={loading} type="submit" className={`flex-2 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${isDarkMode ? 'shadow-blue-900/20 hover:bg-blue-500' : 'shadow-blue-200 hover:bg-blue-700'}`}>
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
              {initialData ? '更新存檔' : '確認新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
