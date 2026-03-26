import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routesConfig } from './config';

/**
 * 路由渲染器組件
 * 這裡是通過配置陣列動態生成路由的核心
 * 
 * processedRoutes 的結構範例（useRoutes 所需格式）：
 * [
 *   {
 *     path: 'expenses',
 *     element: <ExpensesPage isDarkMode={true} groupData={...} />, // 已由 React.cloneElement 注入 Props
 *     title: '支出分攤'
 *   },
 *   ...
 * ]
 */
export default function AppRoutes({ isDarkMode, activeGroup, activeGroupId, groups }) {
  
  // 透過遞迴或映射處理 props 注入 (注入 isDarkMode 等全局狀態)
  const injectProps = (routes) => {
    return routes.map(route => {
      const newRoute = { ...route };
      
      if (route.element) {
        // 使用 React.cloneElement 注入共用 Props
        // 這就像是在「複製」原始組件的同時，把最新的全局變數「灌進去」
        newRoute.element = React.cloneElement(route.element, { 
          isDarkMode, 
          groupData: activeGroup,
          groupId: activeGroupId,
          groups
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
