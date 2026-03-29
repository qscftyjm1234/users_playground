import React, { useState, useEffect } from 'react';
import { User, Key, Loader2 } from 'lucide-react';
import Input from '../../components/uiInterface/Input';
import userApi from '../../api/userApi';
import { message } from 'antd';

export default function SettingsPage({ isDarkMode, onUserUpdate }) {
  const [profile, setProfile] = useState({ username: '', email: '', avatarUrl: '', isGoogleUser: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  
  // 修改密碼相關的 state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getProfile();
        setProfile({
          username: response.data.username || '',
          email: response.data.email || '',
          avatarUrl: response.data.avatarUrl || '',
          isGoogleUser: response.data.isGoogleUser || false
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        message.error('無法讀取個人資料');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({
        username: profile.username,
        avatarUrl: profile.avatarUrl
      });
      message.success('資料更新成功！');
      // 通知 App 元件更新全域狀態
      if (onUserUpdate) {
        onUserUpdate({ username: profile.username, avatarUrl: profile.avatarUrl });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      message.error(error.response?.data?.message || '更新失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return message.error('兩次輸入的新密碼不一致');
    }
    if (passwordForm.newPassword.length < 6) {
      return message.error('新密碼長度建議至少 6 位數');
    }

    setSaving(true);
    try {
      await userApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      message.success('密碼修改成功！');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('profile');
    } catch (error) {
      console.error('Failed to change password:', error);
      message.error(error.response?.data?.message || '修改失敗，請檢查舊密碼是否正確');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} max-w-4xl`}>
      <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>後台管理 / 個人設定</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <div 
            onClick={() => setActiveTab('profile')}
            className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
              activeTab === 'profile' 
                ? (isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100') 
                : (isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600')
            }`}
          >
            <User size={20} />
            <span className="font-bold">個人資料</span>
          </div>
          {!profile.isGoogleUser && (
            <div 
              onClick={() => setActiveTab('password')}
              className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                activeTab === 'password' 
                  ? (isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100') 
                  : (isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600')
              }`}
            >
              <Key size={20} />
              <span className="font-bold">修改密碼</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          {activeTab === 'profile' ? (
            <>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-black overflow-hidden border-4 border-white shadow-md">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile.username[0] || '?'
                  )}
                </div>
                <div>
                  <button 
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                    onClick={() => {
                      const url = prompt('請輸入大頭貼圖片網址:', profile.avatarUrl);
                      if (url !== null) setProfile({ ...profile, avatarUrl: url });
                    }}
                  >
                    更換大頭貼
                  </button>
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
                  <p className="text-xs text-slate-500 mt-2 font-medium">電子郵件不可更改，若需修改請聯繫系統管理員。</p>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:bg-blue-300 flex items-center gap-2"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? '儲存中...' : '儲存更新'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>目前的密碼</label>
                  <Input 
                    type="password"
                    placeholder="請輸入現有的密碼"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>新密碼</label>
                  <Input 
                    type="password"
                    placeholder="請輸入新密碼 (至少 6 位數)"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>確認新密碼</label>
                  <Input 
                    type="password"
                    placeholder="請再次輸入新密碼"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:bg-blue-300 flex items-center gap-2 mt-4"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? '處理中...' : '確認修改密碼'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
