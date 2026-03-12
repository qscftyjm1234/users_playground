using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Soft Delete Query Filter
            modelBuilder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Department>().HasQueryFilter(d => !d.IsDeleted);
            modelBuilder.Entity<Position>().HasQueryFilter(p => !p.IsDeleted);

            // Employee Code Unique
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.EmployeeCode)
                .IsUnique();

            // Email Unique
            modelBuilder.Entity<Employee>()
                .HasIndex(e => e.Email)
                .IsUnique();
        }
    }
}
