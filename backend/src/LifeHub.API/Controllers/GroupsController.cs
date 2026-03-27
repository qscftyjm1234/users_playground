using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using LifeHub.Domain.Entities;
using LifeHub.Application.DTOs;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace LifeHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GroupsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var groups = await _context.UserGroups
                .Where(ug => ug.UserId == userId && !ug.Group!.IsDeleted)
                .Select(ug => new
                {
                    ug.Group!.Id,
                    ug.Group.Name,
                    ug.Group.Description,
                    ug.Role,
                    ug.Group.InviteCode
                })
                .ToListAsync();

            return Ok(groups);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var group = new Group
            {
                Name = request.Name,
                Description = request.Description
            };

            var userGroup = new UserGroup
            {
                UserId = userId,
                Group = group,
                Role = GroupRole.Admin
            };

            _context.Groups.Add(group);
            _context.UserGroups.Add(userGroup);
            await _context.SaveChangesAsync();

            return Ok(new { group.Id, group.Name, group.InviteCode });
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinGroup([FromBody] JoinGroupRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var group = await _context.Groups.FirstOrDefaultAsync(g => g.InviteCode == request.InviteCode && !g.IsDeleted);
            if (group == null) return NotFound("Invalid invite code");

            var existing = await _context.UserGroups.FirstOrDefaultAsync(ug => ug.GroupId == group.Id && ug.UserId == userId);
            if (existing != null) return BadRequest("Already in the group");

            _context.UserGroups.Add(new UserGroup { UserId = userId, GroupId = group.Id, Role = GroupRole.Member });
            await _context.SaveChangesAsync();

            return Ok(new { group.Id, group.Name });
        }
    }
}

