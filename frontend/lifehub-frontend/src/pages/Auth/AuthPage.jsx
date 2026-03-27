import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';
import Input from '../../components/uiInterface/Input';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import authApi from '../../api/authApi';

export default function AuthPage({ isLogin, isDarkMode, onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '',      // 顯示名稱 (Display Name)
    loginAccount: '',  // 登入帳號 (Account ID)
    email: '',         // 電子信箱 (Email)
    password: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isLogin) {
        response = await authApi.login({
          loginAccount: formData.loginAccount,
          password: formData.password
        });
      } else {
        response = await authApi.register({
          loginAccount: formData.loginAccount,
          username: formData.username,
          password: formData.password
        });
      }
      
      const user = response.data;
      // 成功後將使用者資訊存入本地或是更新 Context
      onLogin(user);
    } catch (error) {
      console.error('Auth Error:', error);
      alert(error.response?.data || '發生錯誤，請稍後再試');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google Login Success, processing token...');
    try {
      const idToken = credentialResponse.credential;
      
      // 手動解碼 ID Token (JWT 中間段是 Payload)
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const googleData = JSON.parse(jsonPayload);
      
      const response = await authApi.googleLogin({
        email: googleData.email,
        username: googleData.name,
        avatarUrl: googleData.picture
      });

      const user = response.data;
      onLogin(user);
    } catch (error) {
      console.error('Google Auth Error:', error);
      alert('Google 登入失敗');
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
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
            與您的家人和朋友共同管理數位生活
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              placeholder="使用者顯示名稱 (中英文皆可)"
              prefix={<UserIcon size={18} className="text-slate-400" />}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          )}
          
          <Input
            placeholder={isLogin ? "登入帳號" : "設定登入帳號 (英數字)"}
            prefix={<UserIcon size={18} className="text-slate-400" />}
            value={formData.loginAccount}
            onChange={(e) => setFormData({ ...formData, loginAccount: e.target.value })}
          />
          
          <Input
            type="password"
            placeholder={isLogin ? "密碼" : "設定密碼"}
            prefix={<Lock size={18} className="text-slate-400" />}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 text-lg">
            {isLogin ? '確認登入' : '立即註冊'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${isDarkMode ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-500'}`}>或者透過</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme={isDarkMode ? 'filled_black' : 'outline'}
            shape="pill"
            size="large"
            width="100%"
            text="continue_with"
          />
        </div>

        <div className="mt-8 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => navigate(isLogin ? '/register' : '/login')}
            className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
          >
            {isLogin ? '還沒有帳號嗎？按此註冊' : '已經有帳號了嗎？按此登入'}
          </button>
        </div>
      </div>
    </div>
  );
}

