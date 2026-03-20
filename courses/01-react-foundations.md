# React Frontend 實戰：員工管理系統詳解

歡迎來到這堂針對 **EMS (Employee Management System)** 前端開發的詳解課程。本課程將拆解專案中使用的核心技術，讓你理解每一行程式碼背後的邏輯。

## 📚 課程大綱

1.  [Vite 專案架構](#1-vite-專案架構)
2.  [組件化開發與原子化設計](#2-組件化開發與原子化設計-atomic-design)
3.  [狀態 (State) 與 生命週期 (Effect)](#3-狀態-state-與-生命週期-effect)
4.  [API 串接 (Axios)](#4-api-串接-axios)
5.  [Tailwind CSS 介面美學](#5-tailwind-css-介面美學)

---

## 1. Vite 專案架構

在本專案中，我們使用的是 **Vite** 而不是傳統的 Create React App (CRA)。
*   **為什麼？** Vite 啟動速度極快，開發體驗更好。
*   **關鍵檔案**：
    *   `vite.config.js`：Vite 的設定檔。
    *   `src/index.jsx`：程式的入口點。

> [!TIP]
> **💡 Vue 開發者筆記：專案結構**
> *   React 沒有 `.vue` 單一檔案組件 (SFC)。我們使用 `.jsx`，這在本質上就是 JavaScript。
> *   Vite 的設定方式與 Vue Vite 專案幾乎一模一樣。

## 2. 組件化開發與原子化設計 (Atomic Design)

為了讓 UI 更容易重複使用且邏輯更清晰，我們將 UI 組件與業務邏輯進行了分層：

*   **UI 介面層 (`src/components/uiInterface/`)**：存放「純 UI」組件，例如 `StatusChip.jsx`。它們不負責抓資料，只負責根據傳入的 `props` 進行渲染。
*   **頁面層 (`src/pages/`)**：負責「抓取資料」與「版面配置」，並組合上述的 UI 組件。

### `Badge` UI 介面組件 (純 UI)
```javascript
// 位於 src/components/uiInterface/Badge.jsx
const Badge = ({ variant, children }) => { ... }
```
*   **功能**：通用的圓角標籤，只負責外觀（成功的綠色、警告的黃色等）。
*   **優點**：它完全不知道什麼是「員工狀態」，因此你可以把它用在任何需要標籤的地方（例如：訂單狀態、權限等級）。
*   **分層邏輯**：具體的「員工狀態 1 = 綠色」這種對應關係，應該寫在 `EmployeeList.jsx` 這種業務頁面中。

> [!TIP]
> **💡 Vue 開發者筆記：組件定義**
> *   在 Vue 中，你習慣在 `<template>` 寫 HTML。在 React 中，HTML 直接寫在函式的 `return` 裡（這就是 JSX）。
> *   React 組件本質上就是一個「會回傳 HTML 的 JavaScript 函式」。

## 3. 狀態 (State) 與 生命週期 (Effect)

*   這是用來處理「副作用」的地方（例如：去後端要資料）。

> [!TIP]
> **💡 Vue 開發者筆記：狀態管理**
> *   **`useState`** 對應 Vue 的 **`ref()`** 或 **`reactive()`**。差別在於 React 的狀態是「不可變的 (Immutable)」，你必須呼叫 `set` 函式來更新，而不能直接修改變數。
> *   **`useEffect`** 對應 Vue 的 **`onMounted`** (空陣列時) 或 **`watch`** (有依賴項時)。

## 4. API 串接 (Axios)

我們不直接在組件裡寫 `fetch`，而是統一封裝在 `src/api`。
```javascript
const response = await employeeApi.getAll();
setEmployees(response.data);
```
*   使用 `async/await` 語法，讓非同步程式碼讀起來像同步一樣直觀。

## 5. Tailwind CSS 介面美學

專案中使用了大量的實用類別 (Utility Classes)：
*   `hover:scale-110`：滑鼠移上去時放大。
*   `transition-all`：平滑的動畫效果。
*   `bg-gradient-to-br`：漂亮的背景漸層。

---

> [!TIP]
> 練習建議：試著在 `EmployeeList.jsx` 中修改 `StatusChip` 的顏色，看看畫面會如何變化！
