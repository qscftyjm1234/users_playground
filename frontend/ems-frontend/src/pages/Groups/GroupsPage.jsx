import { useNavigate } from 'react-router-dom';
import { UserPlus, Plus } from 'lucide-react';
import GroupCard from '../../components/groups/GroupCard';

export default function GroupsPage({ isDarkMode, groups = [] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>我的群組</h2>
        <div className="flex gap-3">
          <button className={`px-4 py-2 font-bold text-sm rounded-xl border transition shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-gray-50'}`}>
            加入群組
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
            建立新群組
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(g => (
          <GroupCard key={g.id} group={g} isDarkMode={isDarkMode} onClick={() => navigate(`/groups/${g.id}`)} />
        ))}
      </div>
    </div>
  );
}
