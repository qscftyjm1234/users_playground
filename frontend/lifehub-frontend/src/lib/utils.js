import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 輔助 Tailwind CSS 類名的工具函數
 * 整合了 clsx (條件判斷) 與 twMerge (衝突處理)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
