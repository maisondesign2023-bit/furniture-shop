import type { Order } from "@/types";

const STEPS = ["待出貨", "已出貨", "訂單完成"] as const;

// 現有訂單狀態沒有獨立的「已到貨」欄位（不像大型平台有串接物流商的到貨通知），
// 所以「已到貨」用「訂單完成」代表——賣家確認完成訂單，等於客人已經收到貨。
function getReachedStep(status: Order["status"]): number {
  switch (status) {
    case "pending_payment":
      return -1; // 都還沒付款，連「待出貨」都還沒算開始
    case "paid":
    case "processing":
      return 0;
    case "shipped":
      return 1;
    case "completed":
      return 2;
    default:
      return -2; // cancelled / refunded，交給外層特殊處理
  }
}

export default function OrderStatusStepper({ order }: { order: Order }) {
  if (order.status === "cancelled" || order.status === "refunded") {
    return (
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted">
        {order.status === "cancelled" ? "此訂單已取消" : "此訂單已退款"}
      </div>
    );
  }

  const reached = getReachedStep(order.status);

  return (
    <div className="mt-5 flex items-start">
      {STEPS.map((label, i) => {
        const done = i <= reached;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={label} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
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
                {label}
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
