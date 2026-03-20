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

    /// <summary>
    /// 員工專屬倉儲介面
    /// 繼承了上面的基本功能，並額外增加「員工管理專用」的高級功能。
    /// </summary>
    public interface IEmployeeRepository : IRepository<Employee>
    {
        // 儀表板專用：抓取所有員工的詳細資料（包含部門與職位名稱）
        Task<IEnumerable<Employee>> GetEmployeesWithDetailsAsync();
        
        // 員工列表專用：這支最強大！同時處理「分頁」與「關鍵字搜尋」。回傳名單 + 總數
        Task<(IEnumerable<Employee> Items, int TotalCount)> GetEmployeesPagedAsync(int pageNumber, int pageSize, string? searchTerm = null);
        
        // 依 ID 抓取特定員工，並包含他的部門名稱以便顯示
        Task<Employee> GetEmployeeWithDetailsAsync(int id);
        
        // 業務規則檢查：確認註冊的 Email 是否已經有人用過了
        Task<bool> IsEmailUniqueAsync(string email);
    }

    /// <summary>
    /// 稽核日誌 (Audit Log) 倉儲介面
    /// </summary>
    public interface IAuditLogRepository : IRepository<AuditLog>
    {
        // 抓取最近的操作記錄（例如：最新的 10 筆操作紀錄）
        Task<IEnumerable<AuditLog>> GetRecentLogsAsync(int count);
    }
}
