import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/server";
import { sendOrderPaidEmails } from "@/lib/email";

export const runtime = "edge";

// 開發測試用：模擬付款頁按下「模擬付款完成」時呼叫，把訂單標記為已付款。
// 正式上線接上真實金流後，這個 route 跟 /checkout/mock-payment 都可以整組移除，
// 屆時付款完成一律由 /api/payment/callback 的金流商 server-to-server 通知處理。
export async function POST(req: Request) {
  const { orderNo } = await req.json();
  if (!orderNo) {
    return NextResponse.json({ error: "缺少訂單編號" }, { status: 400 });
  }

  const supabase = createAdminSupabase();
  const { data: order } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_provider: "mock",
      payment_trade_no: "MOCK",
      paid_at: new Date().toISOString(),
    })
    .eq("order_no", orderNo)
    .eq("status", "pending_payment")
    .select()
    .single();

  if (!order) {
    return NextResponse.json({ error: "找不到這筆待付款的訂單" }, { status: 404 });
  }

  await sendOrderPaidEmails({
    order_no: order.order_no,
    recipient_name: order.recipient_name,
    total: order.total,
    email: order.email,
  });

  return NextResponse.json({ ok: true });
}
