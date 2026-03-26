using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Infrastructure.Data;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Role,
                user.AvatarUrl,
                user.CreatedAt
            });
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdStr = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.Username = request.Username ?? user.Username;
            user.AvatarUrl = request.AvatarUrl ?? user.AvatarUrl;
            
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully" });
        }
    }

    public class UpdateProfileRequest
    {
        public string? Username { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
