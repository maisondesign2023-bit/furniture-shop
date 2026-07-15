import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Product, ProductShelf, ShelfProduct } from "@/types";
import ShelfProductManager from "@/components/admin/ShelfProductManager";
import ShelfSettingsForm from "@/components/admin/ShelfSettingsForm";

export const runtime = "edge";

export default async function AdminShelfDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: shelf } = await supabase
    .from("product_shelves")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!shelf) notFound();

  const [{ data: allProducts }, { data: shelfProducts }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("status", "published")
      .order("name"),
    supabase
      .from("shelf_products")
      .select("*, products(*, product_images(*))")
      .eq("shelf_id", params.id)
      .order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">{shelf.title}</h1>
      <p className="mt-2 font-body text-sm text-muted">選擇要放進這個貨架的商品。</p>

      <div className="mt-8">
        <ShelfSettingsForm shelf={shelf as ProductShelf} />
      </div>

      <div className="mt-10">
        <ShelfProductManager
          shelfId={params.id}
          allProducts={(allProducts as Product[]) ?? []}
          initialShelfProducts={(shelfProducts as ShelfProduct[]) ?? []}
        />
      </div>
    </div>
  );
}
