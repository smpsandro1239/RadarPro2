import Link from "next/link";
import { MapPin, TrendingDown, Home, Building2 } from "lucide-react";
import { getTopScrapeProperties } from "@/lib/melhores";
import { PORTUGAL_DISTRICTS, fold } from "@/lib/geography";
import { getIMI, getMunicipalityStats } from "@/lib/flatin";
import { formatEuros, formatScoreOutOf100 } from "@/lib/format";

interface Props {
  params: Promise<{ distrito: string }>;
}

export default async function MercadoDistritoPage({ params }: Props) {
  const { distrito } = await params;
  const district = PORTUGAL_DISTRICTS.find((d) => fold(d) === fold(distrito)) ?? distrito;

  const imiRates = await getIMI();
  const imi = imiRates.find((r) => fold(r.municipality) === fold(district)) ?? null;
  const stats = await getMunicipalityStats(district);

  const items = await getTopScrapeProperties(50);
  const scored = items.filter((p) => p.score !== null);
  const districtItems = scored.filter((p) => p.district === district);
  const top = [...districtItems].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);
  const median = stats?.median_sale_price?.value ?? null;

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <Link href="/melhores" className="text-primary hover:underline mb-6 inline-block">
        Voltar
      </Link>
      <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
        <MapPin className="text-primary" size={32} />
        {district}
      </h1>
      <p className="text-xl text-secondary mb-8">Mercado imobiliário e oportunidades em {district}.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="border rounded-2xl p-6">
          <div className="flex items-center gap-2 text-secondary text-sm mb-2">
            <TrendingDown size={16} className="text-primary" />
            Preço mediano de venda
          </div>
          <div className="text-3xl font-bold text-primary">{median !== null ? formatEuros(median) : "—"}</div>
          <div className="text-xs text-secondary mt-1">fonte: INE via flatin.pt (12 meses)</div>
        </div>
        <div className="border rounded-2xl p-6">
          <div className="flex items-center gap-2 text-secondary text-sm mb-2">
            <Building2 size={16} className="text-primary" />
            IMI urbano
          </div>
          <div className="text-3xl font-bold text-primary">{imi?.urban.available ? imi.urban.percent : "—"}</div>
          <div className="text-xs text-secondary mt-1">IMI urbano: {imi?.urban.available ? imi.urban.percent : "—"}</div>
        </div>
        <div className="border rounded-2xl p-6">
          <div className="flex items-center gap-2 text-secondary text-sm mb-2">
            <Home size={16} className="text-primary" />
            Imóveis com avaliação no RadarPro
          </div>
          <div className="text-3xl font-bold text-primary">{districtItems.length}</div>
          <div className="text-xs text-secondary mt-1">{districtItems.length > 0 ? "Top 3 abaixo" : "Ainda sem dados"}</div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Melhores oportunidades em {district}</h2>
        {top.length === 0 ? (
          <div className="border rounded-xl p-6 text-center text-secondary">
            Ainda não temos imóveis com avaliação neste distrito. Estamos a recolher imóveis em {district}.
          </div>
        ) : (
          <ol className="space-y-3">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-4 bg-white border rounded-xl p-3">
                <div className="w-8 text-center font-bold text-lg text-primary">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{p.title}</div>
                  <div className="text-xs text-secondary">
                    {p.municipality}, {p.district}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold">{formatEuros(p.price)}</div>
                  <div className="text-xs text-primary">{formatScoreOutOf100(p.score)}</div>
                </div>
                <Link href={`/imovel/${p.id}`} className="text-primary hover:underline text-sm font-bold flex-shrink-0">
                  Analisar
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Contexto do mercado</h2>
        {stats ? (
          <div className="border rounded-2xl p-6 space-y-3 text-secondary">
            <p>{stats.summary}</p>
            {stats.purchasing_power_index ? (
              <p>Poder de compra indexado: {stats.purchasing_power_index.value} (Portugal = 100, {stats.purchasing_power_index.period ?? "2021"}).</p>
            ) : null}
            {stats.new_dwellings_licensed ? (
              <p>{stats.new_dwellings_licensed.value} habitações novas licenciadas em {stats.new_dwellings_licensed.year ?? ""}.</p>
            ) : null}
          </div>
        ) : (
          <div className="border rounded-xl p-6 text-center text-secondary">
            Dados de mercado por município ainda não disponíveis para este distrito.
          </div>
        )}
      </section>
    </main>
  );
}
