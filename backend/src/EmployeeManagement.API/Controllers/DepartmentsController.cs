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
    public class DepartmentsController : ControllerBase
    {
        private readonly IRepository<Department> _repository;
        private readonly IAuditLogger _auditLogger;

        public DepartmentsController(IRepository<Department> repository, IAuditLogger auditLogger)
        {
            _repository = repository;
            _auditLogger = auditLogger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetDepartments()
        {
            var departments = await _repository.GetAllAsync();
            var result = departments.Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<DepartmentDto>> CreateDepartment(CreateDepartmentRequest request)
        {
            var department = new Department
            {
                Name = request.Name,
                Description = request.Description
            };

            await _repository.AddAsync(department);
            await _repository.SaveChangesAsync();

            await _auditLogger.LogAsync("Department", department.Id, "CREATE", $"Created department: {department.Name}");

            return CreatedAtAction(nameof(GetDepartments), new { id = department.Id }, new DepartmentDto 
            { 
                Id = department.Id, 
                Name = department.Name, 
                Description = department.Description 
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, UpdateDepartmentRequest request)
        {
            if (id != request.Id) return BadRequest("ID mismatch");

            var department = await _repository.GetByIdAsync(id);
            if (department == null) return NotFound();

            department.Name = request.Name;
            department.Description = request.Description;

            _repository.Update(department);
            await _repository.SaveChangesAsync();

            await _auditLogger.LogAsync("Department", department.Id, "UPDATE", $"Updated department: {department.Name}");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _repository.GetByIdAsync(id);
            if (department == null) return NotFound();

            _repository.Delete(department);
            await _repository.SaveChangesAsync();

            await _auditLogger.LogAsync("Department", department.Id, "DELETE", $"Deleted department: {department.Name}");

            return NoContent();
        }
    }
}
