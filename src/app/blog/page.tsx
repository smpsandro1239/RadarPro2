import PageShell from "@/components/ds/PageShell";
import Link from "next/link";

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
    <PageShell
      eyebrow="Blog"
      title="Guias de investimento"
      description="Artigos práticos sobre compra, leilão e avaliação de imóveis em Portugal."
      backHref="/"
      backLabel="Voltar ao início"
    >
      <div className="border-t border-rp-line">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-rp-line py-8">
            <p className="rp-eyebrow text-rp-muted">{post.date}</p>
            <h2 className="rp-display mt-2 text-[26px] leading-tight text-rp-ink">
              <Link
                href={`/blog/${post.slug}`}
                className="underline decoration-[1px] underline-offset-4 transition-colors duration-[var(--rp-dur-1)] hover:text-rp-cobalt hover:decoration-2"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-[68ch] text-[16px] leading-relaxed text-rp-ink-2">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
