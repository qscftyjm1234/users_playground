import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Trash2, Edit3, Hash, Info } from 'lucide-react';
import employeeApi from '../../api/employeeApi';
import OrganizationModal from '../../components/OrganizationModal';

const PositionList = ({ isDarkMode }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await employeeApi.getPositions();
      setPositions(res.data);
    } catch (err) {
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pos) => {
    setEditingData(pos);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`確定要刪除職位「${name}」嗎？這將不會刪除標註此職位的員工，但會取消他們的職位關聯。`)) {
      try {
        await employeeApi.deletePosition(id);
        fetchPositions();
      } catch (err) {
        alert('刪除失敗');
      }
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">載入中...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>職位管理</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">管理企業職等、稱謂與崗位職責</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          新增職位
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {positions.map((pos) => (
          <div key={pos.id} className="premium-card p-8 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50'} rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150`} />
            
            <div className="relative">
              <div className={`w-14 h-14 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'} border rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300`}>
                <Briefcase size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>{pos.name}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                {pos.description || '尚無描述，點擊編輯以新增。'}
              </p>

              <div className={`mt-8 flex items-center justify-between pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                 <div className={`flex items-center gap-2 text-xs font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-600'}`}>
                   <Hash size={14} />
                   <span>ID: {pos.id}</span>
                 </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(pos)}
                      className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-900' : 'bg-white border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-sm'}`}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(pos.id, pos.name)}
                      className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900' : 'bg-white border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 hover:shadow-sm'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        ))}
        
         {/* Skeleton Add Card */}
        <div 
          onClick={handleAdd}
          className={`border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-8 gap-4 transition-all cursor-pointer group ${
            isDarkMode 
              ? 'border-slate-800 text-slate-700 hover:border-blue-900 hover:text-blue-600' 
              : 'border-slate-100 text-slate-300 hover:border-blue-200 hover:text-blue-400'
          }`}
        >
          <div className={`w-14 h-14 rounded-full border-4 border-dashed flex items-center justify-center transition-all ${
            isDarkMode ? 'border-slate-800 group-hover:border-blue-900' : 'border-slate-100 group-hover:border-blue-200'
          }`}>
            <Plus size={32} />
          </div>
          <span className="font-black text-lg">新增更多職位...</span>
        </div>
      </div>

      <OrganizationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPositions}
        type="position"
        initialData={editingData}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default PositionList;
