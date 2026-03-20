using System.Collections.Generic;

namespace EmployeeManagement.Application.DTOs
{
    public class DashboardDto
    {
        public int TotalEmployees { get; set; }
        public List<DepartmentStatDto> EmployeesByDepartment { get; set; } = new();
        public List<StatusStatDto> EmployeesByStatus { get; set; } = new();
    }

    public class DepartmentStatDto
    {
        public string DepartmentName { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class StatusStatDto
    {
        public int Status { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
