import { Navigate } from 'react-router-dom';

// Pages - 使用 lazy loading 可以提升大型專案效能（選用，目前先直接引入）
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
    description: '隨時掌握群組生活動態'
  },
  {
    path: '/groups',
    element: <GroupsPage />,
    title: '我的群組',
    description: '邀請室友或家人共築數位空間'
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
    description: '開啟您的群組生活管理'
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    title: '個人後台設定',
    description: '管理您的個人資料與偏好'
  },
  {
    path: '/admin',
    element: <AdminPage />,
    title: '管理後台',
    description: '系統整體營運與全站數據監控'
  },
  // 特定群組的子路由
  {
    path: '/groups/:groupId',
    children: [
      {
        path: '',
        element: <DashboardPage />,
        title: '群組首頁',
        description: '管理群組成員與查看最新情報'
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
        title: '支出分攤',
        description: '拆帳不再麻煩，紀錄一目瞭然'
      },
      {
        path: 'tasks',
        element: <TasksPage />,
        title: '家務分配',
        description: '公平分配，輕鬆追蹤完成進度'
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
        title: '共同行程',
        description: '不再錯過彼此的重要時刻'
      },
      {
        path: 'memos',
        element: <MemosPage />,
        title: '備忘錄',
        description: '紀錄生活中的每一個好點子'
      }
    ]
  },
  {
    path: '*',
    element: <div className="p-20 text-center font-bold text-slate-400">404 - 頁面不存在</div>,
    title: '404',
    description: '找不到指定的頁面'
  }
];
