import type { BlogPost } from "@/lib/blog-posts";

export default function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <article className="max-w-3xl">
      <h1 className="text-4xl font-extrabold mb-4">{post.title}</h1>
      <div className="text-sm text-secondary mb-8">{post.date}</div>
      {post.body.map((paragraph, i) => (
        <p key={i} className="text-lg text-slate-700 mb-6 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
