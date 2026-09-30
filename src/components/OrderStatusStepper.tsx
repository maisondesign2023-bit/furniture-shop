import type { Order } from "@/types";

// 直接對應訂單的 5 個非終止狀態，一個狀態一步，不做合併
// （現有訂單狀態沒有獨立的「已到貨」欄位，賣家在後台標記「已完成」就代表客人已收到貨）
const STEPS: { status: Order["status"]; label: string }[] = [
  { status: "pending_payment", label: "未付款" },
  { status: "paid", label: "已付款" },
  { status: "processing", label: "待出貨" },
  { status: "shipped", label: "已出貨" },
  { status: "completed", label: "訂單完成" },
];

export default function OrderStatusStepper({ order }: { order: Order }) {
  if (order.status === "cancelled" || order.status === "refunded") {
    return (
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted">
        {order.status === "cancelled" ? "此訂單已取消" : "此訂單已退款"}
      </div>
    );
  }

  const reached = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="mt-5 flex items-start">
      {STEPS.map((step, i) => {
        const done = i <= reached;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.status} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs ${
                  done ? "border-brass bg-brass text-surface" : "border-line bg-paper text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`mt-2 whitespace-nowrap font-mono text-[11px] ${
                  done ? "text-walnut" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 mt-[13px] h-0.5 flex-1 ${i < reached ? "bg-brass" : "bg-line"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
