import React from 'react';

/**
 * Badge - 純粹級 UI 介面組件
 * 負責視覺樣式，不包含任何商業邏輯。
 * 
 * @param {Object} props
 * @param {'success' | 'warning' | 'error' | 'neutral'} props.variant - 樣式種類
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
