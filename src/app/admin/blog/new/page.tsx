import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">新增文章</h1>
      <div className="mt-8">
        <BlogPostForm />
      </div>
    </div>
  );
}
