/**
 * Employee Management System Enums
 * 與後端 EmployeeEnums.cs 同步
 */

export const EmployeeStatus = {
  ACTIVE: 1,
  INACTIVE: 2,
  ON_LEAVE: 3,
  TERMINATED: 4,
  
  // 反向映射與字串處理，支援後端傳回的各種格式
  MAP: {
    1: 'Active',
    2: 'Inactive',
    3: 'OnLeave',
    4: 'Terminated',
    'Active': 1,
    'Inactive': 2,
    'OnLeave': 3,
    'Terminated': 4,
    '0': 1, // 防禦性處理：若後端傳回 0，暫時視為 Active (或是根據需求定義)
  }
};
