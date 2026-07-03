import { createServerSupabase } from "@/lib/supabase/server";
import AccountAuthForm from "@/components/AccountAuthForm";
import SignOutButton from "@/components/SignOutButton";
import type { Order } from "@/types";

export default async function AccountPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-14">
        <h1 className="font-display text-3xl italic text-walnut">會員登入</h1>
        <div className="grain-divider my-8" />
        <AccountAuthForm />
      </div>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, string> = {
    pending_payment: "待付款",
    paid: "已付款",
    processing: "備貨中",
    shipped: "已出貨",
    completed: "已完成",
    cancelled: "已取消",
    refunded: "已退款",
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl italic text-walnut">我的訂單</h1>
        <SignOutButton />
      </div>
      <div className="grain-divider my-8" />

      <div className="space-y-4">
        {(orders as Order[] | null)?.map((order) => (
          <div key={order.id} className="border border-line p-5">
            <div className="flex justify-between font-mono text-xs text-muted">
              <span>{order.order_no}</span>
              <span>{statusLabel[order.status]}</span>
            </div>
            <p className="mt-2 font-mono text-lg text-walnut">
              NT$ {order.total.toLocaleString()}
            </p>
          </div>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="font-body text-sm text-muted">尚無訂單紀錄。</p>
        )}
      </div>
    </div>
  );
}
