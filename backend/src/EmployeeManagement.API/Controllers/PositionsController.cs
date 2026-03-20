using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PositionsController : ControllerBase
    {
        private readonly IRepository<Position> _repository;
        private readonly IAuditLogger _auditLogger;

        public PositionsController(IRepository<Position> repository, IAuditLogger auditLogger)
        {
            _repository = repository;
            _auditLogger = auditLogger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PositionDto>>> GetPositions()
        {
            var positions = await _repository.GetAllAsync();
            var result = positions.Select(p => new PositionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<PositionDto>> CreatePosition(CreatePositionRequest request)
        {
            var position = new Position
            {
                Name = request.Name,
                Description = request.Description
            };

            await _repository.AddAsync(position);
            await _repository.SaveChangesAsync();

            await _auditLogger.LogAsync("Position", position.Id, "CREATE", $"Created position: {position.Name}");

            return CreatedAtAction(nameof(GetPositions), new { id = position.Id }, new PositionDto 
            { 
                Id = position.Id, 
                Name = position.Name, 
                Description = position.Description 
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePosition(int id, UpdatePositionRequest request)
        {
            if (id != request.Id) return BadRequest("ID mismatch");

            var position = await _repository.GetByIdAsync(id);
            if (position == null) return NotFound();

            position.Name = request.Name;
            position.Description = request.Description;

            _repository.Update(position);
            await _repository.SaveChangesAsync();

            await _auditLogger.LogAsync("Position", position.Id, "UPDATE", $"Updated position: {position.Name}");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var position = await _repository.GetByIdAsync(id);
            if (position == null) return NotFound();

            _repository.Delete(position);
            await _repository.SaveChangesAsync();

            await _auditLogger.LogAsync("Position", position.Id, "DELETE", $"Deleted position: {position.Name}");

            return NoContent();
        }
    }
}
