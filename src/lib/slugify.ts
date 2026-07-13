export function slugify(text: string, fallbackPrefix = "item") {
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || `${fallbackPrefix}-${Date.now()}`;
}
