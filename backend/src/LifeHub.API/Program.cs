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

// 2. Database Configuration - ULTIMATE ROBUST MODE
Console.WriteLine("----------------------------------------------------------------");
Console.WriteLine("[DEBUG] Checking Environment Variables...");
var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_PRIVATE_URL")
           ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

string? connectionString = null;
if (!string.IsNullOrEmpty(rawUrl) && rawUrl.StartsWith("mysql://"))
{
    Console.WriteLine("[DB CONFIG] Detected mysql:// URL format. Parsing...");
    try
    {
        var uri = new Uri(rawUrl);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo[0];
        var password = userInfo.Length > 1 ? userInfo[1] : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 3306;
        var database = uri.AbsolutePath.TrimStart('/');
        
        connectionString = $"Server={host};Port={port};Database={database};User={user};Password={password};SslMode=None;AllowPublicKeyRetrieval=True;";
        Console.WriteLine($"[DB CONFIG] Parse SUCCESS: Server={host}; Database={database}; Port={port};");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB CONFIG] Parse ERROR: {ex.Message}");
    }
}
else if (!string.IsNullOrEmpty(rawUrl))
{
    connectionString = rawUrl;
    Console.WriteLine("[DB CONFIG] Using raw connection string from environment.");
}

if (string.IsNullOrEmpty(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine("[DB CONFIG] Falling back to config-based connection string.");
}

// Masked log
if (!string.IsNullOrEmpty(connectionString))
{
    var parts = connectionString.Split(';');
    var sb = new StringBuilder("[DB CONFIG] Final: ");
    foreach (var part in parts)
    {
        var t = part.Trim();
        if (t.StartsWith("Server=", StringComparison.OrdinalIgnoreCase) || 
            t.StartsWith("Database=", StringComparison.OrdinalIgnoreCase) ||
            t.StartsWith("Port=", StringComparison.OrdinalIgnoreCase))
        {
            sb.Append(t).Append("; ");
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
        mysqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
    });
});

// 3. DI & Auth (Condensed for clarity)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();
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
    options.AddPolicy("AllowReactApp", policy => policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// --- Production Features ---
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (Railway-Prod)");
    c.RoutePrefix = "swagger";
});

// [DEBUG] Add Health Check endpoint
app.MapGet("/health", () => "OK");

// --- BACKGROUND Auto Migration ---
// Move migration to background to avoid blocking server startup (fixes 502)
Task.Run(() => {
    using (var scope = app.Services.CreateScope())
    {
        try 
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[ASYNC-INFO] Starting Migration in background...");
            context.Database.Migrate();
            Console.WriteLine("[ASYNC-INFO] Migration SUCCESS.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ASYNC-ERROR] Migration FAILED: {ex.Message}");
        }
    }
});

// --- Pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// [FIX 502] Log Port and listen
var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine($"[DEPLOY] Listening on PORT: {port}");

// On Railway, binding to 0.0.0.0 is better than localhost
app.Run();
