import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Mail, Phone, ShieldCheck } from 'lucide-react';
import employeeApi from '../../api/employeeApi';

const StatusChip = ({ status }) => {
  const getStatusStyles = (s) => {
    switch (s) {
      case 1: return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 2: return "bg-slate-100 text-slate-500 border-slate-200";
      case 3: return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-rose-50 text-rose-600 border-rose-100";
    }
  };
  const statusMap = { 1: "在職中", 2: "離職", 3: "休假中", 4: "已解雇" };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all duration-300 ${getStatusStyles(status)}`}>
      {statusMap[status] || "未知"}
    </span>
  );
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeApi.getAll();
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([
          { id: 1, firstName: "小明", lastName: "林", employeeCode: "EMP001", position: "資深開發者", department: "技術部", email: "ming@example.com", status: 1 },
          { id: 2, firstName: "美惠", lastName: "陳", employeeCode: "EMP002", position: "UI 設計師", department: "設計部", email: "hui@example.com", status: 3 },
          { id: 3, firstName: "大同", lastName: "王", employeeCode: "EMP003", position: "專案經理", department: "營運部", email: "tong@example.com", status: 1 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">員工清單</h2>
        <div className="flex gap-2">
          <span className="text-sm text-slate-400 font-medium whitespace-nowrap">共 {employees.length} 位員工</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 micro-label">員工資訊</th>
              <th className="px-6 py-4 micro-label">部門 / 職位</th>
              <th className="px-6 py-4 micro-label">聯絡方式</th>
              <th className="px-6 py-4 micro-label">狀態</th>
              <th className="px-6 py-4 micro-label text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300">
                      {emp.firstName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{emp.lastName}{emp.firstName}</div>
                      <div className="text-xs text-slate-400 font-medium">#{emp.employeeCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-blue-500" />
                      {emp.department}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{emp.position}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                      <Mail size={12} className="text-slate-300" />
                      {emp.email}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                      <Phone size={12} className="text-slate-300" />
                      0912-345-678
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <StatusChip status={emp.status} />
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 active:scale-90 text-slate-400 hover:text-slate-900">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
