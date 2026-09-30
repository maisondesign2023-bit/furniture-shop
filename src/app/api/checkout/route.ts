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
  const { recipientName, recipientPhone, shippingAddress, note, items, subtotal } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "購物車是空的" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 購物車可能存放在瀏覽器一段時間，先確認裡面的商品都還存在、還是上架中，
  // 避免商品已被刪除/下架時，寫入 order_items 才失敗、留下沒有明細的殘留訂單
  const productIds = [...new Set(items.map((item: any) => item.productId))];
  const { data: existingProducts } = await supabase
    .from("products")
    .select("id, status")
    .in("id", productIds);
  const validIds = new Set(
    (existingProducts ?? [])
      .filter((p: { id: string; status: string }) => p.status !== "archived")
      .map((p: { id: string }) => p.id)
  );
  const invalidItems = items.filter((item: any) => !validIds.has(item.productId));
  if (invalidItems.length > 0) {
    const names = invalidItems.map((i: any) => i.name).join("、");
    return NextResponse.json(
      { error: `「${names}」已下架或不存在，請從購物車移除後再重新結帳` },
      { status: 400 }
    );
  }

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
      note: note || null,
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
    // 明細寫入失敗就把剛剛建立的訂單一起刪掉，避免留下沒有明細的殘留訂單
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // 訂單成立通知（客戶 + 管理員），寄信失敗不影響結帳流程本身
  await sendOrderCreatedEmails({
    order_no: order.order_no,
    recipient_name: order.recipient_name,
    total: order.total,
    email: order.email,
    items: orderItems.map((i: { product_name: string; variant: string | null; quantity: number; unit_price: number }) => ({
      product_name: i.product_name,
      variant: i.variant,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })),
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
