import { getTopScrapeProperties, groupTopByDistrict } from "@/lib/melhores";
import { PORTUGAL_DISTRICTS, fold } from "@/lib/geography";
import { formatScoreOutOf100, formatOptional, formatEuros } from "@/lib/format";
import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import PropertyImage from "@/components/PropertyImage";

export const metadata = {
  title: "Melhores por Distrito — RadarPro",
  description: "Os melhores imóveis reais de Portugal, com o top 3 por distrito selecionado pelo motor de avaliação.",
};

const LIMIT_PER_DISTRICT = 5;
const PAGE_SIZE = 10;

interface MelhoresSearchParams {
  district?: string;
  type?: string;
  min?: string;
  max?: string;
  page?: string;
}

function imagesOf(prop: { images?: string | null }) {
  if (!prop.images) return null;
  const parsed = JSON.parse(prop.images);
  return Array.isArray(parsed) ? parsed[0] ?? null : parsed;
}

export default async function MelhoresPage({ searchParams }: { searchParams: Promise<MelhoresSearchParams> }) {
  const params = await searchParams;
  const districtParam = params.district ?? undefined;
  const typeParam = params.type ?? undefined;
  const minParam = params.min ?? undefined;
  const maxParam = params.max ?? undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const items = await getTopScrapeProperties(50);
  const scored = items.filter((p) => p.score !== null);

  const districtKey = districtParam
    ? PORTUGAL_DISTRICTS.find((d) => fold(d) === fold(districtParam)) ?? districtParam
    : undefined;
  let filtered = scored;
  if (districtKey) {
    filtered = filtered.filter((p) => p.district === districtKey);
  }
  const type = typeParam ? typeParam.trim().toUpperCase() : undefined;
  if (type) {
    filtered = filtered.filter((p) => (p.type ?? "").toUpperCase() === type);
  }
  const minPrice = minParam ? Number(minParam) : null;
  const maxPrice = maxParam ? Number(maxParam) : null;
  if (minPrice !== null && Number.isFinite(minPrice)) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== null && Number.isFinite(maxPrice)) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  const sorted = [...filtered].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const top10 = sorted.slice(0, 10);
  const pageItems = top10.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const byDistrict = groupTopByDistrict(filtered, LIMIT_PER_DISTRICT, (p) => p.district);
  const districts = districtKey ? [districtKey] : [...PORTUGAL_DISTRICTS];

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </Link>
      <h1 className="text-4xl font-extrabold mb-2">Melhores por Distrito</h1>
      <p className="text-secondary mb-8">
        Os melhores negócios reais de Portugal, com o top {LIMIT_PER_DISTRICT} por distrito,
        selecionados pelo motor de avaliação. Dados 100% reais.
      </p>

      {districtKey && (
        <p className="mb-8 text-sm text-secondary">
          A mostrar apenas o distrito <strong>{districtKey}</strong>
          {type ? <> · tipo <strong>{type}</strong></> : null}
          {minPrice !== null ? <> · preço ≥ <strong>{formatEuros(minPrice)}</strong></> : null}
          {maxPrice !== null ? <> · preço ≤ <strong>{formatEuros(maxPrice)}</strong></> : null}
        </p>
      )}

      {/* Top 10 global */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-primary" size={24} />
          Top 10 global
        </h2>
        {pageItems.length === 0 ? (
          <div className="border rounded-xl p-6 text-center text-secondary">Sem imóveis reais com avaliação.</div>
        ) : (
          <ol className="space-y-3 mb-8">
            {pageItems.map((prop, i) => {
              const images = imagesOf(prop);
              const discount = prop.discountPct === null ? null : -prop.discountPct;
              const rank = (page - 1) * PAGE_SIZE + i + 1;
              return (
                <li key={prop.id}>
                  <Link href={`/imovel/${prop.id}`} className="flex items-center gap-4 bg-white border rounded-xl p-3 hover:shadow-lg transition">
                    <div className="w-8 text-center font-bold text-lg text-primary">{rank}</div>
                    <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden relative flex-shrink-0">
                      <PropertyImage src={images} alt={prop.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{prop.title}</div>
                      <div className="text-xs text-secondary flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {prop.municipality}, {prop.district}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold">{formatEuros(prop.price)}</div>
                      <div className="text-xs text-primary">
                        {formatOptional(discount, "%")} · {formatScoreOutOf100(prop.score)}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
        {top10.length > PAGE_SIZE && (
          <div className="text-center">
            <Link href={`/melhores?page=${page + 1}`} className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
              Ver mais
            </Link>
          </div>
        )}
      </section>

      {/* Top por distrito */}
      <div className="space-y-12">
        {districts.map((district) => {
          const items = byDistrict.get(district) ?? [];
          return (
            <section key={district}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="text-primary" size={24} />
                {district}
                <span className="text-sm font-medium text-secondary">
                  {items.length > 0 ? `${items.length} no top ${LIMIT_PER_DISTRICT}` : "sem dados"}
                </span>
              </h2>

              {items.length === 0 ? (
                <div className="border rounded-xl p-6 text-center text-secondary">
                  Sem imóveis reais com avaliação neste distrito ainda.
                </div>
              ) : (
                <ol className="space-y-3">
                  {items.map((prop, i) => {
                    const images = imagesOf(prop);
                    const discount = prop.discountPct === null ? null : -prop.discountPct;
                    return (
                      <li key={prop.id}>
                        <Link href={`/imovel/${prop.id}`} className="flex items-center gap-4 bg-white border rounded-xl p-3 hover:shadow-lg transition">
                          <div className="w-8 text-center font-bold text-lg text-primary">{i + 1}</div>
                          <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden relative flex-shrink-0">
                            <PropertyImage src={images} alt={prop.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{prop.title}</div>
                            <div className="text-xs text-secondary flex items-center">
                              <MapPin size={12} className="mr-1" />
                              {prop.municipality}, {prop.district}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold">{formatEuros(prop.price)}</div>
                            <div className="text-xs text-primary">
                              {formatOptional(discount, "%")} · {formatScoreOutOf100(prop.score)}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
