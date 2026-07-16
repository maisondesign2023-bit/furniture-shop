"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

const INITIAL_COUNT = 4;
const BATCH_SIZE = 20;

export default function ProductShelfGrid({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + BATCH_SIZE)}
            className="inline-block bg-walnut px-8 py-3 font-body text-sm tracking-wide2 text-surface hover:bg-brass"
          >
            查看更多
          </button>
        </div>
      )}
    </>
  );
}
