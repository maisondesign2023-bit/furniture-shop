import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import ShippingInfoEditor from "@/components/admin/ShippingInfoEditor";
import type { Order } from "@/types";

export const runtime = "edge";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "pending_payment", label: "待付款" },
  { value: "paid", label: "已付款" },
  { value: "processing", label: "備貨中" },
  { value: "shipped", label: "已出貨" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
  { value: "refunded", label: "已退款" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createServerSupabase();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const allOrders = (orders as Order[] | null) ?? [];
  const activeStatus = searchParams.status ?? "all";
  const filteredOrders =
    activeStatus === "all" ? allOrders : allOrders.filter((o) => o.status === activeStatus);

  const countByStatus = (status: string) =>
    status === "all" ? allOrders.length : allOrders.filter((o) => o.status === status).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">訂單管理</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value === "all" ? "/admin/orders" : `/admin/orders?status=${tab.value}`}
              className={`border px-3 py-1.5 font-mono text-xs ${
                isActive
                  ? "border-walnut bg-walnut text-surface"
                  : "border-line text-muted hover:border-brass hover:text-brass"
              }`}
            >
              {tab.label} ({countByStatus(tab.value)})
            </Link>
          );
        })}
      </div>

      <table className="mt-8 w-full font-body text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs text-muted">
            <th className="py-3">訂單編號</th>
            <th>收件人</th>
            <th>金額</th>
            <th>狀態</th>
            <th>物流</th>
            <th>建立時間</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o.id} className="border-b border-line">
              <td className="py-3 font-mono text-xs">{o.order_no}</td>
              <td>{o.recipient_name}</td>
              <td className="font-mono">NT$ {o.total.toLocaleString()}</td>
              <td>
                <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
              </td>
              <td>
                <ShippingInfoEditor order={o} />
              </td>
              <td className="font-mono text-xs text-muted">
                {new Date(o.created_at).toLocaleString("zh-TW")}
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-muted">
                {activeStatus === "all" ? "尚無訂單。" : "這個狀態目前沒有訂單。"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
