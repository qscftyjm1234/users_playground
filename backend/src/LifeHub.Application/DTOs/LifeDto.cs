using System;
using System.Collections.Generic;

namespace LifeHub.Application.DTOs
{
    public class CreateGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class JoinGroupRequest
    {
        public string InviteCode { get; set; } = string.Empty;
    }

    public class CreateExpenseRequest
    {
        public int GroupId { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<int> SplitUserIds { get; set; } = new List<int>();
    }

    public class CreateTaskRequest
    {
        public int GroupId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? AssignedToUserId { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskStatusRequest
    {
        public int Status { get; set; }
    }

    public class InviteUserRequest
    {
        public string SearchTerm { get; set; } = string.Empty; // Email or LoginAccount
    }

    public class ExpenseSummaryResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public decimal TotalPaid { get; set; }
        public decimal TotalOwed { get; set; }
        public decimal NetBalance => TotalPaid - TotalOwed; // Positive means user is owed, Negative means user owes
    }

    public class UpdateTaskRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? AssignedToUserId { get; set; }
        public DateTime? DueDate { get; set; }
        public int? Status { get; set; }
    }

    public class CreateMemoRequest
    {
        public string Content { get; set; } = string.Empty;
        public string? Tags { get; set; }
    }

    public class CreateEventRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public string? Location { get; set; }
    }
}

