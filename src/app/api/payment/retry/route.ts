import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { mockPaymentProvider } from "@/lib/payment/provider";
import { ecpayProvider } from "@/lib/payment/ecpay";

export const runtime = "edge";

// 有設定綠界的金鑰就用真實金流，還沒設定就先用模擬付款，跟結帳流程一致
const paymentProvider = process.env.ECPAY_MERCHANT_ID ? ecpayProvider : mockPaymentProvider;

export async function POST(req: Request) {
  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "缺少訂單編號" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "找不到這筆訂單" }, { status: 404 });
  }

  if (order.status !== "pending_payment") {
    return NextResponse.json({ error: "這筆訂單不需要付款" }, { status: 400 });
  }

  const itemName = (order.order_items ?? [])
    .map((i: { product_name: string }) => i.product_name)
    .join("、")
    .slice(0, 100);

  const session = await paymentProvider.createPaymentSession({
    orderNo: order.order_no,
    amount: order.total,
    itemName: itemName || order.order_no,
    returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback`,
    clientBackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
  });

  return NextResponse.json(session);
}
