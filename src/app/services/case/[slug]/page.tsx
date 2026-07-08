import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createPublicSupabase } from "@/lib/supabase/public";
import ProductGallery from "@/components/ProductGallery";
import type { CaseStudy } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

export const revalidate = 3600;

async function getCase(slug: string) {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("case_studies")
    .select("*, case_study_images(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as CaseStudy | null;
}

async function getRelatedCases(currentId: string) {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("case_studies")
    .select("*, case_study_images(*)")
    .eq("status", "published")
    .neq("id", currentId)
    .order("sort_order")
    .limit(3);
  return (data as CaseStudy[] | null) ?? [];
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
  const relatedCases = await getRelatedCases(item!.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <nav className="mb-8 font-mono text-xs text-muted">
        家配師服務 / {item!.title}
      </nav>

      <h1 className="font-display text-3xl font-semibold text-walnut">{item!.title}</h1>
      {item!.summary && (
        <p className="mt-3 font-body text-sm text-muted">{item!.summary}</p>
      )}

      <div className="mt-8">
        <ProductGallery images={images} productName={item!.title} mainAspectClassName="aspect-[16/9]" />
      </div>

      {item!.content && (
        <div
          className="rich-content mt-10"
          dangerouslySetInnerHTML={{ __html: item!.content || "" }}
        />
      )}

      {relatedCases.length > 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <h2 className="font-display text-xl font-semibold text-walnut">相關案例</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {relatedCases.map((c) => {
              const cover = c.case_study_images?.[0]?.url;
              return (
                <Link key={c.id} href={`/services/case/${c.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                    {cover && (
                      <Image
                        src={cover}
                        alt={c.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-walnut">
                    {c.title}
                  </h3>
                  {c.summary && (
                    <p className="mt-1 font-body text-xs text-muted line-clamp-2">
                      {c.summary}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
