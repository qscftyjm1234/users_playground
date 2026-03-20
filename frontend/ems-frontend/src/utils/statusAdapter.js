import { EmployeeStatus } from '../constants/employeeEnums';

/**
 * 員工狀態適配器 (Status Adapter)
 * 負責將後端原始資料 (Raw Data) 轉換為前端 UI 所需的配置 (UI Tokens)
 */
export const getEmployeeStatusConfig = (rawStatus) => {
  // 1. 標準化狀態值：嘗試從混亂的資料格式中找出對應的 ID
  let statusId = rawStatus;
  
  if (typeof rawStatus === 'string') {
    // 處理字串格式 (如 "Active") 或 字串化數字 (如 "0")
    statusId = EmployeeStatus.MAP[rawStatus] || parseInt(rawStatus, 10);
  }

  // 2. 定義 UI 映射關係 (不暴露在組件中，集中管理)
  const configs = {
    [EmployeeStatus.ACTIVE]: {
      label: '在職中',
      variant: 'success'
    },
    [EmployeeStatus.INACTIVE]: {
      label: '離職',
      variant: 'neutral'
    },
    [EmployeeStatus.ON_LEAVE]: {
      label: '休假中',
      variant: 'warning'
    },
    [EmployeeStatus.TERMINATED]: {
      label: '已解雇',
      variant: 'error'
    },
  };

  // 3. 回傳配置，若找不到則回傳「未知」的預設配置 (容錯處理)
  return configs[statusId] || {
    label: `未知 (${rawStatus})`,
    variant: 'neutral'
  };
};
