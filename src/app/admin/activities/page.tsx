import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Activity } from "@/types";

export const runtime = "edge";

export default async function AdminActivitiesPage() {
  const supabase = createServerSupabase();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, string> = {
    draft: "草稿",
    published: "已發布",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-walnut">最新活動管理</h1>
        <Link
          href="/admin/activities/new"
          className="bg-walnut px-5 py-2.5 font-body text-sm text-surface hover:bg-brass"
        >
          + 新增活動
        </Link>
      </div>

      <table className="mt-8 w-full font-body text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs text-muted">
            <th className="py-3">標題</th>
            <th>狀態</th>
            <th>建立時間</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(activities as Activity[] | null)?.map((a) => (
            <tr key={a.id} className="border-b border-line">
              <td className="py-3">{a.title}</td>
              <td>{statusLabel[a.status]}</td>
              <td className="font-mono text-xs text-muted">
                {new Date(a.created_at).toLocaleDateString("zh-TW")}
              </td>
              <td>
                <Link href={`/admin/activities/${a.id}`} className="font-mono text-xs text-brass hover:underline">
                  編輯
                </Link>
              </td>
            </tr>
          ))}
          {(!activities || activities.length === 0) && (
            <tr>
              <td colSpan={4} className="py-6 text-muted">尚未新增活動。</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
