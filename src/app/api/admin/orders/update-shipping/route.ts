import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "edge";

export async function POST(request: Request) {
  const { orderId, shippingCarrier, trackingNumber, trackingUrl } = await request.json();

  const supabase = createServerSupabase();

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

  const { error } = await supabase
    .from("orders")
    .update({
      shipping_carrier: shippingCarrier || null,
      tracking_number: trackingNumber || null,
      tracking_url: trackingUrl || null,
    })
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
