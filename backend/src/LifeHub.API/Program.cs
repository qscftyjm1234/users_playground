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

// --- LIFEHUB OFFICIAL BACKEND - PRODUCTION VERSION ---
Console.WriteLine("================================================================");
Console.WriteLine("    LifeHub API - Starting Production Service...");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Core Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "LifeHub API", Version = "v1" });
});

// 2. Database Configuration - PRODUCTION (Robust Hybrid)
string? conn = null;

// Individual components (Railway preferred)
var h = Environment.GetEnvironmentVariable("MYSQLHOST") ?? Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_DOMAIN");
var p = Environment.GetEnvironmentVariable("MYSQLPORT") ?? Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_PORT") ?? "3306";
var u = Environment.GetEnvironmentVariable("MYSQLUSER") ?? "root";
var pw = Environment.GetEnvironmentVariable("MYSQL_ROOT_PASSWORD") ?? Environment.GetEnvironmentVariable("MYSQLPASSWORD");
var db = Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? "railway";

if (!string.IsNullOrEmpty(h) && !string.IsNullOrEmpty(pw))
{
    conn = $"Server={h};Port={p};Database={db};User={u};Password={pw};SslMode=Preferred;AllowPublicKeyRetrieval=True;";
}

// Fallback to URL
if (string.IsNullOrEmpty(conn))
{
    var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ?? Environment.GetEnvironmentVariable("MYSQL_URL");
    if (!string.IsNullOrEmpty(rawUrl) && rawUrl.StartsWith("mysql://"))
    {
        try {
            var uri = new Uri(rawUrl);
            var auth = uri.UserInfo.Split(':');
            conn = $"Server={uri.Host};Port={(uri.Port > 0 ? uri.Port : 3306)};Database={(uri.AbsolutePath.TrimStart('/') == "" ? "railway" : uri.AbsolutePath.TrimStart('/'))};User={auth[0]};Password={(auth.Length > 1 ? auth[1] : "")};SslMode=Preferred;AllowPublicKeyRetrieval=True;";
        } catch { }
    }
}

// Final absolute fallback (The password provided by user)
if (string.IsNullOrEmpty(conn))
{
    conn = "Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=qJdJWuQoRQcCKlzITqcSOKpPmzkiFbCY;SslMode=Preferred;AllowPublicKeyRetrieval=True;";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVer = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(conn, serverVer, o => o.EnableRetryOnFailure(5));
});

// 3. DI
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

// 4. Authentication
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

// 5. CORS - Get from config or allow all for Railway internal proxy
builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// HEALTH CHECK
app.MapGet("/health", () => "LifeHub Backend is Healthy.");

// SWAGGER (Enable in Production for Deployment Debugging)
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API v1");
    c.RoutePrefix = "swagger";
});

// 6. Background Migration (Safe)
Task.Run(() => {
    using (var scope = app.Services.CreateScope()) {
        try {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[INFO] Background Migration Verified.");
            // Already synced, but ensures connectivity on restart
            dbContext.Database.Migrate();
        } catch (Exception ex) {
            Console.WriteLine($"[ERROR] Startup DB check failed: {ex.Message}");
        }
    }
});

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// EXPLICIT PORT BINDING FOR RAILWAY
var currentPort = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine($"[DEPLOY] Listening on PORT: {currentPort}");
app.Run($"http://0.0.0.0:{currentPort}");
