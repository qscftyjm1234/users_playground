using System;
using EmployeeManagement.Domain.Enums;

namespace EmployeeManagement.Application.DTOs
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string Email { get; set; }
        public string Phone { get; set; }
        public string DepartmentName { get; set; }
        public string PositionName { get; set; }
        public string Status { get; set; }
        public DateTime HireDate { get; set; }
    }

    public class CreateEmployeeRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
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
