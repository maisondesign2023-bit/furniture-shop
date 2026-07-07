import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

export const runtime = "edge";

export default async function CheckoutPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-walnut">請先登入會員</h1>
        <p className="mt-4 font-body text-sm text-muted">
          結帳前需要先登入或註冊會員帳號，登入後會直接回到這裡繼續結帳。
        </p>
        <Link
          href="/account?next=/checkout"
          className="mt-8 inline-block bg-walnut px-6 py-3 font-body text-sm tracking-wide2 text-surface hover:bg-brass"
        >
          前往登入 / 註冊
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-walnut">結帳</h1>
      <div className="grain-divider my-8" />
      <CheckoutForm />
    </div>
  );
}
