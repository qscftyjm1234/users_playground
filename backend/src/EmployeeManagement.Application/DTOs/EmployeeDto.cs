using System;
using EmployeeManagement.Domain.Enums;

namespace EmployeeManagement.Application.DTOs
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}";
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string PositionName { get; set; } = string.Empty;
        public int PositionId { get; set; }
        public int DepartmentId { get; set; }
        public int Status { get; set; }
        public DateTime HireDate { get; set; }
    }

    public class CreateEmployeeRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int PositionId { get; set; }
        public EmployeeStatus Status { get; set; }
        public DateTime HireDate { get; set; }
    }

    public class UpdateEmployeeRequest : CreateEmployeeRequest
    {
        public int Id { get; set; }
    }
}
