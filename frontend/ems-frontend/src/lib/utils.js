import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合併 Tailwind CSS 類名的工具函數
 * 結合了 clsx (條件判斷) 與 twMerge (防止衝突)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
