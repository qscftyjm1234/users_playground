using System.Threading.Tasks;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Infrastructure.Services
{
    public interface IAuditLogger
    {
        Task LogAsync(string entityName, int entityId, string action, string changes, string? performedBy = null);
    }

    public class AuditLogger : IAuditLogger
    {
        private readonly IAuditLogRepository _repository;

        public AuditLogger(IAuditLogRepository repository)
        {
            _repository = repository;
        }

        public async Task LogAsync(string entityName, int entityId, string action, string changes, string? performedBy = null)
        {
            var log = new AuditLog
            {
                EntityName = entityName,
                EntityId = entityId,
                Action = action,
                Changes = changes,
                PerformedBy = performedBy ?? "System"
            };

            await _repository.AddAsync(log);
            await _repository.SaveChangesAsync();
        }
    }
}
