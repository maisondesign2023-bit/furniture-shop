import { createServerSupabase } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  pending_payment: "待付款",
  paid: "已付款",
  processing: "備貨中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
  refunded: "已退款",
};

export default async function AdminOrdersPage() {
  const supabase = createServerSupabase();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">訂單管理</h1>

      <table className="mt-8 w-full font-body text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs text-muted">
            <th className="py-3">訂單編號</th>
            <th>收件人</th>
            <th>金額</th>
            <th>狀態</th>
            <th>建立時間</th>
          </tr>
        </thead>
        <tbody>
          {(orders as any[] | null)?.map((o) => (
            <tr key={o.id} className="border-b border-line">
              <td className="py-3 font-mono text-xs">{o.order_no}</td>
              <td>{o.recipient_name}</td>
              <td className="font-mono">NT$ {o.total.toLocaleString()}</td>
              <td>{statusLabel[o.status]}</td>
              <td className="font-mono text-xs text-muted">
                {new Date(o.created_at).toLocaleString("zh-TW")}
              </td>
            </tr>
          ))}
          {(!orders || orders.length === 0) && (
            <tr>
              <td colSpan={5} className="py-6 text-muted">尚無訂單。</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
