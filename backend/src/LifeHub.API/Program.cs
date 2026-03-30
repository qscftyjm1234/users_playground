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

// --- STEP-BY-STEP RECOVERY: PHASE 1 (NO DATABASE) ---
Console.WriteLine("================================================================");
Console.WriteLine("[PHASE 1] STARTING MINIMAL WEB SERVER...");
Console.WriteLine("================================================================");

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Database Configuration - TEMPORARILY DISABLED
/*
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVer = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql("Server=none;", serverVer);
});
*/

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
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "*" };
builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p => p.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// --- TEST ENDPOINTS ---
app.MapGet("/ping", () => "PONG - Server is ALIVE!");
app.MapGet("/health", () => $"LifeHub Core [Phase 1] Time: {DateTime.Now}");

app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LifeHub API (Phase 1)");
    c.RoutePrefix = "swagger";
});

// --- Auto Migration - DISABLED ---
/*
Task.Run(() => {
    Console.WriteLine("[INFO] Migration skipped in Phase 1.");
});
*/

// --- Pipeline ---
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("[PHASE 1] Listening on PORT...");
app.Run();
