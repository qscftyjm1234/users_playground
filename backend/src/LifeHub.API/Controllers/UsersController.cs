using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using LifeHub.Domain.Entities;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace LifeHub.API.Controllers
{
    /// <summary>
    /// 【學習筆記】使用者個人中心控制器
    /// [Authorize] 特性就像是「門禁卡感應器」，它會自動完成兩件事：
    /// 1. 檢查請求是否帶有有效的 JWT 通行證 (Authentication)。
    /// 2. 獲取通行證內的資訊，並自動填充到繼承自 ControllerBase 的 "User" 屬性中。
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 只要掛上這個，全 Controller 的方法都必須登入後才能存取
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
                user.CreatedAt,
                IsGoogleUser = user.PasswordHash == "GOOGLE_OAUTH_USER"
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

        // 修改密碼
        // 這裡的 User 物件是由 ASP.NET Core 從 JWT Token 中自動解析出來的身分證 (ClaimsPrincipal)
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // User.FindFirst("userId")：從 Token 的記憶體中直接讀取 userId，不需要查資料庫
            var userIdStr = User.FindFirst("userId")?.Value;

            // 檢查 userId 是否為空或無法轉換為整數 (防禦性程式碼)
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // 雖然我們知道是誰了，但為了要修改「資料庫裡的密碼」，我們必須用 ID 去資料庫找人
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // 1. 驗證舊密碼是否為空 (Google 使用者無密碼)
            if (user.PasswordHash == "GOOGLE_OAUTH_USER")
                return BadRequest("Google login users cannot change local passwords.");

            // 2. 驗證舊密碼
            if (user.PasswordHash != HashPassword(request.OldPassword))
                return BadRequest("目前的密碼不正確。");

            // 3. 更新新密碼
            user.PasswordHash = HashPassword(request.NewPassword);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "密碼修改成功" });
        }

        // 個人總覽統計 API
        // 跨所有群組，聚合「個人任務數」與「財務概況」
        [HttpGet("me/summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userIdStr = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // 1. 待辦 + 進行中的任務（指派給我的）
            var pendingTaskCount = await _context.Tasks
                .Where(t => t.AssignedToUserId == userId
                         && !t.IsDeleted
                         && (t.Status == LifeHub.Domain.Entities.TaskStatus.Pending
                          || t.Status == LifeHub.Domain.Entities.TaskStatus.InProgress))
                .CountAsync();

            // 2. 今天的活動（來自我加入的所有群組）
            var myGroupIds = await _context.UserGroups
                .Where(ug => ug.UserId == userId)
                .Select(ug => ug.GroupId)
                .ToListAsync();

            var todayStart = DateTime.UtcNow.Date;
            var todayEnd   = todayStart.AddDays(1);
            var todayEventCount = await _context.Events
                .Where(e => myGroupIds.Contains(e.GroupId)
                         && !e.IsDeleted
                         && e.Date >= todayStart
                         && e.Date < todayEnd)
                .CountAsync();

            // 3. 財務統計
            // 我付出去的（付款人是我）
            var totalPaid = await _context.Expenses
                .Where(e => e.PaidByUserId == userId && !e.IsDeleted)
                .SumAsync(e => (decimal?)e.Amount) ?? 0m;

            // 我欠人家的（我在 ExpenseShares 裡的份額）
            var totalOwed = await _context.ExpenseShares
                .Where(es => es.UserId == userId && !es.IsDeleted)
                .SumAsync(es => (decimal?)es.OwedAmount) ?? 0m;

            return Ok(new
            {
                PendingTaskCount = pendingTaskCount,
                TodayEventCount  = todayEventCount,
                TotalPaid        = totalPaid,
                TotalOwed        = totalOwed,
                NetBalance       = totalPaid - totalOwed   // 正 = 別人欠我，負 = 我欠別人
            });
        }

        // 雜湊密碼，屬於單向加密，不可逆
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
    public class UpdateProfileRequest
    {
        public string? Username { get; set; }
        public string? AvatarUrl { get; set; }
    }
}

