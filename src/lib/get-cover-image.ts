// 圖片的顯示順序（例如商品卡片、案例卡片的主圖）一律要用 sort_order 排序後再取第一張，
// 不能直接信任資料庫回傳的順序（Supabase 巢狀關聯的順序不保證跟 sort_order 一致）。
export function getCoverImage(
  images?: { url: string; sort_order: number }[] | null
): string | undefined {
  if (!images || images.length === 0) return undefined;
  return images.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
}
