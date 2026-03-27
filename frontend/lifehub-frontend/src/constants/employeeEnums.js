/**
 * Employee Management System Enums
 * 與後端 EmployeeEnums.cs 對應
 */

export const EmployeeStatus = {
  ACTIVE: 1,
  INACTIVE: 2,
  ON_LEAVE: 3,
  TERMINATED: 4,
  
  // 後端會回傳英文或數字，這裡做對應與補正
  MAP: {
    1: 'Active',
    2: 'Inactive',
    3: 'OnLeave',
    4: 'Terminated',
    'Active': 1,
    'Inactive': 2,
    'OnLeave': 3,
    'Terminated': 4,
    '0': 1, // 預修定補正，後端回傳為 0 時為 Active
  }
};
