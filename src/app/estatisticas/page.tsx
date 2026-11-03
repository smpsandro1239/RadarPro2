import { getAllActiveProperties } from "@/lib/queries";
import { formatOptional, formatScoreOutOf100 } from "@/lib/format";
import Link from "next/link";
import PageShell from "@/components/ds/PageShell";
import StatCard from "@/components/ds/StatCard";
import SectionHeader from "@/components/ds/SectionHeader";
import DataTable from "@/components/ds/DataTable";

export default async function EstatisticasPage() {
  const properties = await getAllActiveProperties();

  // Calculate stats by district
  const byDistrict = ["Lisboa", "Porto", "Braga"].map((district) => {
    const props = properties.filter((p) => p.district === district);
    const prices = props.map((p) => p.price);
    const scores = props.map((p) => p.score || 0);
    const discounts = props.map((p) => p.discountPct || 0);
    return {
      district,
      count: props.length,
      avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      avgDiscount: discounts.length ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) : 0,
      sources: [...new Set(props.map((p) => p.sourceName))].length,
    };
  });

  // Calculate stats by source
  const sourceStats = [...new Set(properties.map((p) => p.sourceName))].map((source) => {
    const props = properties.filter((p) => p.sourceName === source);
    return {
      source,
      count: props.length,
      avgPrice: Math.round(props.reduce((a, b) => a + b.price, 0) / props.length),
      avgScore: Math.round(props.reduce((a, b) => a + (b.score || 0), 0) / props.length),
      avgDiscount: Math.round(props.reduce((a, b) => a + (b.discountPct || 0), 0) / props.length),
    };
  }).sort((a, b) => b.count - a.count);

  // Calculate stats by type
  const typeStats = [...new Set(properties.map((p) => p.type))].map((type) => {
    const props = properties.filter((p) => p.type === type);
    return {
      type,
      count: props.length,
      avgPrice: Math.round(props.reduce((a, b) => a + b.price, 0) / props.length),
      avgDiscount: Math.round(props.reduce((a, b) => a + (b.discountPct || 0), 0) / props.length),
    };
  }).sort((a, b) => b.count - a.count);

  // Top opportunities
  const topOpportunities = [...properties]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  // Overall stats
  const totalPrice = properties.reduce((a, b) => a + b.price, 0);
  const avgDiscount = Math.round(properties.reduce((a, b) => a + (b.discountPct || 0), 0) / properties.length);

  return (
    <PageShell
      eyebrow="Estatísticas"
      title="Estatísticas do mercado"
      description={`Análise de ${properties.length} imóveis em Portugal (Lisboa, Porto, Braga)`}
      backHref="/"
      backLabel="Voltar ao início"
    >
      {/* Overall stats */}
      <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Imóveis ativos" value={properties.length} />
        <StatCard label="Preço médio" value={`${Math.round(totalPrice / properties.length).toLocaleString()}€`} />
        <StatCard label="Desconto médio" value={`${avgDiscount}%`} hint="face ao valor estimado" />
        <StatCard label="Fontes de dados" value={[...new Set(properties.map((p) => p.sourceName))].length} />
      </div>

      {/* By district */}
      <section className="mb-12">
        <SectionHeader eyebrow="Por distrito" title="Lisboa, Porto e Braga" />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {byDistrict.map((d) => (
            <article key={d.district} className="border border-rp-line bg-rp-surface p-6 shadow-rp-1">
              <h3 className="rp-display text-[22px] leading-tight text-rp-ink">{d.district}</h3>
              <dl className="mt-4 space-y-3">
                {[
                  { label: "Imóveis", value: String(d.count) },
                  { label: "Preço médio", value: `${d.avgPrice.toLocaleString()}€` },
                  { label: "Preço mínimo", value: `${d.minPrice.toLocaleString()}€` },
                  { label: "Preço máximo", value: `${d.maxPrice.toLocaleString()}€` },
                  { label: "Score médio", value: `${d.avgScore}/100`, tone: "text-rp-cobalt" },
                  { label: "Desconto médio", value: `${d.avgDiscount}%`, tone: "text-rp-anomaly" },
                  { label: "Fontes", value: String(d.sources) },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                    <dt className="text-[13px] text-rp-muted">{row.label}</dt>
                    <dd className={`rp-num text-[14px] font-medium text-rp-ink ${row.tone ?? ""}`}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* By source */}
      <section className="mb-12">
        <SectionHeader eyebrow="Por fonte" title="Cobertura dos portais" />
        <div className="mt-6 border border-rp-line bg-rp-surface p-4">
          <DataTable
            caption="Imóveis, preço, score e desconto por fonte"
            columns={[
              { key: "source", header: "Fonte", render: (row) => row.source },
              { key: "count", header: "Imóveis", numeric: true, render: (row) => row.count },
              { key: "avgPrice", header: "Preço médio", numeric: true, render: (row) => `${row.avgPrice.toLocaleString()}€` },
              { key: "avgScore", header: "Score médio", numeric: true, render: (row) => `${row.avgScore}/100` },
              {
                key: "avgDiscount",
                header: "Desconto médio",
                numeric: true,
                render: (row) => `${row.avgDiscount}%`,
              },
            ]}
            rows={sourceStats}
          />
        </div>
      </section>

      {/* By type */}
      <section className="mb-12">
        <SectionHeader eyebrow="Por tipo de imóvel" title="O que está no mercado" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {typeStats.map((t) => (
            <article key={t.type} className="border border-rp-line bg-rp-surface p-4">
              <p className="rp-num text-[28px] leading-none text-rp-ink">{t.count}</p>
              <p className="rp-eyebrow mt-2 text-rp-muted">{t.type}</p>
              <p className="rp-num mt-2 text-[13px] text-rp-ink-2">{t.avgPrice.toLocaleString()}€ médio</p>
              <p className="rp-num text-[13px] text-rp-anomaly">-{t.avgDiscount}% desconto</p>
            </article>
          ))}
        </div>
      </section>

      {/* Top opportunities */}
      <section>
        <SectionHeader eyebrow="Top 5" title="Oportunidades com melhor score" />
        <div className="mt-6 space-y-4">
          {topOpportunities.map((p, i) => (
            <Link
              key={p.id}
              href={`/imovel/${p.id}`}
              className="flex items-center gap-4 border border-rp-line bg-rp-surface p-4 transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-y-0.5 hover:shadow-rp-1"
            >
              <span className="rp-num w-8 text-[20px] text-rp-cobalt">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-rp-ink">{p.title}</span>
                <span className="block text-[13px] text-rp-muted">
                  {p.municipality}, {p.district} · {p.sourceName}
                </span>
              </span>
              <span className="text-right">
                <span className="rp-num block text-[15px] font-medium text-rp-ink">{p.price.toLocaleString()}€</span>
                <span className="rp-num block text-[12px] text-rp-muted">
                  {formatOptional(p.discountPct === null ? null : -p.discountPct, "%")} · {formatScoreOutOf100(p.score)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
