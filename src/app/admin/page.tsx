import { createServerSupabase } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = createServerSupabase();
  const [{ count: productCount }, { count: orderCount }, { count: memberCount }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "商品總數", value: productCount ?? 0 },
    { label: "訂單總數", value: orderCount ?? 0 },
    { label: "會員總數", value: memberCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">總覽</h1>
      <div className="mt-8 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-line p-6">
            <p className="font-mono text-xs text-muted">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-walnut">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
