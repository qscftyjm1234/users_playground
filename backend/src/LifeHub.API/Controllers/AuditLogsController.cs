using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using LifeHub.Application.Interfaces;
using LifeHub.Domain.Entities;

namespace LifeHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔒 修正：必須登入才能查閱操作記錄
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

