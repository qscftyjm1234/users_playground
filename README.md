# Employee Management System (EMS)

這是一個基於 **Clean Architecture** 與 **Fullstack CRUD** 實踐的員工管理系統。本專案分為後端 (ASP.NET Web API) 與前端 (React + MUI) 兩部分，並使用 Docker 管理 MySQL 資料庫。

## 🚀 快速開始 (Getting Started)

請依照以下三個步驟啟動完整系統。

### 步驟 1: 啟動資料庫 (Docker)
本專案使用 MySQL 8.0。請確保您已安裝 Docker 並在根目錄執行：
```powershell
docker-compose up -d
```
*這會啟動一個名為 `employee_mysql` 的容器，並建立 `employee_db` 資料庫。*

### 步驟 2: 啟動後端 API (.NET)
進入 `backend` 資料夾並啟動專案。如果您是從頭開始或遺失了地圖檔，請先執行第 0 步建立 `.sln` (Solution)：

#### (第 0 步) 建立地圖檔 (若已存在則跳過)
```powershell
dotnet new sln -n EmployeeManagement
dotnet sln add (ls src/**/*.csproj)
```

#### 正式啟動
```powershell
cd backend
dotnet restore
dotnet run --project src\EmployeeManagement.API\EmployeeManagement.API.csproj
```
- **API 地址**: `https://localhost:5001` 或 `http://localhost:5000`
- **Swagger 文件**: `https://localhost:5001/swagger` (可在瀏覽器直接測試 API)

### 步驟 3: 啟動前端 UI (React)
開啟另一個終端機，進入 `frontend` 資料夾：
```powershell
cd frontend\employee-management-ui
npm install
npm start
```
- **UI 地址**: `http://localhost:3000`

---

## 🛠 技術架構 (Technology Stack)

### Backend (C# / .NET 8)
- **架構**: Clean Architecture (Domain, Application, Infrastructure, API)
- **ORM**: Entity Framework Core + Pomelo (MySQL)
- **驗證**: FluentValidation
- **安全**: JWT Bearer Authentication
- **日誌與文件**: Swagger (OpenAPI)

### Frontend (React.js)
- **UI 框架**: Material UI (MUI)
- **HTTP Client**: Axios (含 JWT 攔截器)
- **狀態管理**: React Context API
- **圖示**: MUI Icons

### Infrastructure
- **Container**: Docker + Docker Compose
- **Database**: MySQL 8.0

---

## 📂 專案結構 (Directory Structure)
```text
project-root
├── backend
│   ├── EmployeeManagement.sln  # 解決方案
│   └── src
│       ├── EmployeeManagement.Domain      # 核心領域實體
│       ├── EmployeeManagement.Application # 業務邏輯與 DTO
│       ├── EmployeeManagement.Infrastructure # 資料庫與身分驗證
│       └── EmployeeManagement.API        # API 控制器與配置
├── frontend
│   └── employee-management-ui   # React 前端專案
└── docker-compose.yml           # MySQL 基礎設施配置
```

---

---

## ❓ 常見問題排除 (Troubleshooting)

如果您在執行過程中遇到問題，請參考以下解決方案：

### 1. Docker 啟動失敗 (Port 3306 衝突)
*   **現象**：出現 `ports are not available... bind: Only one usage of each socket address is normally permitted.`
*   **原因**：Windows 本地已安裝 MySQL 並佔用了 3306 埠。
*   **解決**：修改 `docker-compose.yml` 將埠位改為 `3307:3306`，並同步修改 `appsettings.json` 的連線字串。

### 2. .NET 版本不相容 (NETSDK1045)
*   **現象**：出現 `error NETSDK1045: 目的 Framework 'net8.0' 需要 .NET SDK 的 '8.0.100' 版本或更高版本。`
*   **原因**：電腦只安裝了 .NET 7 SDK。
*   **解決**：將所有 `.csproj` 的 `<TargetFramework>` 改為 `net7.0`，並確保 NuGet 套件版本也降轉為 `7.x`。

### 3. 指定專案或方案檔錯誤 (MSB1003)
*   **現象**：執行 `dotnet restore` 出現 `目前工作目錄未包含專案或方案檔。`
*   **原因**：.NET 在根目錄找不到 `.sln` (地圖檔)。
*   **解決**：執行以下指令重新產生「地圖」：
    ```powershell
    dotnet new sln -n EmployeeManagement
    dotnet sln add (ls src/**/*.csproj)
    ```

### 5.路徑中包含特殊字元 (#) - **重要**
*   **現象**：Vite 或 CRA 報錯 `The project root contains the "#" character` 或 `Can't resolve...`。
*   **原因**：Node.js 在處理包含 `#` 的路徑時會將其誤認為 URI Fragment，導致模組讀取失敗。
*   **解決**：請將父資料夾 `c#_playground` 重新命名為不含特殊字元的名稱（例如 `ems_project` 或 `csharp_playground`）。

---

## 📝 後續建議開發 (Next Steps)
1. **Migrations**: 執行 `dotnet ef migrations add InitialCreate` 來管理資料庫版本。
2. **Auth Page**: 實作完整的登入與註冊介面。
3. **Advanced Features**: 加入分頁 (Pagination) 與搜尋 (Search) 功能。
