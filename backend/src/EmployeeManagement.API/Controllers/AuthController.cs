using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Infrastructure.Data;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Infrastructure.Authentication;
using EmployeeManagement.Application.DTOs;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtTokenGenerator _jwtGenerator;

        public AuthController(ApplicationDbContext context, IJwtTokenGenerator jwtGenerator)
        {
            _context = context;
            _jwtGenerator = jwtGenerator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                Role = UserRole.User // Default role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Email = user.Email, Role = user.Role.ToString() });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || user.PasswordHash != HashPassword(request.Password))
                return Unauthorized("Invalid credentials");

            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Email = user.Email, Role = user.Role.ToString() });
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
