# 後端架構：Domain 與 DTO 的映射關係

在 .NET 專案中，你會發現資料會在不同的層級之間「變身」。理解這層關係，就能掌握後端開發的精髓。

## 📚 課程大綱

1.  [什麼是 Domain (實體)？](#1-什麼是-domain-實體)
2.  [什麼是 DTO (資料傳輸物件)？](#2-什麼是-dto-資料傳輸物件)
3.  [如何對照 (Mapping)？](#3-如何對照-mapping)
4.  [實務建議：AutoMapper](#4-實務建議-automapper)

---

## 1. 什麼是 Domain (實體)？

*   **定義**：直接對應資料庫表格的類別。
*   **檔案**：`EmployeeManagement.Domain/Entities/Entities.cs`
*   **特性**：包含系統最核心的邏輯，通常包含敏感資料（如密碼）或複雜的自動生成 ID。

## 2. 什麼是 DTO (資料傳輸物件)？

*   **定義**：專門為 API 輸出的「包裝紙」。
*   **檔案**：`EmployeeManagement.Application/DTOs/EmployeeDto.cs`
*   **目的**：
    *   **隱藏資料**：不回傳敏感資訊。
    *   **方便前端**：將後端的 Enum 轉成前端好讀的文字或數值（例如你剛剛加的 `StatusValue`）。

## 3. 如何對照 (Mapping)？

你剛才在 `EmployeesController.cs` 做的就是 **「手動對照 (Manual Mapping)」**。

```csharp
// 這就是對照的地方
var result = employees.Select(e => new EmployeeDto
{
    Id = e.Id,                 // 來自 Domain
    Status = (int)e.Status,    // 來自 Domain 並轉型給 DTO
    // ...
});
```

這就像是一張「對帳單」，左邊是資料庫的東西，右邊是你要給前端的東西。只要你在 `new EmployeeDto` 裡面手動指定，它們就「對起來」了。

## 4. 實務建議：AutoMapper

當你的系統變大，有幾百個欄位要對照時，手動寫 `new Dto { ... }` 會非常痛苦。
*   **解決方案**：在商業開發中，我們會使用一個叫 **AutoMapper** 的套件。
*   **效果**：只要欄位名稱一樣，它就會自動幫你「連連看」，你只需要針對特殊的欄位（如 Enum 轉字串）寫規則就好。

---

> [!IMPORTANT]
> **💡 小總結**
> 修改 DTO 欄位（外皮） + 修改 Controller 映射邏輯（連連看） = 前端拿到的資料變了。
> 這樣完全不需要動到資料庫結構 (Domain)，是非常健康的架構設計。
