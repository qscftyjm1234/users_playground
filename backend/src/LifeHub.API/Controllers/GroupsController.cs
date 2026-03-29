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

        // 邀請成員入群 (by email or account)
        [HttpPost("{id}/invite")]
        public async Task<IActionResult> InviteUser(int id, [FromBody] InviteUserRequest request)
        {
            var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            // 1. 檢查群組是否存在
            var group = await _context.Groups.FindAsync(id);
            if (group == null || group.IsDeleted) return NotFound("Group not found");

            // 2. 檢查目前使用者是否在群組內 (至少要是在成員內才能邀請)
            var requester = await _context.UserGroups.AnyAsync(ug => ug.GroupId == id && ug.UserId == currentUserId);
            if (!requester) return Unauthorized("You are not part of this group");

            // 3. 搜尋目標使用者
            var targetUser = await _context.Users.FirstOrDefaultAsync(u => 
                (u.Email == request.SearchTerm || u.LoginAccount == request.SearchTerm) && !u.IsDeleted);
            
            if (targetUser == null) return NotFound("Target user not found");

            // 4. 檢查目標是否已在群組
            var existing = await _context.UserGroups.AnyAsync(ug => ug.GroupId == id && ug.UserId == targetUser.Id);
            if (existing) return BadRequest("User is already in the group");

            // 5. 加入群組
            _context.UserGroups.Add(new UserGroup { UserId = targetUser.Id, GroupId = id, Role = GroupRole.Member });
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Successfully invited {targetUser.Username} to the group" });
        }

        // 退出群組
        [HttpDelete("{id}/leave")]
        public async Task<IActionResult> LeaveGroup(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var userGroup = await _context.UserGroups.FirstOrDefaultAsync(ug => ug.GroupId == id && ug.UserId == userId);
            if (userGroup == null) return NotFound("You are not in this group");

            _context.UserGroups.Remove(userGroup);
            await _context.SaveChangesAsync();

            return Ok(new { message = "You have left the group" });
        }

        // 取得單一群組詳細資訊 (包含成員列表)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroupDetail(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            // 檢查使用者是否在該群組
            var isMember = await _context.UserGroups.AnyAsync(ug => ug.GroupId == id && ug.UserId == userId);
            if (!isMember) return StatusCode(403, "You are not part of this group");

            var group = await _context.Groups
                .Where(g => g.Id == id && !g.IsDeleted)
                .Select(g => new
                {
                    g.Id,
                    g.Name,
                    g.Description,
                    g.InviteCode,
                    Members = _context.UserGroups
                        .Where(ug => ug.GroupId == g.Id)
                        .Select(ug => new
                        {
                            Id = ug.UserId,
                            Name = ug.User!.Username,
                            Role = ug.Role.ToString(),
                            Avatar = ug.User.AvatarUrl
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (group == null) return NotFound("Group not found");

            return Ok(group);
        }
    }
}

