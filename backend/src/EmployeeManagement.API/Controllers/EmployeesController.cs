using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Enums;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeesController(IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees()
        {
            var employees = await _employeeRepository.GetEmployeesWithDetailsAsync();
            var result = employees.Select(e => new EmployeeDto
            {
                Id = e.Id,
                EmployeeCode = e.EmployeeCode,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Phone = e.Phone,
                DepartmentName = e.Department?.Name,
                PositionName = e.Position?.Name,
                Status = e.Status.ToString(),
                HireDate = e.HireDate
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
        {
            var employee = await _employeeRepository.GetEmployeeWithDetailsAsync(id);
            if (employee == null) return NotFound();

            return Ok(new EmployeeDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                Phone = employee.Phone,
                DepartmentName = employee.Department?.Name,
                PositionName = employee.Position?.Name,
                Status = employee.Status.ToString(),
                HireDate = employee.HireDate
            });
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeDto>> CreateEmployee(CreateEmployeeRequest request)
        {
            // Simple validation check (usually handled by FluentValidation with a Behavior or Filter)
            if (!await _employeeRepository.IsEmailUniqueAsync(request.Email))
            {
                return BadRequest("Email already exists.");
            }

            var employee = new Employee
            {
                EmployeeCode = $"EMP{DateTime.Now.Ticks % 1000000:D6}", // Simplified generator
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                DepartmentId = request.DepartmentId,
                PositionId = request.PositionId,
                Status = request.Status,
                HireDate = request.HireDate
            };

            await _employeeRepository.AddAsync(employee);
            await _employeeRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee.Id);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null) return NotFound();

            _employeeRepository.Delete(employee);
            await _employeeRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}
