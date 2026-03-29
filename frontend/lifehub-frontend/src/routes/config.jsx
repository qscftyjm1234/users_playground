import { Navigate } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import React from 'react';

// Pages - 使用 lazy loading 可以大幅優化首載效能（目前先採直接匯入以確保修復）
import AuthPage from '../pages/Auth/AuthPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import GroupsPage from '../pages/Groups/GroupsPage';
import ExpensesPage from '../pages/Expenses/ExpensesPage';
import TasksPage from '../pages/Tasks/TasksPage';
import CalendarPage from '../pages/Calendar/CalendarPage';
import MemosPage from '../pages/Memos/MemosPage';
import SettingsPage from '../pages/Settings/SettingsPage';
import AdminPage from '../pages/Admin/AdminPage';

/**
 * 路由配置定義
 */
export const routesConfig = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    title: '首頁'
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    title: '個人總覽',
    description: '管理您的家務群組與數位生活'
  },
  {
    path: '/groups',
    element: <GroupsPage />,
    title: '我的群組',
    description: '邀集家人朋友加入共同參與及管理'
  },
  {
    path: '/login',
    element: <AuthPage isLogin={true} />,
    title: '登入',
    description: '歡迎回到 LifeHub'
  },
  {
    path: '/register',
    element: <AuthPage isLogin={false} />,
    title: '註冊',
    description: '開啟智慧群組生活管理的第一步'
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    title: '個人帳戶設定',
    description: '管理您的個人資料與偏好設定'
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        path: '',
        element: <AdminPage />,
        title: '系統管理員控制台',
        description: '全站使用者管理與系統運行監控'
      }
    ]
  },
  // 針對特定群組的巢狀路由
  {
    path: '/groups/:groupId',
    children: [
      {
        path: '',
        element: <DashboardPage />,
        title: '群組首頁',
        description: '管理群組成員與查看最新訊息'
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
        title: '支出明細',
        description: '開支明細記錄與共同負債結算'
      },
      {
        path: 'tasks',
        element: <TasksPage />,
        title: '家務任務',
        description: '指派待辦與追蹤家務進度'
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
        title: '活動日程',
        description: '查看群組共有行程與即將到來的活動'
      },
      {
        path: 'memos',
        element: <MemosPage />,
        title: '備忘錄',
        description: '記錄生活中的點點滴滴與靈感'
      }
    ]
  },
  {
    path: '*',
    element: <div className="p-20 text-center font-bold text-slate-400">404 - 找不到頁面</div>,
    title: '404',
    description: '您搜尋的網頁可能已移除或不存在'
  }
];
