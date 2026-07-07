import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendOrderShippedEmail } from "@/lib/email";

export const runtime = "edge";

export async function POST(request: Request) {
  const { orderId, status } = await request.json();

  const supabase = createServerSupabase();

  // 確認是管理員才能操作（RLS 也會擋，這裡先做一次友善的檢查）
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "沒有權限" }, { status: 403 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json({ error: error?.message || "更新失敗" }, { status: 500 });
  }

  if (status === "shipped") {
    await sendOrderShippedEmail({
      order_no: order.order_no,
      recipient_name: order.recipient_name,
      total: order.total,
      email: order.email,
    });
  }

  return NextResponse.json({ success: true });
}
