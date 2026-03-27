import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Layout & Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { cn } from './lib/utils';

// Routes
import AppRoutes from './routes/AppRoutes';

// Data
import { MOCK_GROUPS } from './data/mockData';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. 管理使用者狀態 (從 localStorage 初始化)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lifehub-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const currentPath = location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/register';

  // 2. 登入保護機制
  useEffect(() => {
    // 如果沒登入且不在登入/註冊頁面，就跳轉回登入頁
    if (!user && !isAuthPage) {
      navigate('/login');
    }
    // 如果已登入卻跑去登入頁面，就跳回首頁
    if (user && isAuthPage) {
      navigate('/dashboard');
    }
  }, [user, isAuthPage, navigate]);

  // 3. 登入/登出處理函式
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('lifehub-user', JSON.stringify(userData));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lifehub-user');
    localStorage.removeItem('lifehub-token');
    navigate('/login');
  };

  // 4. 重置主題 (原有邏輯)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('app-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('app-theme', 'light');
    }
  }, [isDarkMode]);

  // 5. 群組相關邏輯 (原有邏輯)
  const groupPathMatch = currentPath.match(/\/groups\/([^\/]+)/);
  const activeGroupId = groupPathMatch ? groupPathMatch[1] : null;
  const activeGroup = MOCK_GROUPS.find(g => g.id === activeGroupId);
  const isGroupContext = !!activeGroupId;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 16,
          fontFamily: 'inherit',
          colorBgContainer: isDarkMode ? '#0f172a' : '#ffffff',
          colorBgLayout: isDarkMode ? '#020617' : '#f8fafc',
        }
      }}
    >
      <div className={cn(
        "flex min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700 transition-colors duration-300",
        { "bg-slate-950 text-white": isDarkMode, "bg-slate-50 text-slate-900": !isDarkMode }
      )}>
        {/* 只在非登入頁顯示 Sidebar (且必須已登入) */}
        {!isAuthPage && user && (
          <Sidebar 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            activeGroup={activeGroup} 
            isGroupContext={isGroupContext}
            onLogout={handleLogout} // 注入登出功能
          />
        )}

        {/* Main Content: 依照是否在登入頁來決定 Margin */}
        <main className={cn(
          "flex-1 p-8 relative overflow-hidden transition-all duration-300",
          { "ml-64": !isAuthPage && user, "ml-0 flex items-center justify-center": isAuthPage }
        )}>
          {/* 背景藍色光暈 */}
          <div className={cn(
            "absolute top-0 right-0 w-96 h-96 rounded-full -mr-48 -mt-48 blur-3xl -z-10",
            { "bg-blue-900/10": isDarkMode, "bg-blue-50/50": !isDarkMode }
          )} />

          {/* 只在非登入頁顯示 Header */}
          {!isAuthPage && user && (
            <Header isDarkMode={isDarkMode} activeGroup={activeGroup} user={user} />
          )}

          <section className={cn({ "w-full max-w-md": isAuthPage })}>
            <AppRoutes 
              isDarkMode={isDarkMode} 
              activeGroup={activeGroup} 
              activeGroupId={activeGroupId} 
              groups={MOCK_GROUPS}
              onLogin={handleLogin} // 注入登入功能
            />
          </section>
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;

