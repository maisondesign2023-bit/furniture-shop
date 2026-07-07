import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { BlogPost } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

export const revalidate = 3600;

async function getPost(slug: string) {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as BlogPost | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    image: post.cover_image ?? undefined,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-walnut">{post!.title}</h1>
      {post!.published_at && (
        <p className="mt-3 font-mono text-xs text-muted">
          {new Date(post!.published_at).toLocaleDateString("zh-TW")}
        </p>
      )}

      {post!.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-surface">
          <Image
            src={post!.cover_image}
            alt={post!.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8 whitespace-pre-line font-body text-sm leading-relaxed text-ink">
        {post!.content}
      </div>
    </article>
  );
}
