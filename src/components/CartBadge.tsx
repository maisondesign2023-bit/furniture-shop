"use client";

import { useCart } from "@/lib/cart-context";

export default function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="ml-1 rounded-full bg-brass px-1.5 py-0.5 font-mono text-[11px] text-surface">
      {count}
    </span>
  );
}
