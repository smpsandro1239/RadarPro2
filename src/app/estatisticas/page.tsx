import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, sql, count, avg, min, max } from "drizzle-orm";
import { getAllActiveProperties } from "@/lib/queries";

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
  const totalMarket = properties.reduce((a, b) => a + (b.marketValue || 0), 0);
  const avgDiscount = Math.round(properties.reduce((a, b) => a + (b.discountPct || 0), 0) / properties.length);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-2">Estatísticas do Mercado</h1>
      <p className="text-secondary mb-8">
        Análise de {properties.length} imóveis em Portugal (Lisboa, Porto, Braga)
      </p>

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary">{properties.length}</div>
          <div className="text-sm text-secondary">Imóveis ativos</div>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary">{Math.round(totalPrice / properties.length).toLocaleString()}€</div>
          <div className="text-sm text-secondary">Preço médio</div>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-success">{avgDiscount}%</div>
          <div className="text-sm text-secondary">Desconto médio</div>
        </div>
        <div className="bg-white border rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-primary">{[...new Set(properties.map((p) => p.sourceName))].length}</div>
          <div className="text-sm text-secondary">Fontes de dados</div>
        </div>
      </div>

      {/* By district */}
      <h2 className="text-2xl font-bold mb-4">Por distrito</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {byDistrict.map((d) => (
          <div key={d.district} className="bg-white border rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">{d.district}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary text-sm">Imóveis</span>
                <span className="font-bold">{d.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-sm">Preço médio</span>
                <span className="font-bold">{d.avgPrice.toLocaleString()}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-sm">Preço mínimo</span>
                <span className="font-bold">{d.minPrice.toLocaleString()}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-sm">Preço máximo</span>
                <span className="font-bold">{d.maxPrice.toLocaleString()}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-sm">Score médio</span>
                <span className="font-bold text-primary">{d.avgScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-sm">Desconto médio</span>
                <span className="font-bold text-success">{d.avgDiscount}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-sm">Fontes</span>
                <span className="font-bold">{d.sources}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* By source */}
      <h2 className="text-2xl font-bold mb-4">Por fonte</h2>
      <div className="bg-white border rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Fonte</th>
              <th className="text-right p-3">Imóveis</th>
              <th className="text-right p-3">Preço médio</th>
              <th className="text-right p-3">Score médio</th>
              <th className="text-right p-3">Desconto médio</th>
            </tr>
          </thead>
          <tbody>
            {sourceStats.map((s) => (
              <tr key={s.source} className="border-t">
                <td className="p-3 font-medium">{s.source}</td>
                <td className="p-3 text-right">{s.count}</td>
                <td className="p-3 text-right">{s.avgPrice.toLocaleString()}€</td>
                <td className="p-3 text-right">{s.avgScore}/100</td>
                <td className="p-3 text-right text-success">{s.avgDiscount}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* By type */}
      <h2 className="text-2xl font-bold mb-4">Por tipo de imóvel</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {typeStats.map((t) => (
          <div key={t.type} className="bg-white border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{t.count}</div>
            <div className="text-sm font-medium">{t.type}</div>
            <div className="text-xs text-secondary">{t.avgPrice.toLocaleString()}€ médio</div>
            <div className="text-xs text-success">-{t.avgDiscount}% desconto</div>
          </div>
        ))}
      </div>

      {/* Top opportunities */}
      <h2 className="text-2xl font-bold mb-4">Top 5 Oportunidades</h2>
      <div className="space-y-4">
        {topOpportunities.map((p, i) => (
          <a
            key={p.id}
            href={`/imovel/${p.id}`}
            className="flex items-center gap-4 bg-white border rounded-xl p-4 hover:shadow-lg transition"
          >
            <div className="text-2xl font-bold text-primary w-8">{i + 1}</div>
            <div className="flex-1">
              <div className="font-bold">{p.title}</div>
              <div className="text-sm text-secondary">{p.municipality}, {p.district} · {p.sourceName}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{p.price.toLocaleString()}€</div>
              <div className="text-sm text-primary">-{p.discountPct}% · {p.score}/100</div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
