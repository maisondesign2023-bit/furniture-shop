import { createServerSupabase } from "@/lib/supabase/server";
import MemberNameEditor from "@/components/admin/MemberNameEditor";

export const runtime = "edge";

export default async function AdminMembersPage() {
  const supabase = createServerSupabase();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">會員管理</h1>

      <table className="mt-8 w-full font-body text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs text-muted">
            <th className="py-3">姓名</th>
            <th>電話</th>
            <th>身分</th>
            <th>加入時間</th>
          </tr>
        </thead>
        <tbody>
          {(members as any[] | null)?.map((m) => (
            <tr key={m.id} className="border-b border-line">
              <td className="py-3">
                <MemberNameEditor memberId={m.id} initialName={m.full_name} />
              </td>
              <td>{m.phone || "—"}</td>
              <td>{m.is_admin ? "管理員" : "會員"}</td>
              <td className="font-mono text-xs text-muted">
                {new Date(m.created_at).toLocaleDateString("zh-TW")}
              </td>
            </tr>
          ))}
          {(!members || members.length === 0) && (
            <tr>
              <td colSpan={4} className="py-6 text-muted">尚無會員資料。</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
