import Link from "next/link";
import type { Category } from "@/types";

export default function CategorySidebar({
  categories,
  selectedSlug,
}: {
  categories: Category[];
  selectedSlug?: string;
}) {
  const topLevel = categories
    .filter((c) => !c.parent_id)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  function childrenOf(parentId: string) {
    return categories
      .filter((c) => c.parent_id === parentId)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  const selected = selectedSlug ? categories.find((c) => c.slug === selectedSlug) : undefined;
  const activeTopId = selected ? selected.parent_id ?? selected.id : null;

  return (
    <aside className="w-full shrink-0 md:w-56">
      <p className="mb-4 font-display text-lg text-walnut">商品分類</p>
      {selected && (
        <Link
          href="/products"
          className="mb-3 flex items-center gap-1 font-mono text-xs text-muted hover:text-brass"
        >
          ‹ 所有分類
        </Link>
      )}
      <nav className="flex flex-col font-body text-sm">
        <Link
          href="/products"
          className={`border-b border-line py-3 ${
            !selected ? "font-semibold text-brass" : "hover:text-brass"
          }`}
        >
          全站商品
        </Link>
        {topLevel.map((top) => {
          const children = childrenOf(top.id);
          const isActiveBranch = activeTopId === top.id;
          return (
            <div key={top.id} className="border-b border-line">
              <Link
                href={`/products?category=${top.slug}`}
                className={`block py-3 ${isActiveBranch ? "font-semibold text-brass" : "hover:text-brass"}`}
              >
                {top.name}
              </Link>
              {isActiveBranch && children.length > 0 && (
                <div className="flex flex-col gap-1 pb-3 pl-4">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/products?category=${child.slug}`}
                      className={`py-1 text-xs ${
                        selected?.id === child.id ? "text-brass" : "text-muted hover:text-brass"
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {topLevel.length === 0 && (
          <p className="py-3 font-mono text-xs text-muted">尚未建立分類</p>
        )}
      </nav>
    </aside>
  );
}
