using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Infrastructure.Data;

namespace EmployeeManagement.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

        public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

        public void Update(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            _dbSet.Update(entity);
        }

        public void Delete(T entity)
        {
            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            _dbSet.Update(entity); // Soft delete
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }

    public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
    {
        public EmployeeRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Employee>> GetEmployeesWithDetailsAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .ToListAsync();
        }

        public async Task<Employee> GetEmployeeWithDetailsAsync(int id)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Position)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            return !await _context.Employees.AnyAsync(e => e.Email == email);
        }
    }
}
