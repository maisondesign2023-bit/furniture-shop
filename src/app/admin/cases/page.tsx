import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CaseStudy } from "@/types";

export default async function AdminCasesPage() {
  const supabase = createServerSupabase();
  const { data: cases } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order");

  const statusLabel: Record<string, string> = { draft: "草稿", published: "已發布" };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-walnut">案例管理</h1>
        <Link
          href="/admin/cases/new"
          className="bg-walnut px-5 py-2.5 font-body text-sm text-surface hover:bg-brass"
        >
          + 新增案例
        </Link>
      </div>

      <table className="mt-8 w-full font-body text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs text-muted">
            <th className="py-3">案例名稱</th>
            <th>狀態</th>
            <th>排序</th>
          </tr>
        </thead>
        <tbody>
          {(cases as CaseStudy[] | null)?.map((c) => (
            <tr key={c.id} className="border-b border-line">
              <td className="py-3">{c.title}</td>
              <td>{statusLabel[c.status]}</td>
              <td className="font-mono">{c.sort_order}</td>
            </tr>
          ))}
          {(!cases || cases.length === 0) && (
            <tr>
              <td colSpan={3} className="py-6 text-muted">尚未新增案例。</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
