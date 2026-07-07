import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// 一般伺服器端使用（尊重 RLS，依登入使用者權限）
export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // 在純讀取頁面（Server Component）呼叫時會被 Next.js 擋下，
            // 這是正常現象，session 仍會在下一次請求時正確更新，可以安全忽略。
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // 同上，可以安全忽略。
          }
        },
      },
    }
  );
}

// 管理權限使用（略過 RLS，僅限後台 API route 使用，絕不可暴露到前端）
export function createAdminSupabase() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
