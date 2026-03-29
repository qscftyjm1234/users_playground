---
description: 實作新功能的標準開發流程 (Standard Feature Development Flow)
---

# 🚀 功能開發標準作業程序 (SOP)

當需要新增或修改功能（如：修改姓名、補全資料庫欄位）時，必須依序跑完以下三個檢查點：

## 1. 前端畫面檢查 (Frontend UI Check)
- [ ] 確認目標頁面的 React 元件已建立。
- [ ] 輸入框 (Inputs) 與 按鈕 (Buttons) 是否與 state 綁定。
- [ ] 是否有適當的載入中 (Loading) 與 成功/失敗 提示。

## 2. 後端 API 與 DB 檢查 (Backend & DB Check)
- [ ] **DB 欄位**：實體類別 (Entity) 是否有對應欄位？若無，需執行 `migrations add`。
- [ ] **DTO 模型**：傳輸用的 Request/Response DTO 是否已定義。
- [ ] **CRUD API**：Controller 內的實作是否完整（尤其是安全性與 Try-Catch）。

## 3. Docker 環境同步與驗證 (Docker Sync & Verify)
// turbo-all
- [ ] **重新編譯**：執行 `docker-compose up -d --build` 確保代碼生效。
- [ ] **資料庫更新**：若有改 DB 欄位，檢查 Log 是否成功執行 Migration。
- [ ] **整合測試**：從前端實際點擊，並監控 `docker-compose logs -f` 查看輸出。

## 4. 瀏覽器自動驗證 (Browser Verification)
- [ ] **開啟頁面**：使用 `open_browser_url` 前往目標路徑。
- [ ] **Console 檢查**：檢查是否有標紅的錯誤（像是 401 Unauthorized 或 404）。
- [ ] **互動測試**：簡單操作功能，確保 UI 反饋正常，無閃退或報錯彈窗。
