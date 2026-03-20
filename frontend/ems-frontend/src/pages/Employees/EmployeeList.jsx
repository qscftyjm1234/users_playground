import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Mail, Phone, ShieldCheck } from 'lucide-react';
import employeeApi from '../../api/employeeApi';
import Badge from '../../components/uiInterface/Badge';
import { getEmployeeStatusConfig } from '../../utils/statusAdapter';
import { Pagination } from 'antd'

const EmployeeList = ({ onEdit, onRefresh, refreshKey, searchTerm, isDarkMode }) => {
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // 新增總數狀態
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
        fetchEmployees();
  }, [refreshKey, searchTerm, pageNumber, pageSize]); // 當頁碼或大小改變時，重新讀取

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await employeeApi.getAll(pageNumber, pageSize, searchTerm);
       // 注意：現在資料在 response.data.items 裡面喔！
      setEmployees(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`確定要刪除員工「${name}」嗎？`)) {
      try {
        await employeeApi.delete(id);
        fetchEmployees();
      } catch (error) {
        alert('刪除失敗');
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  return (
    <div className={`premium-card p-0 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDarkMode ? 'bg-slate-900/50' : 'bg-white shadow-2xl shadow-slate-200/50'}`}>
      <div className={`p-6 border-b flex justify-between items-center transition-colors ${
        isDarkMode ? 'bg-slate-800/20 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>員工清單</h2>
        <div className="flex gap-2">
          <span className={`text-sm font-medium whitespace-nowrap ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>共 {totalCount} 位員工</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* ... table content remains the same ... */}
          <thead>
            <tr>
              <th className="premium-table-header">ID</th>
              <th className="premium-table-header">員工資訊</th>
              <th className="premium-table-header">部門 / 職位</th>
              <th className="premium-table-header">聯絡方式</th>
              <th className="premium-table-header">到職時間</th>
              <th className="premium-table-header">狀態</th>
              <th className="premium-table-header text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {employees.map((emp) => (
              <tr key={emp.id} className="premium-table-row group">
                <td className="px-6 py-5">
                  <span className="text-sm font-black text-slate-500">#{emp.id}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300">
                      {emp.firstName[0]}
                    </div>
                    <div>
                      <div className={`font-bold transition-colors ${isDarkMode ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-blue-600'}`}>{emp.lastName}{emp.firstName}</div>
                      <div className="text-xs text-slate-500 font-medium">{emp.employeeCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <ShieldCheck size={14} className="text-blue-500" />
                      {emp.departmentName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{emp.positionName}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                       <Mail size={12} className="text-slate-400" />
                       {emp.email}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                       <Phone size={12} className="text-slate-400" />
                       {emp.phone || '無'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '-'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  {(() => {
                    const { label, variant } = getEmployeeStatusConfig(emp.status);
                    return <Badge variant={variant}>{label}</Badge>;
                  })()}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(emp)}
                      className={`p-2 rounded-xl border shadow-sm transition-all active:scale-90 ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600' 
                          : 'bg-white border-slate-100 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                      }`}
                      title="編輯"
                    >
                      修改
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id, `${emp.lastName}${emp.firstName}`)}
                      className={`p-2 rounded-xl border shadow-sm transition-all active:scale-90 ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600' 
                          : 'bg-white border-slate-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'
                      }`}
                      title="刪除"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Container */}
      <div className={`p-6 border-t flex justify-center transition-colors ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-100'}`}>
        <Pagination 
          current={pageNumber} 
          pageSize={pageSize} 
          total={totalCount}
          onChange={(page, size) => {
            setPageNumber(page);
            setPageSize(size);
          }}
          showSizeChanger
          showTotal={(total) => `共 ${total} 筆資料`}
          rootClassName="premium-pagination"
        />
      </div>
      </div>
  );
};


export default EmployeeList;
