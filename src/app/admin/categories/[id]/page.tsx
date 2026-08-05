import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Category } from "@/types";
import CategoryEditForm from "@/components/admin/CategoryEditForm";

export const runtime = "edge";

export default async function AdminCategoryEditPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: category } = await supabase.from("categories").select("*").eq("id", params.id).single();
  if (!category) notFound();

  const { data: allCategories } = await supabase.from("categories").select("*").order("sort_order");
  const categoryList = (allCategories as Category[]) ?? [];
  const topLevelCategories = categoryList.filter((c) => !c.parent_id && c.id !== params.id);
  const hasChildren = categoryList.some((c) => c.parent_id === params.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">編輯分類</h1>
      <div className="mt-8">
        <CategoryEditForm
          category={category as Category}
          topLevelCategories={topLevelCategories}
          hasChildren={hasChildren}
        />
      </div>
    </div>
  );
}
