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

// --- PHASE 8: THE TRUTH REVEALER ---
Console.WriteLine("================================================================");
Console.WriteLine("[PHASE 8] DIAGNOSING STARTUP...");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Build Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. CONNECTION LOGIC (V8)
string finalConn = string.Empty;

// Try individual pieces first (The Railway Way)
var r_host = Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_DOMAIN") ?? Environment.GetEnvironmentVariable("MYSQLHOST") ?? "mysql.railway.internal";
var r_port = Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_PORT") ?? Environment.GetEnvironmentVariable("MYSQLPORT") ?? "3306";
var r_user = Environment.GetEnvironmentVariable("MYSQLUSER") ?? "root";
var r_pass = Environment.GetEnvironmentVariable("MYSQL_ROOT_PASSWORD") ?? Environment.GetEnvironmentVariable("MYSQLPASSWORD") ?? "qJdJWuQoRQcCKlzITqcSOKpPmzkiFbCY";
var r_db = Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? "railway";

finalConn = $"Server={r_host};Port={r_port};Database={r_db};User={r_user};Password={r_pass};SslMode=Preferred;AllowPublicKeyRetrieval=True;";

Console.WriteLine($"[V8-DIAG] Using Host: {r_host}");
Console.WriteLine($"[V8-DIAG] Using Database: {r_db}");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVer = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(finalConn, serverVer, mysqlOptions => 
    {
        mysqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
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

builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// --- V8 ENDPOINTS ---
app.MapGet("/", () => "LifeHub Backend ALIVE [V8 - TRUTH REVEALER]");
app.MapGet("/health", () => $"V8_OK | Host={r_host} | DB={r_db}");

app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (V8)");
    c.RoutePrefix = "swagger";
});

// --- SAFE BACKGROUND MIGRATION ---
Task.Run(() => {
    using (var scope = app.Services.CreateScope())
    {
        try {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[V8-INFO] Background Migration START...");
            db.Database.Migrate();
            Console.WriteLine("[V8-INFO] Background Migration SUCCESS!");
        } catch (Exception ex) {
            Console.WriteLine("--------------------------------------------------");
            Console.WriteLine($"[V8-ERROR] Migration Failed: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"[V8-INNER] {ex.InnerException.Message}");
            Console.WriteLine("--------------------------------------------------");
        }
    }
});

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var portNumber = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine($"[DEPLOY] V8 listening on: {portNumber}");
app.Run($"http://0.0.0.0:{portNumber}");
