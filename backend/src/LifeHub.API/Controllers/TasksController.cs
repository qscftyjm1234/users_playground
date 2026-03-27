using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using LifeHub.Domain.Entities;
using LifeHub.Application.DTOs;
using System.Threading.Tasks;
using System.Linq;

namespace LifeHub.API.Controllers
{
    [ApiController]
    [Route("api/groups/{groupId}/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks(int groupId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var tasks = await _context.Tasks
                .Where(t => t.GroupId == groupId && !t.IsDeleted)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Status,
                    t.DueDate,
                    AssignedTo = t.AssignedToUser != null ? t.AssignedToUser.Username : null
                })
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask(int groupId, [FromBody] CreateTaskRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var task = new ChoreTask
            {
                GroupId = groupId,
                Title = request.Title,
                Description = request.Description,
                AssignedToUserId = request.AssignedToUserId,
                DueDate = request.DueDate
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task created", taskId = task.Id });
        }

        [HttpPut("{taskId}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int groupId, int taskId, [FromBody] UpdateTaskStatusRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.GroupId == groupId);
            if (task == null) return NotFound();

            task.Status = (LifeHub.Domain.Entities.TaskStatus)request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated" });
        }
    }
}

