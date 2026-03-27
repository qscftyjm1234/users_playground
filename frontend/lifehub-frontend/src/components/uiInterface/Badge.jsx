import React from 'react';

/**
 * Badge - 標籤樣式 UI 組件
 * 用於顯示狀態、通知或類別等資訊
 * 
 * @param {Object} props
 * @param {'success' | 'warning' | 'error' | 'neutral'} props.variant - 樣式類別
 * @param {React.ReactNode} props.children - 標籤內容
 * @param {string} props.className - 額外的 CSS 類名
 */
const Badge = ({ variant = 'neutral', children, className = '' }) => {
  const variantClass = {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    neutral: "badge-neutral",
  };

  return (
    <span className={`premium-badge ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
