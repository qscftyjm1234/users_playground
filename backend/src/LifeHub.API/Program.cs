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

// --- PHASE 7: AUTOMATIC RAILWAY VARIABLE DETECTION ---
Console.WriteLine("================================================================");
Console.WriteLine("[PHASE 7] AUTO-DETECTING RAILWAY DB CREDENTIALS...");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Core
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. ULTIMATE AUTO-DETECT LOGIC
string? connectionString = null;

// A. Try building from individual pieces (most reliable in Railway internal/external)
var user = Environment.GetEnvironmentVariable("MYSQLUSER") ?? "root";
var pass = Environment.GetEnvironmentVariable("MYSQL_ROOT_PASSWORD") 
        ?? Environment.GetEnvironmentVariable("MYSQLPASSWORD") 
        ?? "qJdJWuQoRQcCKlzITqcSOKpPmzkiFbCY";
var host = Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_DOMAIN") // Public
        ?? Environment.GetEnvironmentVariable("MYSQLHOST")                // Local/Private
        ?? Environment.GetEnvironmentVariable("MYSQL_PRIVATE_DOMAIN");
var port = Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_PORT")   // Public
        ?? Environment.GetEnvironmentVariable("MYSQLPORT")                // Local
        ?? "3306";
var db = Environment.GetEnvironmentVariable("MYSQL_DATABASE") 
      ?? Environment.GetEnvironmentVariable("MYSQLDATABASE") 
      ?? "railway";

if (!string.IsNullOrEmpty(host))
{
    Console.WriteLine($"[AUTO-DETECT] Found pieces! Host={host}; Port={port}; Database={db}");
    connectionString = $"Server={host};Port={port};Database={db};User={user};Password={pass};SslMode=Preferred;AllowPublicKeyRetrieval=True;";
}

// B. Fallback to DATABASE_URL if pieces were missing
if (string.IsNullOrEmpty(connectionString))
{
    var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ?? Environment.GetEnvironmentVariable("MYSQL_URL");
    if (!string.IsNullOrEmpty(rawUrl) && rawUrl.StartsWith("mysql://"))
    {
        try {
            var uri = new Uri(rawUrl);
            var auth = uri.UserInfo.Split(':');
            connectionString = $"Server={uri.Host};Port={(uri.Port > 0 ? uri.Port : 3306)};Database={(uri.AbsolutePath.TrimStart('/') == "" ? "railway" : uri.AbsolutePath.TrimStart('/'))};User={auth[0]};Password={(auth.Length > 1 ? auth[1] : "")};SslMode=Preferred;AllowPublicKeyRetrieval=True;";
            Console.WriteLine("[AUTO-DETECT] Parsed from DATABASE_URL.");
        } catch { }
    }
}

// C. Final Fallback (Hardcoded)
if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("[AUTO-DETECT] WARNING: Using Final Fallback.");
    connectionString = "Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=qJdJWuQoRQcCKlzITqcSOKpPmzkiFbCY;SslMode=Preferred;AllowPublicKeyRetrieval=True;";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVer = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(connectionString, serverVer, mysqlOptions => 
    {
        mysqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
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

builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

app.MapGet("/", () => "LifeHub Backend ALIVE [Phase 7 - AUTO-PIECES]");
app.MapGet("/health", () => $"ALIVE [Phase 7]. Pieces: Host={(!string.IsNullOrEmpty(host))}");

app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (V7)");
    c.RoutePrefix = "swagger";
});

// --- BACKGROUND MIGRATION ---
Task.Run(() => {
    using (var scope = app.Services.CreateScope())
    {
        try 
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[V7-INFO] Migration starting from auto-detected pieces...");
            dbContext.Database.Migrate();
            Console.WriteLine("[V7-INFO] SUCCESS! The system is now operational.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[V7-ERROR] Migration Failed: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"[V7-INNER] Reason: {ex.InnerException.Message}");
        }
    }
});

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
app.Run($"http://0.0.0.0:{port}");
