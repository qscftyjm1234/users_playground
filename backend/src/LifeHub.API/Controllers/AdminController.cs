using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using LifeHub.Domain.Entities;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace LifeHub.API.Controllers
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
                .Select(u => new 
                {
                    u.Id,
                    u.LoginAccount,
                    u.Email,
                    u.Username,
                    u.Role,
                    RoleName = u.Role.ToString(),
                    u.CreatedAt
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(users);
        }

        [HttpPatch("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            user.Username = request.Username;
            user.Role = request.Role;
            user.Email = request.Email;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {user.Username} updated successfully" });
        }

        [HttpPost("users/{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] AdminResetPasswordRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            if (string.IsNullOrWhiteSpace(request.NewPassword)) 
                return BadRequest("New password cannot be empty");

            // 使用與 AuthController 相同的 SHA256 雜湊與 Base64 編碼
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(request.NewPassword));
                user.PasswordHash = System.Convert.ToBase64String(hashedBytes);
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully" });
        }
    }

    public class AdminUpdateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public UserRole Role { get; set; }
    }

    public class AdminResetPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
