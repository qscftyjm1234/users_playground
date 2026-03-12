using System;

namespace EmployeeManagement.Domain.Enums
{
    public enum EmployeeStatus
    {
        Active = 1,
        Inactive = 2,
        OnLeave = 3,
        Terminated = 4
    }

    public enum UserRole
    {
        Admin = 1,
        HR = 2,
        Employee = 3
    }
}
