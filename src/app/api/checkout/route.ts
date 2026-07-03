import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { mockPaymentProvider } from "@/lib/payment/provider";
// 之後選定金流商後，改成：
// import { ecpayProvider } from "@/lib/payment/ecpay";
// import { newebpayProvider } from "@/lib/payment/newebpay";

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

  // TODO: 決定金流商後，把 mockPaymentProvider 換成 ecpayProvider / newebpayProvider
  const session = await mockPaymentProvider.createPaymentSession({
    orderNo,
    amount: subtotal,
    itemName: orderItems.map((i: any) => i.product_name).join("、").slice(0, 100),
    returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback`,
    clientBackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
  });

  return NextResponse.json(session);
}
