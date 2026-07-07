import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { mockPaymentProvider } from "@/lib/payment/provider";
import { ecpayProvider } from "@/lib/payment/ecpay";
import { sendOrderCreatedEmails } from "@/lib/email";

export const runtime = "edge";

// 有設定綠界的金鑰就用真實金流，還沒設定就先用模擬付款，方便先測試流程
const paymentProvider = process.env.ECPAY_MERCHANT_ID ? ecpayProvider : mockPaymentProvider;

export async function POST(req: Request) {
  const body = await req.json();
  const { recipientName, recipientPhone, shippingAddress, items, subtotal } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "購物車是空的" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orderNo = `ORD${Date.now()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_no: orderNo,
      user_id: user?.id ?? null,
      email: user?.email ?? null,
      subtotal,
      shipping_fee: 0,
      total: subtotal,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      shipping_address: shippingAddress,
      status: "pending_payment",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message }, { status: 500 });
  }

  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    variant: [item.selectedSize, item.selectedColor].filter(Boolean).join(" / ") || null,
    unit_price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // 訂單成立通知（客戶 + 管理員），寄信失敗不影響結帳流程本身
  await sendOrderCreatedEmails({
    order_no: order.order_no,
    recipient_name: order.recipient_name,
    total: order.total,
    email: order.email,
  });

  // 使用上面依環境判斷好的 paymentProvider（有綠界金鑰就是真實付款，否則是模擬付款）
  const session = await paymentProvider.createPaymentSession({
    orderNo,
    amount: subtotal,
    itemName: orderItems.map((i: any) => i.product_name).join("、").slice(0, 100),
    returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback`,
    clientBackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
  });

  return NextResponse.json(session);
}
