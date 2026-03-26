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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const currentPath = location.pathname;

  // 解析路由中的 groupId
  const groupPathMatch = currentPath.match(/\/groups\/([^\/]+)/);
  const activeGroupId = groupPathMatch ? groupPathMatch[1] : null;
  const activeGroup = MOCK_GROUPS.find(g => g.id === activeGroupId);

  const isGroupContext = !!activeGroupId;

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
        {/* Sidebar */}
        <Sidebar 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          activeGroup={activeGroup} 
          isGroupContext={isGroupContext} 
        />

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 relative overflow-hidden">
          <div className={cn(
            "absolute top-0 right-0 w-96 h-96 rounded-full -mr-48 -mt-48 blur-3xl -z-10",
            { "bg-blue-900/10": isDarkMode, "bg-blue-50/50": !isDarkMode }
          )} />

          {/* Header */}
          <Header isDarkMode={isDarkMode} activeGroup={activeGroup} />

          <section>
            <AppRoutes 
              isDarkMode={isDarkMode} 
              activeGroup={activeGroup} 
              activeGroupId={activeGroupId} 
              groups={MOCK_GROUPS}
            />
          </section>
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;
