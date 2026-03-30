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

// --- RECOVERY VERSION: 2026-03-30-V2 ---
Console.WriteLine("================================================================");
Console.WriteLine("[DEBUG] APP STARTING - RECOVERY VERSION V2");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Database Configuration - EXTREME DIAGNOSTIC MODE
var envVars = Environment.GetEnvironmentVariables();
Console.WriteLine("[DEBUG] Scanning Environment Variables (Prefix Check):");
foreach (System.Collections.DictionaryEntry de in envVars)
{
    string key = de.Key.ToString() ?? "";
    if (key.Contains("MYSQL") || key.Contains("DATABASE") || key.Contains("CONNECTION"))
    {
        string val = de.Value?.ToString() ?? "";
        string maskedVal = val.Length > 5 ? val.Substring(0, 5) + "..." : val;
        Console.WriteLine($"[DEBUG] Found Key: {key} | Value Start: {maskedVal}");
    }
}

string? connStr = Environment.GetEnvironmentVariable("DATABASE_URL") 
                ?? Environment.GetEnvironmentVariable("MYSQL_URL") 
                ?? Environment.GetEnvironmentVariable("MYSQL_PRIVATE_URL")
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connStr))
{
    Console.WriteLine("[DB CONFIG] !!! WARNING: NO CONNECTION STRING FOUND. Using DUMMY to prevent crash.");
    // USE DUMMY STRING TO PREVENT SPECIFICATION ERROR AT INDEX 0
    connStr = "Server=dummy;Database=dummy;User=dummy;Password=dummy;";
}
else if (connStr.StartsWith("mysql://"))
{
    Console.WriteLine("[DB CONFIG] Parsing mysql:// format...");
    try {
        var uri = new Uri(connStr);
        var auth = uri.UserInfo.Split(':');
        connStr = $"Server={uri.Host};Port={(uri.Port > 0 ? uri.Port : 3306)};Database={uri.AbsolutePath.TrimStart('/')};User={auth[0]};Password={(auth.Length > 1 ? auth[1] : "")};SslMode=None;AllowPublicKeyRetrieval=True;";
    } catch { 
        Console.WriteLine("[DB CONFIG] Parser Failed. Using as-is.");
    }
}

Console.WriteLine($"[DB CONFIG] Connection String Loaded (Length: {connStr.Length})");
Console.WriteLine("------------------------------------------");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVer = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(connStr, serverVer, mysqlOptions => 
    {
        mysqlOptions.EnableRetryOnFailure(2, TimeSpan.FromSeconds(5), null);
    });
});

// 3. DI
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
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000", "http://localhost:5173" };
builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p => p.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// --- Debug Endpoints ---
app.MapGet("/health", () => $"LifeHub Backend ALIVE [Version V2] Time: {DateTime.Now}");
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (V2 Recovery)");
    c.RoutePrefix = "swagger";
});

// --- Non-Blocking Migration ---
Task.Run(() => {
    using (var scope = app.Services.CreateScope())
    {
        try 
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[V2-ASYNC] Starting migration...");
            db.Database.Migrate();
            Console.WriteLine("[V2-ASYNC] Migration SUCCESS.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[V2-ASYNC] Migration FAILED: {ex.Message}");
        }
    }
});

// --- Pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("[V2-DEPLOY] Server running. Listening on PORT detected by environment.");
app.Run();
