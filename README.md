# Employee Management System (EMS)

這是一個基於 **Clean Architecture** 與 **Fullstack CRUD** 實踐的員工管理系統。本專案分為後端 (ASP.NET Web API) 與前端 (React + MUI) 兩部分，並使用 Docker 管理 MySQL 資料庫。

## 🚀 快速開始 (Getting Started)

請依照以下三個步驟啟動完整系統。

### 步驟 1: 啟動資料庫 (Docker)

本專案使用 MySQL 8.0。請確保您已安裝 Docker 並在根目錄執行：

```powershell
docker-compose up -d
```

_這會啟動一個名為 `employee_mysql` 的容器，並建立 `employee_db` 資料庫。_

#### 進入資料庫容器 (Accessing Database)

若要直接進入資料庫下指令，請執行：

```powershell
docker exec -it employee_mysql mysql -u root -proot
```

- **指令分解**：
  - `exec`：告訴 Docker 「我要在容器內執行一個指令」。
  - `-it`：讓你進入「互動模式」並開啟一個「虛擬終端機」，這樣你才能在裡面輸入 SQL。
  - `employee_mysql`：目標容器的名稱。
  - `mysql -u root -proot`：要在容器內真正執行的登入指令。
- **切換資料庫**：`use employee_db;`
- **查看員工資料**：`select * from Employees;`
- **退出**：輸入 `exit;`

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

## 💡 指令詳解 (Command Explanations)

這裡解釋了專案中常用的 .NET 指令及其意義：

### 1. `dotnet restore`

- **作用**：依照專案檔（`.csproj`）的清單，從 NuGet 下載缺少的套件。
- **單字含義**：**Restore** 意為「還原/補回」。因為為了節省空間，專案本身不存套件實體檔案，需透過此指令將它們「還原」到開發環境中。
- **備註**：現代的 `dotnet build` 或 `run` 通常會自動執行此步驟。

### 2. `dotnet run --project <路徑>`

- **作用**：啟動並執行指定的專案。
- **`--project` (或 `-p`)**：因為本專案採用多專案架構（Clean Architecture），我們需要明確指定「啟動點」，也就是 API 專案的路徑。
- **範例**：`dotnet run --project src\EmployeeManagement.API\...` 就是告訴系統：「我要啟動這個 API 服務」。

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

- **現象**：出現 `ports are not available... bind: Only one usage of each socket address is normally permitted.`
- **原因**：Windows 本地已安裝 MySQL 並佔用了 3306 埠。
- **解決**：修改 `docker-compose.yml` 將埠位改為 `3307:3306`，並同步修改 `appsettings.json` 的連線字串。

### 2. .NET 版本不相容 (NETSDK1045)

- **現象**：出現 `error NETSDK1045: 目的 Framework 'net8.0' 需要 .NET SDK 的 '8.0.100' 版本或更高版本。`
- **原因**：電腦只安裝了 .NET 7 SDK。
- **解決**：將所有 `.csproj` 的 `<TargetFramework>` 改為 `net7.0`，並確保 NuGet 套件版本也降轉為 `7.x`。

### 3. 指定專案或方案檔錯誤 (MSB1003)

- **現象**：執行 `dotnet restore` 出現 `目前工作目錄未包含專案或方案檔。`
- **原因**：.NET 在根目錄找不到 `.sln` (地圖檔)。
- **解決**：執行以下指令重新產生「地圖」：
  ```powershell
  dotnet new sln -n EmployeeManagement
  dotnet sln add (ls src/**/*.csproj)
  ```

### 5.路徑中包含特殊字元 (#) - **重要**

- **現象**：Vite 或 CRA 報錯 `The project root contains the "#" character` 或 `Can't resolve...`。
- **原因**：Node.js 在處理包含 `#` 的路徑時會將其誤認為 URI Fragment，導致模組讀取失敗。
- **解決**：請將父資料夾 `c#_playground` 重新命名為不含特殊字元的名稱（例如 `ems_project` 或 `csharp_playground`）。

---

## 🎓 學習課程 (Courses)

本專案附帶了針對具體技術實作的詳解課程，歡迎進一步學習：

- **React 前端實戰**：[01-React 基礎與專案應用](courses/01-react-foundations.md) (針對本包前端詳解)
- **Enum 同步與資料適配**：[02-後端 Enum 同步處理](courses/02-data-adapter-pattern.md) (解決前後端資料格式不一致)
- **後端架構與 DTO 映射**：[03-後端 DTO 映射原理](courses/03-backend-architecture.md) (理解 Domain 與 DTO 的分離)

---

## 📝 後續建議開發 (Next Steps)

1. **Migrations**: 執行 `dotnet ef migrations add InitialCreate` 來管理資料庫版本。
2. **Auth Page**: 實作完整的登入與註冊介面。
3. **Advanced Features**: 加入分頁 (Pagination) 與搜尋 (Search) 功能。

---

## 📂 後端資料夾分層邏輯 (白話版)

專案切成這四大塊，是為了讓「存資料的」、「寫邏輯的」跟「連資料庫的」分開，之後好改也好找。

1.  **Domain (定義資料庫資料)**：定義「資料庫裡的資料長怎樣」。
2.  **Application (功能藍圖與包裝)**：定義「功能的藍圖（清單）」和「最後噴給前端的資料格式」。
3.  **Infrastructure (連線與查詢)**：處理「連資料庫」和「撈資料」的體力活。
4.  **API (網址路由)**：處理「網址路徑」和「接收請求」。

### 1. Domain (定義資料庫資料)
*   **路徑**：`/src/EmployeeManagement.Domain`
*   **Entities (檔案：Entities.cs)**：**「資料庫的影子」**。資料庫有什麼欄位，這裡就寫什麼屬性（如 `public int Id`）。這不是寫邏輯的地方，只是為了讓 C# 程式碼跟資料庫對齊。
*   **Enums (檔案：Enums.cs)**：**「狀態對照表」**。資料庫存 `1, 2, 3`，這裡定義它代表 `Active, Retired`，讓寫程式時不用死背數字。

### 2. Application (功能規格與包裝)
*   **路徑**：`/src/EmployeeManagement.Application`
*   **DTOs (檔案：EmployeeDto.cs)**：**「給前端的資料格式」**。資料庫原始資料可能很髒或有機密，這裡決定最後噴給前端的 JSON 要有哪些欄位。
*   **Interfaces (檔案：IRepositories.cs)**：**「功能清單」**。這裡只寫「可以抓全部人」、「可以抓單人」，但不寫具體怎麼做。先講好有哪些功能可以叫。


### 3. Infrastructure (連線與查詢)
*   **路徑**：`/src/EmployeeManagement.Infrastructure`
*   **Data (檔案：ApplicationDbContext.cs)**：**「資料庫大門」**。就是設定連線的地方，沒這隻檔就連不上 MySQL。
*   **Repositories (檔案：EmployeeRepository.cs)**：**「真的去撈資料庫」**。這裡是整個後端唯一會寫到 `Select`、`Where` 去查資料庫的地方。
*   **Migrations (資料夾)**：**「自動產生的工程紀錄」**。
    *   **他在幹嘛**：你不必寫這裡的程式碼！它是 EF Core 根據你對 `Entities.cs` 的改動，**自動幫你產生的「資料庫更新腳本」**。它確保別人的電腦也能跑出跟你的開發環境一模一樣的表格。


### 4. API (網址與路由)
*   **路徑**：`/src/EmployeeManagement.API`
*   **Controllers (檔案：EmployeesController.cs)**：**「網址對應」**。決定 `/api/employees` 打過來時要做什麼。它不負責查資料，它只負責叫 `Repository` 同事去抓資料，拿回來後塞進 `DTO` 盒子傳回給前端。


---

## 🏷️ 命名潛規則 (看到名字就知道它是誰)

在後端，我們不亂取名，看到結尾就能知道這包資料的「方向」：

1.  **`...Entity` (或沒結尾)**：這是 **「資料庫的影子」**。看到它就知道這是在對齊資料庫欄位用的。
2.  **`...Dto`**：這是 **「噴給前端的資料」**。通常用於查詢結果，代表這是要寄出去外送的「資料盒」。
3.  **`...Request`**：這是 **「前端傳進來的請求」**。通常用於新增或修改，代表這是前端要求我們做事的「內容單」。
4.  **`...Response`**：這是 **「給前端的特殊回覆」**。比如登入成功的結果（包含 Token 型態）。
5.  **`I...` (I 開頭)**：這是 **「功能藍圖 (Interface)」**。看到 `I` 就知道它只是一張功能清單，真正的實作在別處。
6.  **`...Repository`**：這是 **「負責搬貨的苦力」**。看到它就知道這裡面有寫真的去連資料庫的 SQL 或 LINQ 指令。

---

## ⚡ 核心總結：為什麼要用 DbContext + EF Core？

這是後端最關鍵的「翻譯」系統，幫我們省下了 80% 的髒活：

*   **`ApplicationDbContext`**：是與資料庫做連結的 **「唯一出口/入口」**。它負責幫你去下 SQL 並取回你要的資料。
*   **`EF Core`**：這是一個專業的 **「翻譯套件」**。因為有它，我們才能輕鬆用 **C# 的語言** 直接撈資料，而不需要下冗長的 SQL 語法。
*   **結論**：它讓我們能專心在「開發邏輯」，把連線資料庫跟寫 SQL 這類雜事交給套件搞定。


