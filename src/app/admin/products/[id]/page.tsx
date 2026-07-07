import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Product, Category } from "@/types";
import ProductEditForm from "@/components/admin/ProductEditForm";

export const runtime = "edge";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("id", params.id)
      .single(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">編輯商品</h1>
      <div className="mt-8">
        <ProductEditForm
          product={product as Product}
          categories={(categories as Category[]) ?? []}
        />
      </div>
    </div>
  );
}
