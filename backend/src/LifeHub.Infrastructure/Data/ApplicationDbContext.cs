using Microsoft.EntityFrameworkCore;
using LifeHub.Domain.Entities;

namespace LifeHub.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<UserGroup> UserGroups { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<ExpenseShare> ExpenseShares { get; set; }
        public DbSet<ChoreTask> Tasks { get; set; }
        public DbSet<EventRecord> Events { get; set; }
        public DbSet<Memo> Memos { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
            modelBuilder.Entity<Group>().HasQueryFilter(g => !g.IsDeleted);
            modelBuilder.Entity<Expense>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ChoreTask>().HasQueryFilter(t => !t.IsDeleted);
            modelBuilder.Entity<EventRecord>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Memo>().HasQueryFilter(m => !m.IsDeleted);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.LoginAccount)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<UserGroup>()
                .HasKey(ug => new { ug.UserId, ug.GroupId });

            modelBuilder.Entity<UserGroup>()
                .HasOne(ug => ug.User)
                .WithMany(u => u.UserGroups)
                .HasForeignKey(ug => ug.UserId);

            modelBuilder.Entity<UserGroup>()
                .HasOne(ug => ug.Group)
                .WithMany(g => g.UserGroups)
                .HasForeignKey(ug => ug.GroupId);
                
            modelBuilder.Entity<ExpenseShare>()
                .HasOne(es => es.Expense)
                .WithMany(e => e.Shares)
                .HasForeignKey(es => es.ExpenseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExpenseShare>()
                .HasOne(es => es.User)
                .WithMany()
                .HasForeignKey(es => es.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

