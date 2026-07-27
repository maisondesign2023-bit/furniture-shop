"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "待付款", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "paid", label: "已付款", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "processing", label: "備貨中", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "shipped", label: "已出貨", dot: "bg-teal-500", badge: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "completed", label: "已完成", dot: "bg-green-600", badge: "bg-green-50 text-green-700 border-green-200" },
  { value: "cancelled", label: "已取消", dot: "bg-gray-400", badge: "bg-gray-50 text-gray-600 border-gray-200" },
  { value: "refunded", label: "已退款", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
];

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    setSaving(true);
    const res = await fetch("/api/admin/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("更新失敗，請重新整理再試一次");
      setStatus(currentStatus);
      return;
    }
    router.refresh();
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 ${current.badge} ${
        saving ? "opacity-50" : ""
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${current.dot}`} aria-hidden />
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent font-mono text-xs focus:outline-none disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
