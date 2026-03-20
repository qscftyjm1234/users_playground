# 前後端 Enum 同步與資料適配器 (Adapter)

在實際開發中，後端傳回的資料格式常常與前端預期的不一致（例如後端傳 `"status": "0"`，但前端需要顯示「在職」）。本課程將介紹如何使用 **Adapter Pattern** 來優化此流程。

## 📚 課程大綱

1.  [為什麼需要轉接層？](#1-為什麼需要轉接層)
2.  [中心化定義 (Constants)](#2-中心化定義)
3.  [適配器實作 (Adapter)](#3-適配器實作-adapter)
4.  [防禦性編程](#4-防禦性編程)

---

## 1. 為什麼需要轉接層？

如果我們直接在畫面組件 (Component) 裡寫死：
```javascript
{ emp.status === 1 ? '在職' : '離職' }
```
當後端改為傳字串 `"Active"` 時，全站的所有頁面都要跟著改。轉接層的作用就是 **「把髒活累活都擋在外面」**，讓組件看到的永遠是乾淨的配置。

> [!TIP]
> **💡 Vue 開發者筆記：計算屬性 vs 適配器**
> *   在 Vue 中，你可能會習慣用 **`computed`** 來處理這種轉換邏輯。
> *   在 React 中，我們通常直接在組件內呼叫一個純函數 (Pure Function) 或者使用 `useMemo`。但在大型架構下，像本專案這樣建立一個獨立的 `utils/statusAdapter.js` 是更專業的做法，因為它可以在非組件環境（如 API 攔截器）中被複用。

## 2. 中心化定義

我們在 `src/constants/employeeEnums.js` 建立與後端一致的定義。
```javascript
export const EmployeeStatus = {
  ACTIVE: 1,
  // ...
  MAP: { 'Active': 1, '0': 1 } // 雙向映射與容錯
}
```

## 3. 適配器實作 (Adapter)

在 `src/utils/statusAdapter.js` 中，我們寫一個聰明的函式來處理資料。
它會檢查傳入的是數字還是字串，並找到正確的 UI 指令（如 `variant='success'`）。

## 4. 防禦性編程

永遠假設後端可能會傳回奇怪的東西：
```javascript
return configs[statusId] || { label: `未知 (${rawStatus})`, variant: 'neutral' };
```
這樣即便系統出錯，畫面也不會崩潰，且開發者能一眼看出是哪個狀態碼沒定義。

---

> [!TIP]
> 這種架構在大型專案中非常重要。當後端決定更換資料庫或修改 API 格式時，前端開發者只需要修改一個 `Adapter` 檔案即可，大大降低了維護成本。
