using System.Threading.Tasks;

namespace EmployeeManagement.Application.Interfaces
{
    public interface IAuditLogger
    {
        Task LogAsync(string entityName, int entityId, string action, string changes, string? performedBy = null);
    }
}
