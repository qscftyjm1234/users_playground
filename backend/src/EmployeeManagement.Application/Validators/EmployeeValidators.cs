using FluentValidation;
using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.Application.Validators
{
    public class CreateEmployeeRequestValidator : AbstractValidator<CreateEmployeeRequest>
    {
        public CreateEmployeeRequestValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Phone).Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format.");
            RuleFor(x => x.DepartmentId).GreaterThan(0);
            RuleFor(x => x.PositionId).GreaterThan(0);
            RuleFor(x => x.HireDate).NotEmpty().LessThanOrEqualTo(DateTime.UtcNow);
        }
    }
}
