export const runtime = "edge";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";
import ProductGallery from "@/components/ProductGallery";
import type { CaseStudy } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

async function getCase(slug: string) {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("case_studies")
    .select("*, case_study_images(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as CaseStudy | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getCase(params.slug);
  if (!item) return {};
  return buildMetadata({
    title: item.title,
    description: item.summary || item.title,
    path: `/services/case/${item.slug}`,
    image: item.case_study_images?.[0]?.url,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getCase(params.slug);
  if (!item) notFound();

  const images = (item!.case_study_images || []).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <nav className="mb-8 font-mono text-xs text-muted">
        家配師服務 / {item!.title}
      </nav>

      <h1 className="font-display text-3xl italic text-walnut">{item!.title}</h1>
      {item!.summary && (
        <p className="mt-3 font-body text-sm text-muted">{item!.summary}</p>
      )}

      <div className="mt-8">
        <ProductGallery images={images} productName={item!.title} />
      </div>

      {item!.content && (
        <div className="mt-10 whitespace-pre-line font-body text-sm leading-relaxed text-ink">
          {item!.content}
        </div>
      )}
    </div>
  );
}
