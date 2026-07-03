import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const images = product.product_images ?? [];
  const cover = images[0]?.url;
  const hoverImage = images[1]?.url;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {cover ? (
          <>
            <Image
              src={cover}
              alt={images[0]?.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-500 ${
                hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={images[1]?.alt || product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted">無圖片</div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-body text-sm text-ink">{product.name}</h3>
        <p className="price-tag">NT$ {product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
