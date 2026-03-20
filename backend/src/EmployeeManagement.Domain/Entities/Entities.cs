using System;
using EmployeeManagement.Domain.Enums;

namespace EmployeeManagement.Domain.Entities
{

    // abstract 是抽象類別，不能直接new，只能被繼承，本身也不能被建立實體
    // 就像是藍圖，不能直接蓋房子，只能用藍圖去蓋房子
    // 反正唯一目的就是被繼承
    // 如果類別內有public abstract void Print(); 就必須實作
    // public abstract class Animal {
    //     // 🍕 已經實作好的方法：大家吃法都一樣
    //     public void Eat() { 
    //         Console.WriteLine("吃東西..."); 
    //     }
    //     // 📢 抽象方法：每種動物叫聲不同，所以不提供實作，只下命令
    //     public abstract void MakeSound(); 
    // }
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    public class Employee : BaseEntity
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int PositionId { get; set; }
        public EmployeeStatus Status { get; set; }
        public DateTime HireDate { get; set; }

        // Navigation Properties
        public virtual Department? Department { get; set; }
        public virtual Position? Position { get; set; }
    }

    public class Department : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public virtual ICollection<Employee>? Employees { get; set; }
    }

    public class Position : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public virtual ICollection<Employee>? Employees { get; set; }
    }

    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public int? EmployeeId { get; set; }
        public virtual Employee? Employee { get; set; }
    }

    public class AuditLog : BaseEntity
    {
        public string EntityName { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string Action { get; set; } = string.Empty; // Create, Update, Delete
        public string Changes { get; set; } = string.Empty; // JSON format of changes
        public string? PerformedBy { get; set; }
    }
}
