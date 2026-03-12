using System.Collections.Generic;
using System.Threading.Tasks;
using EmployeeManagement.Domain.Entities;

namespace EmployeeManagement.Application.Interfaces
{
    public interface IRepository<T> where T : BaseEntity
    {
        Task<T> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task SaveChangesAsync();
    }

    public interface IEmployeeRepository : IRepository<Employee>
    {
        Task<IEnumerable<Employee>> GetEmployeesWithDetailsAsync();
        Task<Employee> GetEmployeeWithDetailsAsync(int id);
        Task<bool> IsEmailUniqueAsync(string email);
    }
}
