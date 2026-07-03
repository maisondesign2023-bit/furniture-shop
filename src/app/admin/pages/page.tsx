import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SitePage } from "@/types";

export default async function AdminPagesPage() {
  const supabase = createServerSupabase();
  const { data: pages } = await supabase.from("site_pages").select("*").order("title");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">頁面內容管理</h1>
      <p className="mt-2 font-body text-sm text-muted">
        管理「運送與退換貨」「隱私權政策」這類靜態說明頁面的內容。
      </p>

      <div className="mt-8 space-y-3">
        {(pages as SitePage[] | null)?.map((p) => (
          <Link
            key={p.id}
            href={`/admin/pages/${p.slug}`}
            className="flex items-center justify-between border border-line p-4 font-body text-sm hover:border-brass"
          >
            <span>{p.title}</span>
            <span className="font-mono text-xs text-brass">編輯 →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
