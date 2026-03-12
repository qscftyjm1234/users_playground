---
description: 如何快速建立新課程 (How to quickly build a new course)
---

本文件說明如何基於現有的「React 新手教學」模式，快速在平台中建立一套新的課程系統。

### 第一步：定義課程資料來源

在 `src/data/` 目錄下建立新的資料檔案（例如 `dockerLessons.ts`），並參考 `reactLessons.ts` 的 `LessonContent` 介面填入內容。

```typescript
// src/data/dockerLessons.ts
import { LessonContent } from "./reactLessons";

export const dockerLessons: LessonContent[] = [
  {
    id: "1",
    title: "單元標題",
    description: "描述...",
    duration: "10 分鐘",
    type: "類型",
    level: "初階",
    concept: [{ title: "核心觀念", description: "內容..." }],
  },
];
```

### 第二步：建立課程頁面組件

在 `src/pages/courses/` 下建立新課程資料夾，並複製 React 課程的兩個核心頁面作為模板：

1.  建立目錄：`src/pages/courses/[course-id]/`
2.  複製模板：
    - `CoursePage.tsx` (由 `ReactCoursePage.tsx` 修改)
    - `LessonPage.tsx` (由現有的 `LessonPage.tsx` 修改)

**修改重點：**

- 將資料來源 (`reactLessons`) 替換為新建立的資料檔案。
- 修改 Breadcrumb (麵包屑) 中的導航路徑。
- 修改 `useNavigate` 的跳轉路徑。

### 第三步：註冊課程至全系統

1.  **更新中央資料源**：在 `src/data/courses.ts` 中填入課程資訊，並將 `status` 改為 `'enabled'`。
2.  **註冊路由**：在 `src/App.tsx` 中匯入新頁面並設定路徑。

```tsx
// src/App.tsx 範例
<Route path="/courses/docker" element={<DockerCoursePage />} />
<Route path="/courses/docker/lesson/:lessonId" element={<DockerLessonPage />} />
```

### 第四步：自動同步

完成上述步驟後，儀表板與側邊選單將會自動透過 `src/data/courses.ts` 同步顯示新課程。
