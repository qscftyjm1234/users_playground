using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Enums;

namespace EmployeeManagement.Infrastructure.Data
{
    // 這行 ": DbContext" 是「繼承」：代表我是 DbContext 的小孩，繼承了所有操作資料庫的能力
    public class ApplicationDbContext : DbContext
    {
        // 這是「開機設定」：
        // 1. ApplicationDbContext(...)：當機器啟動時，會收到一包名為 options 的「開機設定包」(包含資料庫帳密)
        // 2. : base(options)：拿到設定包後，立刻轉交給老爸 (DbContext) 的心臟，讓它去執行連線動作
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // 1. 定義資料表：就像 Excel 的「分頁」
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        // 這是「畫設計圖」的時間點：
        // protected: 只有自己人和子孫能進來設定
        // override: 覆蓋掉老爸預設的畫法，改用我自訂的規則
        // void: 做完就結束，不用回傳東西
        // ModelBuilder: 我們請來的「建築師」，我們告訴他規則，他負責去蓋資料庫
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 我們把「建築師」的資訊印出來看看
            Console.WriteLine("--------------------------------------------------");
            Console.WriteLine($"收到建築師了！他的型別是: {modelBuilder.GetType().Name}");
            Console.WriteLine("他正在準備畫資料庫設計圖...");
            Console.WriteLine("--------------------------------------------------");

            base.OnModelCreating(modelBuilder);

            // 2. 自動過濾器：就像 Excel 的「自動篩選」，只抓出沒被刪除的資料
            modelBuilder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Department>().HasQueryFilter(d => !d.IsDeleted);
            modelBuilder.Entity<Position>().HasQueryFilter(p => !p.IsDeleted);
            modelBuilder.Entity<AuditLog>().HasQueryFilter(a => !a.IsDeleted);

            // 3. 設定規則：就像 Excel 的「資料驗證」，不准輸入重複的東西
            // 工號不能重複
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.EmployeeCode)
                .IsUnique();

            // 信箱不能重複
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email)
                .IsUnique();

            // 4. 預設資料：就像是這本 Excel 一建立好，就自動幫你打好的「預設內容」
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "IT", Description = "Information Technology", CreatedAt = DateTime.UtcNow },
                new Department { Id = 2, Name = "HR", Description = "Human Resources", CreatedAt = DateTime.UtcNow }
            );

            modelBuilder.Entity<Position>().HasData(
                new Position { Id = 1, Name = "Software Engineer", Description = "Developer", CreatedAt = DateTime.UtcNow },
                new Position { Id = 2, Name = "HR Manager", Description = "Manager", CreatedAt = DateTime.UtcNow }
            );

            modelBuilder.Entity<Employee>().HasData(
                new Employee 
                { 
                    Id = 1, 
                    EmployeeCode = "EMP000001", 
                    FirstName = "John", 
                    LastName = "Doe", 
                    Email = "john.doe@example.com", 
                    Phone = "123456789", 
                    DepartmentId = 1, 
                    PositionId = 1, 
                    Status = EmployeeStatus.Active, 
                    HireDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new Employee 
                { 
                    Id = 2, 
                    EmployeeCode = "EMP000002", 
                    FirstName = "Jane", 
                    LastName = "Smith", 
                    Email = "jane.smith@example.com", 
                    Phone = "987654321", 
                    DepartmentId = 2, 
                    PositionId = 2, 
                    Status = EmployeeStatus.Active, 
                    HireDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}
