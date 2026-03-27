using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LifeHub.Application.Interfaces;
using LifeHub.Domain.Entities;
using LifeHub.Infrastructure.Data;

namespace LifeHub.Infrastructure.Repositories
{
    public class AuditLogRepository : Repository<AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<AuditLog>> GetRecentLogsAsync(int count)
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}

