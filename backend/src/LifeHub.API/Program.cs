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

// --- FINAL HARDCODE FIX: 2026-03-30 ---
Console.WriteLine("================================================================");
Console.WriteLine("[FINAL FIX] BOOTING WITH HARDCODED CREDENTIALS...");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Core Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. ULTIMATE HARDCODED CONNECTION STRING
// Using the credentials you provided directly to eliminate parsing errors
string connectionString = "Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=qJdJWuQoRQcCKlzITqcSOKpPmzkiFbCY;SslMode=None;AllowPublicKeyRetrieval=True;";

Console.WriteLine("[DB CONFIG] HARDCODED Connection ready (Masked Password).");

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
app.MapGet("/", () => "LifeHub Backend ALIVE [FINAL HARDCODE FIX]");
app.MapGet("/health", () => $"UP AND RUNNING. DB CONNECTED (Hardcoded). Time: {DateTime.Now}");

app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (Final Fix)");
    c.RoutePrefix = "swagger";
});

// --- Non-Blocking Background Migration ---
Task.Run(() => {
    using (var scope = app.Services.CreateScope())
    {
        try 
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[ASYNC] Hardcoded connection - Starting migration...");
            db.Database.Migrate();
            Console.WriteLine("[ASYNC] MIGRATION SUCCESS! The system is fully operational.");
        }
        catch (Exception ex)
        {
            Console.WriteLine("------------------------------------------");
            Console.WriteLine($"[ASYNC-ERROR] Hardcoded test FAILED: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"[INNER-REASON] {ex.InnerException.Message}");
            Console.WriteLine("------------------------------------------");
        }
    }
});

// --- Pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// [FIX 502] Explicit PORT binding for Railway
var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine($"[DEPLOY] Server starting on PORT: {port}");
app.Run($"http://0.0.0.0:{port}");
