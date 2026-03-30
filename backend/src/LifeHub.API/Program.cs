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

string? connectionString = null;
var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_PRIVATE_URL")
           ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

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
    Console.WriteLine("[DB CONFIG] Falling back to appsettings connection string.");
}

// Final Masked Log for Verification
if (!string.IsNullOrEmpty(connectionString))
{
    var parts = connectionString.Split(';');
    var sb = new StringBuilder("[DB CONFIG] Final segments: ");
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
        mysqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
    });
});

// 3. DI
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();

// 4. Auth
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

// --- Production Swagger Debug ---
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API V1 (Railway Prod)");
    c.RoutePrefix = "swagger";
});

// --- Auto Migration ---
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Console.WriteLine("[INFO] Running Migration...");
        context.Database.Migrate();
        Console.WriteLine("[INFO] Migration SUCCESS.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Migration FAILED: {ex.Message}");
    }
}

// --- Pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ----------------------------------------------------------------
// [FIX 502] Support Railway dynamic PORT
var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine($"[DEPLOY] Server starting on PORT: {port}");
app.Run($"http://0.0.0.0:{port}");
