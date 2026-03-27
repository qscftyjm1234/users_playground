using System.Collections.Generic;
using System.Threading.Tasks;
using LifeHub.Domain.Entities;

namespace LifeHub.Application.Interfaces
{
    /// <summary>
    /// ??隞 (Generic Repository Pattern)
    /// 摰儔鈭????”??箸???芣?嫘??踝??銝隞賣?皞撌亥???
    /// <typeparam name="T">隞?”銝????祕擃?憒??∪極???雿?</typeparam>
    /// </summary>
    public interface IRepository<T> where T : BaseEntity
    {
        // 靘? ID ???桐?銝蝑???
        Task<T> GetByIdAsync(int id);
        
        // ??閰脰??”???摰?
        Task<IEnumerable<T>> GetAllAsync();
        
        // ?啣?銝蝑???誨颲行??柴?撠??撖怠鞈?摨?
        Task AddAsync(T entity);
        
        // 璅???鞈?撌脖耨??
        void Update(T entity);
        
        // 璅???鞈?閬??
        void Delete(T entity);
        
        // 甇?????Ｙ??啣??耨?嫘?文?雿?銝甈⊥批神?亥??澈嚗?敺?摮???嚗?
        Task SaveChangesAsync();
    }


    /// 蝔賣?亥? (Audit Log) ?隞
    /// </summary>
    public interface IAuditLogRepository : IRepository<AuditLog>
    {
        // ???餈???閮?嚗?憒???啁? 10 蝑?雿???
        Task<IEnumerable<AuditLog>> GetRecentLogsAsync(int count);
    }
}

