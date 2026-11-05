import { notFound } from "next/navigation";
import { getBlogPost, BLOG_POSTS } from "@/lib/blog-posts";
import BlogPostView from "@/components/BlogPost";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <a href="/blog" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <BlogPostView post={post} />
    </main>
  );
}
