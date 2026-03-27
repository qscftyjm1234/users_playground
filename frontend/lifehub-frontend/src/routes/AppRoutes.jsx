import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routesConfig } from './config';

/**
 * 路由管理器組件
 * 在這裡動態注入 Props 給所有的頁面元件 (如 isDarkMode, onLogin 等)
 */
export default function AppRoutes({ isDarkMode, activeGroup, activeGroupId, groups, onLogin }) {
  
  // 動態注入必要的 props 給所有路由元件
  const injectProps = (routes) => {
    return routes.map(route => {
      const newRoute = { ...route };
      
      if (route.element) {
        // 使用 React.cloneElement 注入共用 Props (isDarkMode, onLogin 等)
        newRoute.element = React.cloneElement(route.element, { 
          isDarkMode, 
          groupData: activeGroup,
          groupId: activeGroupId,
          groups,
          onLogin
        });
      }

      if (route.children) {
        newRoute.children = injectProps(route.children);
      }

      return newRoute;
    });
  };

  const processedRoutes = injectProps(routesConfig);
  const element = useRoutes(processedRoutes);

  return element;
}
