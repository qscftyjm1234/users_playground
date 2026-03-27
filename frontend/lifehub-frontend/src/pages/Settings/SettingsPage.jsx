import React, { useState } from 'react';
import { User, Bell, Shield, Key } from 'lucide-react';
import Input from '../../components/uiInterface/Input';

export default function SettingsPage({ isDarkMode }) {
  const [profile, setProfile] = useState({ username: '小明', email: 'xiaoming@example.com' });

  return (
    <div className={`p-6 rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} max-w-4xl`}>
      <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>後台管理 / 個人設定</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <div className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
            <User size={20} />
            <span className="font-bold">個人資料</span>
          </div>
          <div className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`}>
            <Key size={20} />
            <span className="font-bold">修改密碼</span>
          </div>
          <div className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`}>
            <Bell size={20} />
            <span className="font-bold">通知設定</span>
          </div>
          <div className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`}>
            <Shield size={20} />
            <span className="font-bold">隱私與安全</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-black">
              {profile.username[0]}
            </div>
            <div>
              <button className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition">更換大頭貼</button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>顯示名稱</label>
              <Input 
                value={profile.username} 
                onChange={e => setProfile({...profile, username: e.target.value})}
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>電子郵件</label>
              <Input 
                value={profile.email} 
                onChange={e => setProfile({...profile, email: e.target.value})}
                disabled
              />
              <p className="text-xs text-slate-500 mt-2">電子郵件不可更改，若需修改請聯繫系統管理員。</p>
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              儲存更新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
