export const runtime = "edge";

import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl italic text-walnut">訂單已成立</h1>
      <p className="mt-4 font-body text-sm text-muted">
        感謝您的訂購，我們已收到您的訂單，將儘快為您安排出貨。
      </p>
      <Link
        href="/account"
        className="mt-8 inline-block border border-walnut px-6 py-3 font-body text-sm tracking-wide2 text-walnut hover:bg-walnut hover:text-surface"
      >
        查看我的訂單
      </Link>
    </div>
  );
}
