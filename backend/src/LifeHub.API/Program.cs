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

// --- DYNAMIC RECOVERY VERSION: 2026-03-30-V5 ---
Console.WriteLine("================================================================");
Console.WriteLine("[PHASE 5] HYBRID CONNECTION MODE STARTING...");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Core Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Database Configuration - HYBRID LOGIC
string? connectionString = null;

// Try all possible Railway variables
var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_PUBLIC_URL")
           ?? Environment.GetEnvironmentVariable("MYSQL_PRIVATE_URL");

if (!string.IsNullOrEmpty(rawUrl) && rawUrl.StartsWith("mysql://"))
{
    Console.WriteLine("[DB CONFIG] Processing mysql:// URL...");
    try
    {
        var uri = new Uri(rawUrl);
        var auth = uri.UserInfo.Split(':');
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 3306;
        var db = uri.AbsolutePath.TrimStart('/');
        if (string.IsNullOrEmpty(db)) db = "railway";
        
        connectionString = $"Server={host};Port={port};Database={db};User={auth[0]};Password={(auth.Length > 1 ? auth[1] : "")};SslMode=Preferred;AllowPublicKeyRetrieval=True;";
    }
    catch (Exception ex) { Console.WriteLine($"[DB CONFIG] URL Parse error: {ex.Message}"); }
}

// FALLBACK: Hardcoded Internal (if parsing fails or no URL found)
if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("[DB CONFIG] No valid URL found. Using Hardcoded Fallback.");
    connectionString = "Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=qJdJWuQoRQcCKlzITqcSOKpPmzkiFbCY;SslMode=Preferred;AllowPublicKeyRetrieval=True;";
}

Console.WriteLine($"[DB CONFIG] Final Host Check: {connectionString.Split(';')[0]}");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVer = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(connectionString, serverVer, mysqlOptions => 
    {
        mysqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
    });
});

// 3. DI
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

// 4. Auth
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
builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// --- TEST ENDPOINTS ---
app.MapGet("/", () => "LifeHub Backend ALIVE [Phase 5 - Hybrid]");
app.MapGet("/health", () => $"UP AND RUNNING. Host: {connectionString.Split(';')[0]} Time: {DateTime.Now}");

app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (Phase 5)");
    c.RoutePrefix = "swagger";
});

// --- Non-Blocking Background Migration ---
Task.Run(() => {
    using (var scope = app.Services.CreateScope())
    {
        try 
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[ASYNC] Migration starting...");
            db.Database.Migrate();
            Console.WriteLine("[ASYNC] MIGRATION SUCCESS! Everything is ready.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ASYNC-ERROR] Failed: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"[INNER-REASON] {ex.InnerException.Message}");
        }
    }
});

// --- Pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine($"[DEPLOY] Server listening on PORT: {port}");
app.Run($"http://0.0.0.0:{port}");
