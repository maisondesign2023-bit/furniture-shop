export const runtime = "edge";

import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";

export default async function AdminBlogPage() {
  const supabase = createServerSupabase();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, string> = {
    draft: "草稿",
    published: "已發布",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-walnut">部落格管理</h1>
        <Link
          href="/admin/blog/new"
          className="bg-walnut px-5 py-2.5 font-body text-sm text-surface hover:bg-brass"
        >
          + 新增文章
        </Link>
      </div>

      <table className="mt-8 w-full font-body text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs text-muted">
            <th className="py-3">標題</th>
            <th>狀態</th>
            <th>建立時間</th>
          </tr>
        </thead>
        <tbody>
          {(posts as BlogPost[] | null)?.map((p) => (
            <tr key={p.id} className="border-b border-line">
              <td className="py-3">{p.title}</td>
              <td>{statusLabel[p.status]}</td>
              <td className="font-mono text-xs text-muted">
                {new Date(p.created_at).toLocaleDateString("zh-TW")}
              </td>
            </tr>
          ))}
          {(!posts || posts.length === 0) && (
            <tr>
              <td colSpan={3} className="py-6 text-muted">尚未新增文章。</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
