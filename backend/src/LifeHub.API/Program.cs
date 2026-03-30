using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Collections;
using LifeHub.Infrastructure.Data;
using LifeHub.Application.Interfaces;
using LifeHub.Infrastructure.Repositories;
using LifeHub.Infrastructure.Authentication;
using LifeHub.Infrastructure.Services;
using LifeHub.API.Middleware;

// --- PHASE 9: ENVIRONMENT DETECTOR ---
Console.WriteLine("================================================================");
Console.WriteLine("[PHASE 9] DETECTING ALL RAILWAY VARIABLES...");
Console.WriteLine("================================================================");

// 掃描所有系統變數，找出真相
foreach (DictionaryEntry de in Environment.GetEnvironmentVariables())
{
    string key = de.Key.ToString() ?? "";
    string val = de.Value?.ToString() ?? "";
    
    if (key.Contains("MYSQL") || key.Contains("RAILWAY") || key.Contains("PORT") || key.Contains("DATABASE"))
    {
        // 遮蔽密碼，其餘印出
        string displayVal = val;
        if (key.Contains("PASS") || key.Contains("URL") || key.Contains("CONNECTION"))
        {
            displayVal = val.Length > 10 ? val.Substring(0, 5) + "..." : "***";
        }
        Console.WriteLine($"[V9-DETECT] Key: {key} | Value: {displayVal}");
    }
}

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 連線零件組裝 (V9)
var h = Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_DOMAIN") ?? Environment.GetEnvironmentVariable("MYSQLHOST") ?? "mysql.railway.internal";
var p = Environment.GetEnvironmentVariable("RAILWAY_TCP_PROXY_PORT") ?? Environment.GetEnvironmentVariable("MYSQLPORT") ?? "3306";
var u = Environment.GetEnvironmentVariable("MYSQLUSER") ?? "root";
var pw = Environment.GetEnvironmentVariable("MYSQL_ROOT_PASSWORD") ?? Environment.GetEnvironmentVariable("MYSQLPASSWORD") ?? "qJdJWuQoRQcCKlzITqcSOKpPmzkiFbCY";
var d = Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? "railway";

string conn = $"Server={h};Port={p};Database={d};User={u};Password={pw};SslMode=Preferred;AllowPublicKeyRetrieval=True;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVer = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(conn, serverVer, o => o.EnableRetryOnFailure(3));
});

// DI & Auth (Condensed for clarity)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opt => {
    opt.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"], ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});
builder.Services.AddCors(o => o.AddPolicy("AllowRest", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.MapGet("/", () => "LifeHub Backend ALIVE [V9 - DETECTOR]");
app.MapGet("/health", () => $"V9_OK | H={h} | P={p}");

app.UseSwagger();
app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "V9"); c.RoutePrefix = "swagger"; });

// MIGRATION
Task.Run(() => {
    using (var scope = app.Services.CreateScope()) {
        try {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Console.WriteLine("[V9-INFO] Migration test starting...");
            dbContext.Database.Migrate();
            Console.WriteLine("[V9-INFO] SUCCESS!");
        } catch (Exception ex) {
            Console.WriteLine($"[V9-ERR] {ex.Message} | Inner: {ex.InnerException?.Message}");
        }
    }
});

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowRest");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var portNum = Environment.GetEnvironmentVariable("PORT") ?? "80";
app.Run($"http://0.0.0.0:{portNum}");
