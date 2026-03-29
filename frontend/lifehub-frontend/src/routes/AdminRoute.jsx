import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ user }) => {
  // 檢查是否登入且角色為 SystemAdmin (對應後端 Enum 值 1)
  const isAdmin = user && (user.role === 'SystemAdmin' || user.role === 1);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
