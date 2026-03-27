import React, { useState, useEffect } from 'react';
import { History, User, Database, Tag } from 'lucide-react';
import auditApi from '../../api/auditApi';

const AuditLogList = ({ isDarkMode }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await auditApi.getRecentLogs(50);
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionClass = (action) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'badge-success';
      case 'UPDATE': return 'badge-warning';
      case 'DELETE': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-slate-400">正在載入稽核紀錄...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight`}>稽核紀錄</h2>
        <p className="text-slate-500 font-medium text-sm">追蹤系統中所有的操作變更紀錄</p>
      </div>

      <div className={`premium-card overflow-hidden ${isDarkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50/50'}>
                <th className="premium-table-header w-[220px]">時間戳記</th>
                <th className="premium-table-header w-[150px]">執行人員</th>
                <th className="premium-table-header w-[120px]">操作類型</th>
                <th className="premium-table-header w-[150px]">資源類型</th>
                <th className="premium-table-header">變更詳細資訊</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {logs.map((log) => (
                <tr key={log.id} className="premium-table-row group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center text-slate-400`}>
                        <History size={16} />
                      </div>
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <User size={12} />
                       </div>
                       <span className={`text-sm font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{log.performedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`premium-badge ${getActionClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2">
                        <Database size={14} className="text-slate-400" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{log.entityType}</span>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`text-[13px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} flex items-start gap-2 max-w-xl`}>
                       <Tag size={14} className={`mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`} />
                       {log.changes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogList;
