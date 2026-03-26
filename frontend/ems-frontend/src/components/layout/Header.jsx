import React from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { routesConfig } from '../../routes/config';
import { cn } from '../../lib/utils';

export default function Header({ isDarkMode, activeGroup }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // 動態尋找匹配的路由配置
  const findActiveRoute = (routes, parentPath = '') => {
    for (const route of routes) {
      // 處理路徑拼接（包含處理子路由的相對路徑）
      const fullPath = route.path.startsWith('/') 
        ? route.path 
        : `${parentPath}/${route.path}`.replace(/\/+/g, '/');

      // 使用 react-router-dom 的 matchPath 來處理參數 (如 :groupId)
      if (matchPath({ path: fullPath, end: true }, currentPath)) {
        return route;
      }

      // 如果有子路由，遞迴搜尋
      if (route.children) {
        const childMatch = findActiveRoute(route.children, fullPath);
        if (childMatch) return childMatch;
      }
    }
    return null;
  };

  const activeRoute = findActiveRoute(routesConfig);

  // 格式化標題（處理群組動態名稱）
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
          {activeRoute?.description || '隨時掌握生活動態'}
        </p>
      </div>
    </header>
  );
}
