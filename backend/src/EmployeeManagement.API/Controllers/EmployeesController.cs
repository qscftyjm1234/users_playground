using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Enums;
using System.Text;
using EmployeeManagement.Infrastructure.Services;

namespace EmployeeManagement.API.Controllers
{
    [ApiController] // 標記為 Web API 控制器，自動處理 400 錯誤與 JSON 序列化
    [Route("api/[controller]")] // 設定路由，[controller] 會自動替換為 "Employees"
    public class EmployeesController : ControllerBase
    {
        // 依賴注入 (Dependency Injection): 透過介面存取資料層，增加可測試性與解耦
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IAuditLogger _auditLogger;

        public EmployeesController(IEmployeeRepository employeeRepository, IAuditLogger auditLogger)
        {
            _employeeRepository = employeeRepository;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// [GET] /api/employees
        /// 取得所有員工名單（包含部門與職位詳細資料）
        /// </summary>
        /// FromQuery 是用來從 URL 取得參數
        /// 範例：/api/employees?pageNumber=1&pageSize=10&searchTerm=John
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetEmployees(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string searchTerm = null)
        {
            var (items, totalCount) = await _employeeRepository.GetEmployeesPagedAsync(pageNumber, pageSize, searchTerm);
            var result = items.Select(e => new EmployeeDto
            {
                Id = e.Id,
                EmployeeCode = e.EmployeeCode,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Phone = e.Phone,
                DepartmentName = e.Department?.Name,
                PositionName = e.Position?.Name,
                DepartmentId = e.DepartmentId, // 加入這行
                PositionId = e.PositionId,     // 加入這行
                Status = (int)e.Status,   // 將 Enum 強制轉型為 int 就能拿到 1, 2, 3
                HireDate = e.HireDate
            });

            // 3. 打包回傳
            // new {} 是一個匿名物件，C# 是強行別，他需要物件都有一個類別，所以我們用 new {} 來建立一個匿名物件
            return Ok(new
            {
                items = result, // 這是轉換後的 DTO 名單
                totalCount = totalCount,
                pageNumber = pageNumber, // 順便把現在第幾頁也回傳
                pageSize = pageSize      // 還有每頁幾筆也回傳
            });
        }

        /// <summary>
        /// [GET] /api/employees/export
        /// 匯出所有員工資料為 CSV 檔案
        /// </summary>
        [HttpGet("export")]
        public async Task<IActionResult> ExportEmployees()
        {
            var employees = await _employeeRepository.GetEmployeesWithDetailsAsync();
            var builder = new StringBuilder();
            
            // CSV Header
            builder.AppendLine("ID,員工編號,姓名,電子郵件,電話,部門,職位,狀態,到職日期");

            foreach (var e in employees)
            {
                var statusLabel = e.Status.ToString();
                var fullName = $"{e.LastName}{e.FirstName}";
                builder.AppendLine($"{e.Id},{e.EmployeeCode},\"{fullName}\",\"{e.Email}\",\"{e.Phone}\",\"{e.Department?.Name}\",\"{e.Position?.Name}\",\"{statusLabel}\",{e.HireDate:yyyy-MM-dd}");
            }

            return File(Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(builder.ToString())).ToArray(), "text/csv", $"Employees_{DateTime.Now:yyyyMMdd}.csv");
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
                DepartmentId = employee.DepartmentId,
                PositionId = employee.PositionId,
                Status = (int)employee.Status,
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


            // 在 C# 的這個 { ... } 物件初始化語法中，你可以只填你關心的欄位。
            // 那些沒填的欄位，如果它有預設值（例如 string = string.Empty, int = 0, bool = false），就會用預設值。
            // 如果是 nullable type（例如 DateTime?），沒填就是 null。
            var employee = new Employee
            {
                // 因為工號通常是公司系統自動產生的
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
            // 功能 只是把實體加入到「Context 的追蹤清單」中。
            await _employeeRepository.AddAsync(employee);
            await _employeeRepository.SaveChangesAsync();

            await _auditLogger.LogAsync("Employee", employee.Id, "CREATE", $"Created employee {employee.FirstName} {employee.LastName} ({employee.EmployeeCode})");

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee.Id);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, UpdateEmployeeRequest request)
        {
            if (id != request.Id) return BadRequest("ID mismatch");

            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null) return NotFound();

            // Check email uniqueness if email has changed
            if (employee.Email != request.Email && !await _employeeRepository.IsEmailUniqueAsync(request.Email))
            {
                return BadRequest("Email already exists.");
            }

            employee.FirstName = request.FirstName;
            employee.LastName = request.LastName;
            employee.Email = request.Email;
            employee.Phone = request.Phone;
            employee.DepartmentId = request.DepartmentId;
            employee.PositionId = request.PositionId;
            employee.Status = request.Status;
            employee.HireDate = request.HireDate;

            _employeeRepository.Update(employee);
            await _employeeRepository.SaveChangesAsync();

            await _auditLogger.LogAsync("Employee", employee.Id, "UPDATE", $"Updated employee {employee.FirstName} {employee.LastName}");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null) return NotFound();

            _employeeRepository.Delete(employee);
            await _employeeRepository.SaveChangesAsync();

            await _auditLogger.LogAsync("Employee", employee.Id, "DELETE", $"Deleted employee {employee.Id}");

            return NoContent();
        }
    }
}
