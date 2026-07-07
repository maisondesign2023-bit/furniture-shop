import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SitePage } from "@/types";
import SitePageForm from "@/components/admin/SitePageForm";

export const runtime = "edge";

export default async function AdminEditPagePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createServerSupabase();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!page) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">
        編輯：{(page as SitePage).title}
      </h1>
      <div className="mt-8">
        <SitePageForm page={page as SitePage} />
      </div>
    </div>
  );
}
