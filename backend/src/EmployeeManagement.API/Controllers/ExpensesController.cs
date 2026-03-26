using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Infrastructure.Data;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Application.DTOs;
using System.Threading.Tasks;
using System.Linq;

namespace EmployeeManagement.API.Controllers
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
                Notes = request.Notes
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
                var splitAmount = request.Amount / request.SplitUserIds.Count;
                foreach (var sId in request.SplitUserIds)
                {
                    _context.ExpenseShares.Add(new ExpenseShare { ExpenseId = expense.Id, UserId = sId, OwedAmount = splitAmount });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Expense added", expenseId = expense.Id });
        }
    }
}
