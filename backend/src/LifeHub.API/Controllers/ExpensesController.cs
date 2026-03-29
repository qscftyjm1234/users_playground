using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using LifeHub.Domain.Entities;
using LifeHub.Application.DTOs;
using System.Threading.Tasks;
using System.Linq;

namespace LifeHub.API.Controllers
{
    [ApiController]
    [Route("api/groups/{groupId}/[controller]")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExpensesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetExpenses(int groupId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var expenses = await _context.Expenses
                .Where(e => e.GroupId == groupId && !e.IsDeleted)
                .Select(e => new
                {
                    e.Id,
                    e.Amount,
                    e.Category,
                    e.Date,
                    e.Notes,
                    PaidBy = e.PaidByUser!.Username,
                    Shares = e.Shares!.Select(s => new { s.User!.Username, s.OwedAmount })
                })
                .ToListAsync();

            return Ok(expenses);
        }

        [HttpPost]
        public async Task<IActionResult> AddExpense(int groupId, [FromBody] CreateExpenseRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var expense = new Expense
            {
                GroupId = groupId,
                PaidByUserId = userId,
                Amount = request.Amount,
                Category = request.Category,
                Notes = request.Notes,
                Date = DateTime.UtcNow
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync(); // To get Expense Id

            if (request.SplitUserIds == null || !request.SplitUserIds.Any())
            {
                // If not specified, default to self
                _context.ExpenseShares.Add(new ExpenseShare { ExpenseId = expense.Id, UserId = userId, OwedAmount = request.Amount });
            }
            else
            {
                var splitAmount = Math.Round(request.Amount / request.SplitUserIds.Count, 2);
                foreach (var sId in request.SplitUserIds)
                {
                    _context.ExpenseShares.Add(new ExpenseShare { ExpenseId = expense.Id, UserId = sId, OwedAmount = splitAmount });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Expense added", expenseId = expense.Id });
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(int groupId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            // 1. Get all members in the group
            var members = await _context.UserGroups
                .Where(ug => ug.GroupId == groupId)
                .Select(ug => new { ug.UserId, ug.User!.Username })
                .ToListAsync();

            // 2. Calculate paid and owed for each member
            var summary = new List<ExpenseSummaryResponse>();

            foreach (var member in members)
            {
                var totalPaid = await _context.Expenses
                    .Where(e => e.GroupId == groupId && e.PaidByUserId == member.UserId && !e.IsDeleted)
                    .SumAsync(e => e.Amount);

                var totalOwed = await _context.ExpenseShares
                    .Where(es => es.UserId == member.UserId && es.Expense!.GroupId == groupId && !es.Expense.IsDeleted)
                    .SumAsync(es => es.OwedAmount);

                summary.Add(new ExpenseSummaryResponse
                {
                    UserId = member.UserId,
                    Username = member.Username,
                    TotalPaid = totalPaid,
                    TotalOwed = totalOwed
                });
            }

            return Ok(summary);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int groupId, int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.GroupId == groupId);
            if (expense == null) return NotFound();

            expense.IsDeleted = true;
            expense.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Expense deleted" });
        }
    }
}

