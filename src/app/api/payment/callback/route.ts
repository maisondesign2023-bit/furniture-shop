import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/server";
import { ecpayProvider } from "@/lib/payment/ecpay";
import { sendOrderPaidEmails } from "@/lib/email";

export const runtime = "edge";

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload: Record<string, string> = {};
  formData.forEach((value, key) => {
    payload[key] = String(value);
  });

  const result = await ecpayProvider.verifyCallback(payload);

  if (result.isValid) {
    const supabase = createAdminSupabase();
    const { data: order } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_provider: "ecpay",
        payment_trade_no: result.tradeNo,
        paid_at: new Date().toISOString(),
      })
      .eq("order_no", result.orderNo)
      .select()
      .single();

    if (order) {
      await sendOrderPaidEmails({
        order_no: order.order_no,
        recipient_name: order.recipient_name,
        total: order.total,
        email: order.email,
      });
    }
  }

  // 綠界規定：一定要回傳純文字 "1|OK"，否則會被視為通知失敗而重複發送
  return new NextResponse("1|OK", {
    headers: { "Content-Type": "text/plain" },
  });
}
