# Project Rules & Context

## 1. 專案背景 (Project Context)
這是一個 **React 學習遊樂場 (Playground)**，專為熟悉 Vue.js 的開發者設計。
目標是透過對比 Vue 的概念（如 `v-if`, `v-for`, lifecycle hooks）來快速學習 React 的核心觀念。

## 2. 技術堆疊 (Tech Stack)
- **Build Tool**: Vite
- **Framework**: React 19
- **Language**: JavaScript (ES6+)
- **Styling**: Generic CSS / Inline Styles (目前無特定 CSS 框架)

## 3. 程式碼規範 (Coding Standards)

### 組件撰寫 (Components)
*   **必須使用 Functional Components**。
*   **必須使用 Hooks** (`useState`, `useEffect`)，禁止使用 Class Components。
*   **檔案命名**：使用 PascalCase，例如 `Lesson1_Component.jsx`。
*   **檔案副檔名**：統一使用 `.jsx`。

### 學習輔助 (Educational Aids)
*   **Vue 對照註解**：在關鍵 React 語法旁，儘量加上 Vue 的對應寫法註解。
    ```jsx
    // React
    useEffect(() => {}, []);
    // Vue: onMounted(() => {})
    ```
*   **繁體中文註解**：所有教學註解請使用繁體中文。

### 狀態管理 (State Management)
*   本地狀態優先使用 `useState`。
*   盡量保持狀態結構簡單，方便學習。

## 4. 檔案結構 (File Structure)
*   `src/components/`：放置各個課程的範例組件。
*   `docs/`：放置學習路徑與說明文件。

## 5. 指令 (Commands)
*   `npm run dev`：啟動開發伺服器。
*   `npm install`：安裝依賴。
