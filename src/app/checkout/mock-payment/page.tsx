"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function MockPaymentPage() {
  const params = useSearchParams();
  const orderNo = params.get("orderNo");
  const amount = params.get("amount");

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-mono text-xs text-brass">開發測試用付款頁</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-walnut">
        模擬付款
      </h1>
      <p className="mt-4 font-body text-sm text-muted">
        訂單編號 {orderNo}，金額 NT$ {amount}
      </p>
      <p className="mt-2 font-body text-xs text-muted">
        正式上線前請將此頁替換為綠界／藍新的真實付款流程。
      </p>
      <Link
        href="/checkout/success"
        className="mt-8 inline-block bg-walnut px-6 py-3 font-body text-sm tracking-wide2 text-surface hover:bg-brass"
      >
        模擬付款完成
      </Link>
    </div>
  );
}
