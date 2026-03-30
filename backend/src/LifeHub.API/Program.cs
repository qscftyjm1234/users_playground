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

// --- STEP-BY-STEP RECOVERY: PHASE 2B (FIX PORT & RESTORE CORE) ---
Console.WriteLine("================================================================");
Console.WriteLine("[PHASE 2B] STARTING RECOVERY SERVER WITH FINAL PORT FIX...");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Database Configuration - ROBUST MODE
var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_URL") 
           ?? Environment.GetEnvironmentVariable("MYSQL_PRIVATE_URL")
           ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

string? connectionString = null;
if (!string.IsNullOrEmpty(rawUrl) && rawUrl.StartsWith("mysql://"))
{
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
    } catch { }
}
else if (!string.IsNullOrEmpty(rawUrl)) { connectionString = rawUrl; }

// Use dummy if null to avoid specification error
if (string.IsNullOrEmpty(connectionString))
{
    connectionString = "Server=none;Database=none;User=none;Password=none;";
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

// 5. CORS
builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// --- TEST ENDPOINTS ---
app.MapGet("/", () => "LifeHub Backend ALIVE [Phase 2B - Final Fix]");
app.MapGet("/health", () => $"LifeHub Core [Phase 2B] ALIVE. Time: {DateTime.Now}");

app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (Phase 2B)");
    c.RoutePrefix = "swagger";
});

// --- Non-Blocking Background Migration ---
Task.Run(() => {
    using (var scope = app.Services.CreateScope())
    {
        try 
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[ASYNC-INFO] Starting Migration...");
            db.Database.Migrate();
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

// [FIX 502/HEALTH-CHECK] Explicit PORT binding for Railway
var currentPort = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine($"[DEPLOY] Final check - Server starting on PORT: {currentPort}");
app.Run($"http://0.0.0.0:{currentPort}");
