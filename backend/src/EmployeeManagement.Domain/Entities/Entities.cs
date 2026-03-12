using System;
using EmployeeManagement.Domain.Enums;

namespace EmployeeManagement.Domain.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    public class Employee : BaseEntity
    {
        public string EmployeeCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int DepartmentId { get; set; }
        public int PositionId { get; set; }
        public EmployeeStatus Status { get; set; }
        public DateTime HireDate { get; set; }

        // Navigation Properties
        public virtual Department Department { get; set; }
        public virtual Position Position { get; set; }
    }

    public class Department : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual ICollection<Employee> Employees { get; set; }
    }

    public class Position : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual ICollection<Employee> Employees { get; set; }
    }

    public class User : BaseEntity
    {
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public int? EmployeeId { get; set; }
        public virtual Employee Employee { get; set; }
    }
}
