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
}

