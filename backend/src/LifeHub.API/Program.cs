using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using LifeHub.Infrastructure.Data;
using LifeHub.Application.Interfaces;
using LifeHub.Infrastructure.Repositories;
using LifeHub.Infrastructure.Authentication;
using LifeHub.Infrastructure.Services;
using LifeHub.API.Middleware;

// --- Services Configuration ---
var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Database Configuration - DEBUG MODE
// Logging all environment variables for diagnosis (Keys only)
Console.WriteLine("----------------------------------------------------------------");
Console.WriteLine("[DEBUG] Available Environment Variables (DB-related):");
foreach (System.Collections.DictionaryEntry de in Environment.GetEnvironmentVariables())
{
    string key = de.Key.ToString();
    if (key.Contains("MYSQL", StringComparison.OrdinalIgnoreCase) || 
        key.Contains("DATABASE", StringComparison.OrdinalIgnoreCase) ||
        key.Contains("CONNECTION", StringComparison.OrdinalIgnoreCase))
    {
        Console.WriteLine($"[DEBUG] Key: {key}");
    }
}
Console.WriteLine("----------------------------------------------------------------");

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
                    ?? Environment.GetEnvironmentVariable("DATABASE_URL") 
                    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("[DB CONFIG] CRITICAL ERROR: Connection string is NULL or Empty!");
}
else
{
    var parts = connectionString.Split(';');
    var sb = new StringBuilder("[DB CONFIG] Using: ");
    foreach (var part in parts)
    {
        var trimmed = part.Trim();
        if (trimmed.StartsWith("Server=", StringComparison.OrdinalIgnoreCase) || 
            trimmed.StartsWith("Database=", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("Port=", StringComparison.OrdinalIgnoreCase))
        {
            sb.Append(trimmed).Append("; ");
        }
    }
    Console.WriteLine(sb.ToString());
}
Console.WriteLine("----------------------------------------------------------------");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(connectionString ?? "", serverVersion, mysqlOptions => 
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3, // Reduced for faster feedback during debug
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });
});

// 3. Dependency Injection
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();

// 4. Authentication
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// 5. CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                    ?? new[] { "http://localhost:3000", "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

var app = builder.Build();

// Enable Swagger in PRODUCTION for debugging
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API V1 (Prod Debug)");
    c.RoutePrefix = "swagger"; // Always available at /swagger
});

// --- Auto Migration ---
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Console.WriteLine("[INFO] Attempting Database Migration...");
        context.Database.Migrate();
        Console.WriteLine("[INFO] Database Migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Database Migration failed: {ex.Message}");
        Console.WriteLine("[DEBUG] App will CONTINUE to run so you can access Swagger.");
    }
}

// --- Middleware Pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();
// Temporarily disable HTTPS redirection if it causes issues on Railway
// app.UseHttpsRedirection(); 
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
