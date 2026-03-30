var builder = WebApplication.CreateBuilder(args);

// 極簡服務：確保連 Swagger 都不會報錯
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 極簡路由
app.MapGet("/", () => "LifeHub Backend is ALIVE (Naked Mode)");
app.MapGet("/ping", () => "PONG");
app.MapControllers();

// 診斷日誌
var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
Console.WriteLine("================================================================");
Console.WriteLine($"[START] Naked Server is booting on PORT: {port}");
Console.WriteLine("================================================================");

// 強制綁定 0.0.0.0 並聽從傳入的 PORT
app.Run($"http://0.0.0.0:{port}");
