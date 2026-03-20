// 後端啟動之前，獲取的函式庫
using Microsoft.AspNetCore.Authentication.JwtBearer;
// 為了連資料庫 EF Core 提供的函式庫
using Microsoft.EntityFrameworkCore;
// 為了驗證 JWT Token
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EmployeeManagement.Infrastructure.Data;
using EmployeeManagement.Application.Interfaces;
using EmployeeManagement.Infrastructure.Repositories;
using EmployeeManagement.Infrastructure.Authentication;
using EmployeeManagement.Infrastructure.Services;
using EmployeeManagement.API.Middleware;
// --- 服務配置區 (Services Configuration) ---
// 此處負責「登記零件」，在 builder.Build() 之前完成。
// ------------------------------------------

var builder = WebApplication.CreateBuilder(args);


// builder.Services像是一個功能清單，先把要用的零件登記進去裡面
// 1. 基本 API 功能開關 (Add Services)
// 1.1 啟用內建的 API 控制器功能 , 幫 API 安裝「處理請求」的技能包
builder.Services.AddControllers();
// 1.2 啟用 API 探索功能：這是 .NET 與 Swagger 之間的橋樑。它會巡邏所有的 Controller，把路徑、參數、格式通通翻譯成 Swagger 看得懂的格式。
builder.Services.AddEndpointsApiExplorer();
// 1.3 啟用 Swagger 文件生成功能
builder.Services.AddSwaggerGen();

// 2. 資料庫配置 - 使用 MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// 登記資料庫：告訴系統使用 MySQL 連線設定來建構 ApplicationDbContext。
// AddDbContext 是 EF Core (Entity Framework Core) 這個套件送給 .NET 的擴充功能
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 3. 實作類別登記 (DI 依賴注入)
// 登記通用倉儲 (Generic Repository)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
// 登記員工專屬倉儲
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
// 登記日誌與服務相關小幫手
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();

// 4. 身分驗證與安全 (Authentication)
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

// 5. 跨域資源共享 (CORS) - 允許 React 前端連線
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// --- 程式實體化 ---
var app = builder.Build();

// --- 中間件管道 (Middleware Pipeline) ---
// 此處負責定義請求進來時的「海關檢查站」，順序非常重要！
// ------------------------------------------

// 1. 開發模式下的 Swagger 文件頁面
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. 全域異常處理 (自定義中間件) - 攔截所有報錯並轉成 JSON 回傳
app.UseMiddleware<ExceptionHandlingMiddleware>();

// 3. 指向 HTTPS
app.UseHttpsRedirection();

// 4. 跨域規則啟用
app.UseCors("AllowReactApp");

// 5. 門禁系統 - 先檢查你是誰，再檢查你有沒有權限
app.UseAuthentication();
app.UseAuthorization();

// 6. 導航路由系統 - 將請求指派給對應的 Controller
app.MapControllers();

// 7. 正式執行伺服器
app.Run();
