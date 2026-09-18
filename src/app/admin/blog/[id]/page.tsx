import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";
import BlogPostEditForm from "@/components/admin/BlogPostEditForm";

export const runtime = "edge";

export default async function AdminBlogEditPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", params.id).single();
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">編輯文章</h1>
      <div className="mt-8">
        <BlogPostEditForm post={post as BlogPost} />
      </div>
    </div>
  );
}
