using System.Collections.Generic;
using System.Threading.Tasks;
using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Application.Interfaces
{
    /// <summary>
    /// 通用倉儲介面 (Generic Repository Pattern)
    /// 定義了所有資料表最基本的「增刪查改」功能，像是一份標準施工藍圖。
    /// <typeparam name="T">代表不同的資料實體（如：員工、部門、職位）</typeparam>
    /// </summary>
    public interface IRepository<T> where T : BaseEntity
    {
        // 依據 ID 抓取單一一筆資料
        Task<T> GetByIdAsync(int id);
        
        // 抓取該資料表的所有內容
        Task<IEnumerable<T>> GetAllAsync();
        
        // 新增一筆資料到「代辦清單」，尚未真的寫入資料庫
        Task AddAsync(T entity);
        
        // 標記這筆資料已修改
        void Update(T entity);
        
        // 標記這筆資料要刪除
        void Delete(T entity);
        
        // 正式把上面的新增、修改、刪除動作，一次性寫入資料庫（最後的存檔動作）
        Task SaveChangesAsync();
    }


    /// 稽核日誌 (Audit Log) 倉儲介面
    /// </summary>
    public interface IAuditLogRepository : IRepository<AuditLog>
    {
        // 抓取最近的操作記錄（例如：最新的 10 筆操作紀錄）
        Task<IEnumerable<AuditLog>> GetRecentLogsAsync(int count);
    }
}
