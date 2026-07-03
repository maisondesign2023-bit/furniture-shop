import { createServerSupabase } from "@/lib/supabase/server";
import type { ContactMessage } from "@/types";

export default async function AdminContactsPage() {
  const supabase = createServerSupabase();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">預約諮詢訊息</h1>
      <p className="mt-2 font-body text-sm text-muted">
        家配師服務頁面的聯絡表單送出後會顯示在這裡。
      </p>

      <div className="mt-8 space-y-4">
        {(messages as ContactMessage[] | null)?.map((m) => (
          <div key={m.id} className="border border-line p-5 font-body text-sm">
            <div className="flex items-center justify-between">
              <p className="font-display text-base not-italic text-walnut">
                {m.first_name} {m.last_name}
              </p>
              <span className="font-mono text-xs text-muted">
                {new Date(m.created_at).toLocaleString("zh-TW")}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-muted">
              {m.email} {m.phone ? `· ${m.phone}` : ""}
            </p>
            <p className="mt-3 whitespace-pre-line">{m.message}</p>
          </div>
        ))}
        {(!messages || messages.length === 0) && (
          <p className="font-body text-sm text-muted">尚無任何預約訊息。</p>
        )}
      </div>
    </div>
  );
}
