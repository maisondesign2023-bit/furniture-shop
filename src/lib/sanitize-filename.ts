// 把檔名清理成 Supabase Storage 能接受的格式（只留英數字、減號、底線），
// 避免中文檔名、空白或特殊符號造成「Invalid key」上傳失敗。
export function sanitizeFileName(name: string) {
  const dotIndex = name.lastIndexOf(".");
  const ext = dotIndex > -1 ? name.slice(dotIndex).toLowerCase() : "";
  const base = dotIndex > -1 ? name.slice(0, dotIndex) : name;
  const cleanBase = base
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return `${cleanBase || "file"}${ext}`;
}
