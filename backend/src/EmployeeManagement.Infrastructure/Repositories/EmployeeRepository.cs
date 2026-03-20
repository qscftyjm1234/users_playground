/*
 * 🌟 這隻檔案在幹嘛？
 * 這隻檔案就是「拿資料的東西」。
 * 它負責去資料庫把員工資料搬出來，或是把髒資料過濾掉。
 * API 控制器需要員工資料時，直接找這隻檔案要就好。
 */

using System; // 基礎工具（如時間）
using System.Collections.Generic; // 容器工具（如清單）
using System.Linq; // 找資料用的語法
using System.Threading.Tasks; // 讓程式執行時不卡住的工具
using Microsoft.EntityFrameworkCore; // 連接資料庫的專業工具
using EmployeeManagement.Application.Interfaces; // 專案定義好的規格
using EmployeeManagement.Domain.Entities; // 定員員工「長什麼樣子」的地方
using EmployeeManagement.Infrastructure.Data; // 通往 MySQL 資料庫的大門

namespace EmployeeManagement.Infrastructure.Repositories
{
    /// <summary>
    /// 最基本的拿資料工具。
    /// </summary>
    public class Repository<T> : IRepository<T> where T : BaseEntity
    {
        // 資料庫連線
        protected readonly ApplicationDbContext _context;
        // 資料庫裡面的那張資料表
        protected readonly DbSet<T> _dbSet;

        // 【建構函式】：這就像是把「資料庫鑰匙」交給這台機器。
        // 當系統啟動時，它會把連線 (context) 丟進來，讓這台機器知道要去哪裡搬資料。
        public Repository(ApplicationDbContext context)
        {
            _context = context; // 把鑰匙收好
            _dbSet = context.Set<T>(); // 指向對應的資料表
        }

        /// <summary>
        /// 用 ID 找一個東西。
        /// </summary>
        public async Task<T> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

        /// <summary>
        /// 非同步取得該資料表中的所有實體。
        /// </summary>
        public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

        /// <summary>
        /// 功能 只是把實體加入到「Context 的追蹤清單」中。
        /// </summary>
        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

        /// <summary>
        /// 更新一筆實體資料。
        /// 會同步更新實體的最後修改時間。
        /// </summary>
        public void Update(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            _dbSet.Update(entity);
        }

        /// <summary>
        /// 刪除一筆實體資料（使用軟刪除 Soft Delete）。
        /// 並非真的從資料庫移除，而是標記為已刪除。
        /// </summary>
        public void Delete(T entity)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            _dbSet.Update(entity); // 實質上是更新狀態，達到軟刪除效果
        }

        /// <summary>
        /// 把剛剛做的修改存到資料庫裡。
        /// </summary>
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    /// <summary>
    /// 專門給「員工」用的工具。
    /// </summary>
    public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
    {
        // 把鑰匙交給上面的老師傅 (base) 處理
        public EmployeeRepository(ApplicationDbContext context) : base(context) { }

        /// <summary>
        /// 抓所有員工，連同他們的「部門」跟「職位」一起搬出來（提供給儀表板統計使用）。
        /// </summary>
        public async Task<IEnumerable<Employee>> GetEmployeesWithDetailsAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .ToListAsync();
        }

        /// <summary>
        /// 抓所有員工，連同他們的「部門」跟「職位」一起搬出來。
        /// 這樣就不會搬一次員工，又要跑好幾趟去搬部門資訊。
        /// </summary>
        public async Task<(IEnumerable<Employee> Items, int TotalCount)> GetEmployeesPagedAsync(int pageNumber, int pageSize, string? searchTerm = null)
        {

            // IQueryable 用於生成 SQL 語法，將.Where()轉換成SQL的WHERE，純粹將條件疊加，但無獲取資料，除非下.ToListAsync()等
            // IEnumerable 用於處理資料，在記憶體端做處理，普通的資料容器，會霸佔記憶體

            // 1. 準備「查詢工具」
            // AsQueryable() 讓資料庫知道：我們還沒決定好要怎麼查，先讓我準備一下 SQL 語法。
            // 如果不加 AsQueryable()，EF Core 會直接把所有員工資料一次抓到記憶體裡，
            // 然後才在 C# 程式裡做篩選，這樣資料量一大就會非常慢！
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .AsQueryable();

            // IsNullOrWhiteSpace 檢查字串是否為 null、空字串或只有空白字元
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                // Trim() 移除字串前後的空白
                // ToLower() 將字串轉換為小寫
                searchTerm = searchTerm.Trim().ToLower();
                // Where 條件： 有點類似前端的Arrary Filter
                // 1. 名字包含搜尋關鍵字
                // 2. 姓氏包含搜尋關鍵字
                // 3. Email 包含搜尋關鍵字
                // 4. 職位名稱包含搜尋關鍵字
                // 5. 部門名稱包含搜尋關鍵字

                // Contains 意思就是「有包含」;類似Javascript 的 includes()
                query = query.Where(e => e.FirstName.ToLower().Contains(searchTerm) || e.LastName.ToLower().Contains(searchTerm) || e.Email.ToLower().Contains(searchTerm) || e.Position.Name.ToLower().Contains(searchTerm) || e.Department.Name.ToLower().Contains(searchTerm));
            }


            // 下面這段所代表的SQL語法
            // SELECT COUNT(*) FROM Employees WHERE ...
            var totalCount = await query.CountAsync();

            // SELECT * FROM Employees WHERE ... LIMIT 10 OFFSET 0  

            // .OrderBy(e => e.Id) 依照 ID 排序
            // .Take(pageSize) 這次只拿幾筆資料
            // .Skip((pageNumber - 1) * pageSize) 略過幾筆資料
            // .ToListAsync() 才會真正把 SQL 語法丟到資料庫去執行，並把結果搬回 C# 記憶體。
            var items = await query
                .OrderBy(e => e.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (items, totalCount);
        }

        /// <summary>
        /// 依據 ID 取得單一員工資料，並包含其部門與職位詳細資訊。
        /// </summary>
        public async Task<Employee> GetEmployeeWithDetailsAsync(int id)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        /// <summary>
        /// 檢查指定的 Email 是否在資料庫中是唯一的（尚未被使用）。
        /// 在新增或修改員工時進行驗證。
        /// </summary>
        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            // 如果找不到任何員工使用此 Email，回傳 true (代表唯一)
            return !await _context.Employees.AnyAsync(e => e.Email == email);
        }
    }
}
