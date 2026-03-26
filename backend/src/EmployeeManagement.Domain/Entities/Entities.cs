using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagement.Domain.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    public enum UserRole
    {
        User = 0,
        SystemAdmin = 1
    }

    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public UserRole Role { get; set; } = UserRole.User;

        public virtual ICollection<UserGroup>? UserGroups { get; set; }
    }

    public class Group : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string InviteCode { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

        public virtual ICollection<UserGroup>? UserGroups { get; set; }
        public virtual ICollection<Expense>? Expenses { get; set; }
        public virtual ICollection<ChoreTask>? Tasks { get; set; }
        public virtual ICollection<EventRecord>? Events { get; set; }
        public virtual ICollection<Memo>? Memos { get; set; }
    }

    public enum GroupRole
    {
        Member = 0,
        Admin = 1
    }

    public class UserGroup
    {
        public int UserId { get; set; }
        public virtual User? User { get; set; }

        public int GroupId { get; set; }
        public virtual Group? Group { get; set; }

        public GroupRole Role { get; set; } = GroupRole.Member;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }

    public class Expense : BaseEntity
    {
        public int GroupId { get; set; }
        public virtual Group? Group { get; set; }

        public int PaidByUserId { get; set; }
        public virtual User? PaidByUser { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }

        public virtual ICollection<ExpenseShare>? Shares { get; set; }
    }

    public class ExpenseShare : BaseEntity
    {
        public int ExpenseId { get; set; }
        public virtual Expense? Expense { get; set; }

        public int UserId { get; set; }
        public virtual User? User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OwedAmount { get; set; }
    }

    public enum TaskStatus
    {
        Pending = 0,
        InProgress = 1,
        Done = 2
    }

    public class ChoreTask : BaseEntity
    {
        public int GroupId { get; set; }
        public virtual Group? Group { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public int? AssignedToUserId { get; set; }
        public virtual User? AssignedToUser { get; set; }

        public DateTime? DueDate { get; set; }
        public TaskStatus Status { get; set; } = TaskStatus.Pending;
    }

    public class EventRecord : BaseEntity
    {
        public int GroupId { get; set; }
        public virtual Group? Group { get; set; }

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public string? Location { get; set; }
    }

    public class Memo : BaseEntity
    {
        public int GroupId { get; set; }
        public virtual Group? Group { get; set; }

        public string Content { get; set; } = string.Empty;
        public string? Tags { get; set; } // comma separated
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
