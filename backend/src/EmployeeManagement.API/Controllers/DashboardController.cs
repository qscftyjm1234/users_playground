using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Domain.Enums;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IRepository<EmployeeManagement.Domain.Entities.Department> _departmentRepository;

        public DashboardController(
            IEmployeeRepository employeeRepository,
            IRepository<EmployeeManagement.Domain.Entities.Department> departmentRepository)
        {
            _employeeRepository = employeeRepository;
            _departmentRepository = departmentRepository;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardDto>> GetStats()
        {
            var employees = await _employeeRepository.GetEmployeesWithDetailsAsync();
            var departments = await _departmentRepository.GetAllAsync();

            var stats = new DashboardDto
            {
                TotalEmployees = employees.Count(),
                EmployeesByDepartment = departments.Select(d => new DepartmentStatDto
                {
                    DepartmentName = d.Name,
                    Count = employees.Count(e => e.DepartmentId == d.Id)
                }).ToList(),
                EmployeesByStatus = employees.GroupBy(e => e.Status)
                    .Select(g => new StatusStatDto
                    {
                        Status = (int)g.Key,
                        StatusLabel = g.Key.ToString(),
                        Count = g.Count()
                    }).ToList()
            };

            return Ok(stats);
        }
    }
}
