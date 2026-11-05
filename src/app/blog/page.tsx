import { BLOG_POSTS } from "@/lib/blog-posts";

export default function BlogPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-8">Blog — Guias de Investimento</h1>

      <div className="space-y-8">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="border-b pb-8">
            <h2 className="text-2xl font-bold mb-2 hover:text-primary transition">
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </h2>
            <p className="text-secondary mb-3">{post.excerpt}</p>
            <div className="text-sm text-secondary">{post.date}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
