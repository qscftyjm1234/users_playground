using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Infrastructure.Data;
using EmployeeManagement.Domain.Entities;
using System.Threading.Tasks;
using System.Linq;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/groups/{groupId}/[controller]")]
    [Authorize]
    public class MemosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MemosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMemos(int groupId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var memos = await _context.Memos
                .Where(m => m.GroupId == groupId && !m.IsDeleted)
                .Select(m => new { m.Id, m.Content, m.Tags })
                .ToListAsync();

            return Ok(memos);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMemo(int groupId, [FromBody] CreateMemoRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var memo = new Memo
            {
                GroupId = groupId,
                Content = request.Content,
                Tags = request.Tags
            };

            _context.Memos.Add(memo);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Memo created", memoId = memo.Id });
        }
    }

    public class CreateMemoRequest
    {
        public string Content { get; set; } = string.Empty;
        public string? Tags { get; set; }
    }
}
