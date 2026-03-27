import { EmployeeStatus } from '../constants/employeeEnums';

/**
 * 員工狀態適配器 (Status Adapter)
 * 負責將後端原始數據 (Raw Data) 轉換為前端 UI 所需的標籤 (UI Tokens)
 */
export const getEmployeeStatusConfig = (rawStatus) => {
  // 1. 確保拿到數值，有些舊數據可能帶入的是 ID
  let statusId = rawStatus;
  
  if (typeof rawStatus === 'string') {
    // 字串標籤處理 (如 "Active") 或 字串數字 (如 "0")
    statusId = EmployeeStatus.MAP[rawStatus] || parseInt(rawStatus, 10);
  }

  // 2. 定義 UI 對應關係 (不放在組件內，以便中央控管)
  const configs = {
    [EmployeeStatus.ACTIVE]: {
      label: '正式在職',
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
      label: '已解僱',
      variant: 'error'
    },
  };

  // 3. 回傳配置，若找不到回傳『未知』的預設配置 (增加容錯率)
  return configs[statusId] || {
    label: `未知 (${rawStatus})`,
    variant: 'neutral'
  };
};
