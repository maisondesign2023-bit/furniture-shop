import { createClient } from "@supabase/supabase-js";

// 給「不需要知道使用者是誰」的公開內容使用（商品、分類、部落格、案例等）。
// 刻意不讀取 cookies，這樣 Next.js 才能把使用到它的頁面視為可以快取的靜態頁面，
// 大幅降低伺服器運算量與 Cloudflare 的 CPU 使用時間。
export function createPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
