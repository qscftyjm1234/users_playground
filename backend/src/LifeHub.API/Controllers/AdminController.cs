using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using System.Threading.Tasks;
using System.Linq;

namespace LifeHub.API.Controllers
{
    /// <summary>
    /// 【教學筆記】系統管理員控制器
    /// 這個控制器的目的，是讓具備「最高權限」的人，可以總覽全站的所有數據。
    /// 
    /// 學習點 1：[Authorize(Roles = "SystemAdmin")] 
    /// 這是 ASP.NET Core 的權限守護神。它會檢查登入者的 JWT 裡面，
    /// 是否具備 "SystemAdmin" 這個 Role。如果沒有，系統會直接回傳 403 Forbidden。
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // 這裡的 [controller] 會自動帶入類別名稱去掉 Controller，即 "api/Admin"
    [Authorize(Roles = "SystemAdmin")]
    public class AdminController : ControllerBase
    {
        // 學習點 2：依賴注入 (Dependency Injection, DI)
        // 我們不自己在建構子裡面 new ApplicationDbContext()，而是讓系統「注入」給我們。
        // 這樣可以讓程式碼更容易測試，也能統一管理資料庫連線的生命週期。
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 學習點 3：非同步程式設計 (async/await)
        /// 呼叫資料庫是「耗時操作」。使用 async 可以讓伺服器在等待資料夾回傳時，
        /// 先去做別的事（處理其他請求），進而提升系統的整體效能。
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            // 學習點 4：投影 (Projection)
            // 為什麼要用 .Select()？ 
            // 如果直接 return await _context.Users.ToListAsync()，會把「密碼雜湊」等敏感資料也回給前端。
            // 透過 Select，我們只挑選前端「頁面顯示」真正需要的導向，這叫資料安全性優化。
            var users = await _context.Users
                .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.CreatedAt })
                .ToListAsync();

            // Ok() 會產生 HTTP 200 狀態碼，代表「成功」。它的內容會被自動轉換成 JSON 格式。
            return Ok(users);
        }

        [HttpGet("groups")]
        public async Task<IActionResult> GetAllGroups()
        {
            // 學習點 5：導覽屬性 (Navigation Property) 與統計
            // g.UserGroups!.Count 是利用 Entity Framework 的關聯功能來直接計算人數。
            // 這樣前端的首頁就能直接顯示「這個群組有幾個人」，而不需要前端自己去算。
            var groups = await _context.Groups
                .Select(g => new { g.Id, g.Name, g.Description, g.CreatedAt, MemberCount = g.UserGroups!.Count })
                .ToListAsync();

            return Ok(groups);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            // 學習點 6：匿名物件 (Anonymous Object)
            // 當我們需要回傳一組「臨時組合」的資料，而不是某個資料庫實體時，可以用 new { ... }。
            // 這對前端報表或儀表板 (Dashboard) 來說非常方便。
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

