using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using LifeHub.Domain.Entities;
using LifeHub.Infrastructure.Authentication;
using LifeHub.Application.DTOs;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace LifeHub.API.Controllers
{
    /// <summary>
    /// 【教學筆記】身份驗證控制器 (Authentication Controller)
    /// 這是所有 Web API 的門戶。負責「登入」與「註冊」，核發通行證 (JWT Token)。
    /// </summary>
    [ApiController] 
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtTokenGenerator _jwtGenerator;

        // 學習點 1：構造函數注入 (DI)
        // 除了資料庫 (_context)，我們還注入了 _jwtGenerator。
        // 當使用者通過驗證後，我們會請這個服務產生一串加密字串 (JWT)，作為使用者的登入憑證。
        public AuthController(ApplicationDbContext context, IJwtTokenGenerator jwtGenerator)
        {
            _context = context;
            _jwtGenerator = jwtGenerator;
        }

        /// <summary>
        /// 學習點 2：使用者註冊流 (Registration Flow)
        /// 這裡展示了基本的「檢查 -> 轉換 -> 儲存」模式。
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // 檢查帳號重複
            if (await _context.Users.AnyAsync(u => u.LoginAccount == request.LoginAccount))
                return BadRequest("Account ID already exists");

            var user = new User
            {
                LoginAccount = request.LoginAccount,
                Username = request.Username,
                PasswordHash = HashPassword(request.Password), 
                Role = UserRole.User 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Email = user.Email, Role = user.Role.ToString() });
        }

        /// <summary>
        /// 學習點 3：身份驗證邏輯 (Authentication Logic)
        /// 登入的核心就是「比對」。比對前端寄來的密碼與我們存起來的雜湊值。
        /// [FromBody] 標記表示這個參數會從 前端 HTTP Request 的 Body 中取得。
        /// 系統會將FromBody轉換後存進request
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.LoginAccount == request.LoginAccount);
            
            if (user == null || user.PasswordHash != HashPassword(request.Password))
                return Unauthorized("Invalid credentials");

            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse { Token = token, Username = user.Username, Email = user.Email, Role = user.Role.ToString() });
        }

        /// <summary>
        /// Google 登入接口
        /// </summary>
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            Console.WriteLine($"DEBUG: GoogleLogin path hit for {request.Email}");

            // 嘗試尋找現有使用者 (透過 Email)
            // _context: 資料庫連線資訊
            // Users: 資料表名稱
            // FirstOrDefaultAsync: 尋找第一個符合條件的資料
            // u => u.Email == request.Email: 尋找 Email 為 request.Email 的資料
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                // 如果使用者不存在，自動建立 (註冊流程)
                user = new User
                {
                    Email = request.Email,
                    Username = request.Username,
                    // 為 Google 使用者產生一個唯一的 LoginAccount，避免 DB 衝突
                    LoginAccount = "G_" + Guid.NewGuid().ToString("N").Substring(0, 10),
                    AvatarUrl = request.AvatarUrl,
                    Role = UserRole.User,
                    PasswordHash = "GOOGLE_OAUTH_USER" 
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            // _jwtGenerator.GenerateToken(user): 產生 JWT Token
            // 輸出: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJbbWFpbC1hZGRyZXNzXSIsInJvbGUiOiJVc2VyIiwiZXhwIjoxNzc0NTgyNTQzfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
            // 內容結構: { "sub": "1", "name": "John Doe", "email": "[EMAIL_ADDRESS]", "role": "User", "exp": 1774582543 }
            // 結構解析: 
            // sub: 使用者 ID
            // name: 使用者名稱
            // email: 使用者 Email
            // role: 使用者角色
            // exp: 過期時間
            
            var token = _jwtGenerator.GenerateToken(user);
            return Ok(new AuthResponse 
            { 
                Token = token, 
                Username = user.Username, 
                Email = user.Email ?? string.Empty, 
                Role = user.Role.ToString() 
            });
        }

        /// <summary>
        /// 學習點 4：單向雜湊 (Hashing)
        /// SHA256 是一種演算法，可以把任何長度的密碼轉成固定的短字串。
        /// 因為它是不可逆的，所以就算資料庫外洩，攻擊者也無法直接看到使用者的原始密碼。
        /// </summary>
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
