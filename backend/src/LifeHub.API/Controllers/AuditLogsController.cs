using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using LifeHub.Application.Interfaces;
using LifeHub.Domain.Entities;

namespace LifeHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogRepository _repository;

        public AuditLogsController(IAuditLogRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetRecentLogs([FromQuery] int count = 50)
        {
            var logs = await _repository.GetRecentLogsAsync(count);
            return Ok(logs);
        }
    }
}

