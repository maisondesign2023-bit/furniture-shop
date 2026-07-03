import ProductForm from "@/components/admin/ProductForm";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const supabase = createServerSupabase();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">新增商品</h1>
      <div className="mt-8">
        <ProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}
