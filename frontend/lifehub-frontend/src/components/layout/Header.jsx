import React from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { routesConfig } from '../../routes/config';
import { cn } from '../../lib/utils';

export default function Header({ isDarkMode, activeGroup, user }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // 用遞迴尋找目前路由配置
  const findActiveRoute = (routes, parentPath = '') => {
    for (const route of routes) {
      // 組合路徑，確保處理巢狀路徑的前綴
      const fullPath = route.path.startsWith('/') 
        ? route.path 
        : `${parentPath}/${route.path}`.replace(/\/+/g, '/');

      // 使用 react-router-dom 的 matchPath 進行動態路徑匹配
      if (matchPath({ path: fullPath, end: true }, currentPath)) {
        return route;
      }

      // 遞迴尋找子路由
      if (route.children) {
        const childMatch = findActiveRoute(route.children, fullPath);
        if (childMatch) return childMatch;
      }
    }
    return null;
  };

  const activeRoute = findActiveRoute(routesConfig);

  // 處理標題顯示：若是群組相關則替換名稱
  const displayTitle = activeRoute?.title?.includes('群組') 
    ? activeRoute.title.replace('群組', activeGroup?.name || '群組')
    : activeRoute?.title;

  return (
    <header className="flex justify-between items-center mb-10">
      <div>
        <h1 className={cn("text-3xl font-black tracking-tight", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
          {displayTitle || 'LifeHub'}
        </h1>
        <p className={cn("font-medium transition-colors mt-1", { "text-slate-500": isDarkMode, "text-slate-600": !isDarkMode })}>
          {activeRoute?.description || '生活管理的數位好幫手'}
        </p>
      </div>

      {/* User Profiles */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className={cn("text-sm font-bold", { "text-white": isDarkMode, "text-slate-900": !isDarkMode })}>
              {user.username}
            </p>
            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-blue-600/20 shadow-lg cursor-pointer hover:ring-blue-600 transition-all active:scale-95">
            <img src={user.avatar} alt="user avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </header>
  );
}
