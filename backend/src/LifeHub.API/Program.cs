// 敺垢??銋?嚗???賢?摨?
using Microsoft.AspNetCore.Authentication.JwtBearer;
// ?箔?????澈 EF Core ???撘澈
using Microsoft.EntityFrameworkCore;
// ?箔?撽? JWT Token
using Microsoft.IdentityModel.Tokens;
using System.Text;
using LifeHub.Infrastructure.Data;
using LifeHub.Application.Interfaces;
using LifeHub.Infrastructure.Repositories;
using LifeHub.Infrastructure.Authentication;
using LifeHub.Infrastructure.Services;
using LifeHub.API.Middleware;
// --- ???蔭? (Services Configuration) ---
// 甇方?鞎痊?閮隞嗚???builder.Build() 銋?摰???
// ------------------------------------------

var builder = WebApplication.CreateBuilder(args);


// builder.Services?銝???賣??殷???閬?隞嗥閮脣鋆⊿
// 1. ?箸 API ??? (Add Services)
// 1.1 ??批遣??API ?批?典???, 撟?API 摰?????瘙???賢?
builder.Services.AddControllers();
// 1.2 ? API ?Ｙ揣?嚗 .NET ??Swagger 銋???璅??楚???? Controller嚗?頝臬????詻撘蕃霅舀? Swagger ?????澆???
builder.Services.AddEndpointsApiExplorer();
// 1.3 ? Swagger ?辣???
builder.Services.AddSwaggerGen();

// 2. 鞈?摨恍?蝵?- 雿輻 MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// [DIAGNOSTIC] Log connection info (masked)
if (!string.IsNullOrEmpty(connectionString))
{
    var parts = connectionString.Split(';');
    var sb = new StringBuilder("[DB CONFIG] Attempting to connect to: ");
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
else 
{
    Console.WriteLine("[DB CONFIG] ERROR: Connection string 'DefaultConnection' is null or empty!");
}
// ?餉?鞈?摨恬??迄蝟餌絞雿輻 MySQL ???閮剖?靘遣瑽?ApplicationDbContext??
// AddDbContext ??EF Core (Entity Framework Core) ??隞園策 .NET ?????
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));
    options.UseMySql(connectionString, serverVersion, mysqlOptions => 
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });
});

// 3. 撖虫?憿?餉? (DI 靘陷瘜典)
// ?餉??? (Generic Repository)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
// ?餉??亥??????撟急?
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();

// 4. 頨怠?撽?????(Authentication)
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

// 5. 跨域資源共用 (CORS) - 允許 React 前端存取
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000", "http://localhost:5173" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// --- 蝔?撖阡???---
var app = builder.Build();

// --- 自動資料庫遷移 (Auto Migration) ---
// 這段程式碼會保證 Docker 啟動時，資料庫的表格會自動建立與更新
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        // 這行會自動檢查資料庫，如果沒表就建表，如果少欄位就補欄位
        context.Database.Migrate();
        Console.WriteLine("[INFO] Database Migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Database Migration failed: {ex.Message}");
    }
}

// --- 銝剝?隞嗥恣??(Middleware Pipeline) ---
// 甇方?鞎痊摰儔隢??脖????絲?炎?亦??????虜??嚗?
// ------------------------------------------

// 1. ?璅∪?銝? Swagger ?辣?
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. ?典??啣虜?? (?芸?蝢拐葉?辣) - ????臭蒂頧? JSON ?
app.UseMiddleware<ExceptionHandlingMiddleware>();

// 3. ?? HTTPS
app.UseHttpsRedirection();

// 4. 頝典?閬??
app.UseCors("AllowReactApp");

// 5. ?蝳頂蝯?- ?炎?乩??航狐嚗?瑼Ｘ雿?瘝?甈?
app.UseAuthentication();
app.UseAuthorization();

// 6. 撠頝舐蝟餌絞 - 撠?瘙?瘣曄策撠???Controller
app.MapControllers();

// 7. 甇???瑁?隡箸???
app.Run();

