using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeHub.Infrastructure.Data;
using LifeHub.Domain.Entities;
using System.Threading.Tasks;
using System.Linq;

namespace LifeHub.API.Controllers
{
    [ApiController]
    [Route("api/groups/{groupId}/[controller]")]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetEvents(int groupId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var events = await _context.Events
                .Where(e => e.GroupId == groupId && !e.IsDeleted)
                .Select(e => new { e.Id, e.Title, e.Description, e.Date, e.Location })
                .ToListAsync();

            return Ok(events);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEvent(int groupId, [FromBody] CreateEventRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var inGroup = await _context.UserGroups.AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
            if (!inGroup) return Forbid();

            var ev = new EventRecord
            {
                GroupId = groupId,
                Title = request.Title,
                Description = request.Description,
                Date = request.Date,
                Location = request.Location
            };

            _context.Events.Add(ev);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Event created", eventId = ev.Id });
        }
    }

    public class CreateEventRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public System.DateTime Date { get; set; }
        public string? Location { get; set; }
    }
}

