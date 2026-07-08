import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { CaseStudy } from "@/types";
import CaseStudyEditForm from "@/components/admin/CaseStudyEditForm";

export const runtime = "edge";

export default async function EditCasePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: caseStudy } = await supabase
    .from("case_studies")
    .select("*, case_study_images(*)")
    .eq("id", params.id)
    .single();

  if (!caseStudy) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">編輯案例</h1>
      <div className="mt-8">
        <CaseStudyEditForm caseStudy={caseStudy as CaseStudy} />
      </div>
    </div>
  );
}
