import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import Input from '../../components/uiInterface/Input';

export default function AuthPage({ isLogin, isDarkMode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // 預設登入成功直接跳轉 /dashboard
    navigate('/dashboard');
  };

  return (
    <div className={`min-h-[80vh] flex items-center justify-center`}>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{isLogin ? '登入 LifeHub' : '註冊 LifeHub'}</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            與你的家人室友共築數位生活圈
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              placeholder="使用者名稱"
              prefix={<UserIcon size={18} className="text-slate-400" />}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          )}
          <Input
            type="email"
            placeholder="電子信箱"
            prefix={<Mail size={18} className="text-slate-400" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="密碼"
            prefix={<Lock size={18} className="text-slate-400" />}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">
            {isLogin ? '登入' : '註冊'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(isLogin ? '/register' : '/login')}
            className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
          >
            {isLogin ? '還沒有帳號？點此註冊' : '已經有帳號了？點此登入'}
          </button>
        </div>
      </div>
    </div>
  );
}
