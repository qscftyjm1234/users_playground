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
import groupApi from './api/groupApi';

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
    return saved ? saved === 'light' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 新增：管理群組列表與目前活躍群組細節
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const currentPath = location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/register';

  // 2. 登入保護機制
  useEffect(() => {
    if (!user && !isAuthPage) {
      navigate('/login');
    }
    if (user && isAuthPage) {
      navigate('/dashboard');
    }
    
    // 如果登入，則抓取群組列表
    if (user && !isAuthPage) {
      fetchGroups();
    }
  }, [user, isAuthPage, navigate]);

  const fetchGroups = async () => {
    try {
      const res = await groupApi.getMine();
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  // 3. 登入/登出處理函式
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('lifehub-user', JSON.stringify(userData));
    localStorage.setItem('lifehub-token', userData.token); // 確保存入 token
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveGroup(null);
    setGroups([]);
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

  // 5. 群組細節抓取邏輯
  const groupPathMatch = currentPath.match(/\/groups\/([^\/]+)/);
  const activeGroupId = groupPathMatch ? groupPathMatch[1] : null;
  const isGroupContext = !!activeGroupId;

  useEffect(() => {
    const fetchActiveGroupDetail = async () => {
      if (activeGroupId) {
        try {
          setLoadingGroups(true);
          const res = await groupApi.getById(activeGroupId);
          setActiveGroup(res.data);
        } catch (err) {
          console.error('Failed to fetch group detail:', err);
        } finally {
          setLoadingGroups(false);
        }
      } else {
        setActiveGroup(null);
      }
    };
    fetchActiveGroupDetail();
  }, [activeGroupId]);

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
            user={user}
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
              groups={groups}
              user={user}
              onLogin={handleLogin} // 注入登入功能
              onUserUpdate={(updatedData) => {
                const newUser = { ...user, ...updatedData };
                setUser(newUser);
                localStorage.setItem('lifehub-user', JSON.stringify(newUser));
              }}
            />
          </section>
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;

