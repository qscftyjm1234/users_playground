using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "SystemAdmin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.CreatedAt })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("groups")]
        public async Task<IActionResult> GetAllGroups()
        {
            var groups = await _context.Groups
                .Select(g => new { g.Id, g.Name, g.Description, g.CreatedAt, MemberCount = g.UserGroups!.Count })
                .ToListAsync();

            return Ok(groups);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalGroups = await _context.Groups.CountAsync();
            var totalExpenses = await _context.Expenses.CountAsync();
            var totalTasks = await _context.Tasks.CountAsync();

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalGroups = totalGroups,
                TotalExpenses = totalExpenses,
                TotalTasks = totalTasks
            });
        }
    }
}
