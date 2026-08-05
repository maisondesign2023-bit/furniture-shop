import { createServerSupabase } from "@/lib/supabase/server";
import type { Category } from "@/types";
import CategoryCreateForm from "@/components/admin/CategoryCreateForm";
import CategoryList from "@/components/admin/CategoryList";

export const runtime = "edge";

export default async function AdminCategoriesPage() {
  const supabase = createServerSupabase();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  const categoryList = (categories as Category[]) ?? [];
  const topLevelCategories = categoryList.filter((c) => !c.parent_id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">商品分類管理</h1>
      <p className="mt-2 font-body text-sm text-muted">
        分類最多支援兩層（例如：客廳家具 → 沙發）。拖曳左側圖示可調整同層排序，前台商品頁的左側選單會依此顯示。
      </p>

      <div className="mt-8">
        <CategoryCreateForm topLevelCategories={topLevelCategories} />
      </div>

      <div className="mt-10">
        <CategoryList initialCategories={categoryList} />
      </div>
    </div>
  );
}
