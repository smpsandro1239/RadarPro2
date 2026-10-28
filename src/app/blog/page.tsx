const posts = [
  {
    slug: "como-comprar-imovel-leilao",
    title: "Como comprar um imóvel em leilão em Portugal",
    excerpt: "Guia completo para licitar em leilões judiciais e hasta pública. Riscos, cuidados e vantagens.",
    date: "2026-10-01",
  },
  {
    slug: "imoveis-de-banco-portugal",
    title: "Imóveis de banco em Portugal: onde encontrar",
    excerpt: "Caixa, BCP, Novo Banco e Santander Totta vendem imóveis retomados com descontos até 40%.",
    date: "2026-10-15",
  },
  {
    slug: "score-imobiliario",
    title: "O que é o Score de um imóvel e como usá-lo",
    excerpt: "Entenda como o score de 0 a 100 combina desconto, rentabilidade e liquidez.",
    date: "2026-10-20",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-8">Blog — Guias de Investimento</h1>

      <div className="space-y-8">
        {posts.map((post) => (
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
