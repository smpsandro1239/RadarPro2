import { getTopScrapeProperties, groupTopByDistrict } from "@/lib/melhores";
import { PORTUGAL_DISTRICTS } from "@/lib/geography";
import { formatScoreOutOf100, formatOptional, formatEuros } from "@/lib/format";
import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import PropertyImage from "@/components/PropertyImage";

export const metadata = {
  title: "Melhores por Distrito — RadarPro",
  description: "Os melhores imóveis reais de Portugal, com o top 3 por distrito selecionado pelo motor de avaliação.",
};

const LIMIT_PER_DISTRICT = 3;

function imagesOf(prop: { images?: string | null }) {
  if (!prop.images) return null;
  const parsed = JSON.parse(prop.images);
  return Array.isArray(parsed) ? parsed[0] ?? null : parsed;
}

export default async function MelhoresPage() {
  const items = await getTopScrapeProperties(50);
  const scored = items.filter((p) => p.score !== null);
  const byDistrict = groupTopByDistrict(scored, LIMIT_PER_DISTRICT, (p) => p.district);

  const districts = PORTUGAL_DISTRICTS.map((district) => ({
    district,
    items: byDistrict.get(district) ?? [],
  }));

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

      <div className="space-y-12">
        {districts.map(({ district, items }) => (
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
                      <Link
                        href={`/imovel/${prop.id}`}
                        className="flex items-center gap-4 bg-white border rounded-xl p-3 hover:shadow-lg transition"
                      >
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
        ))}
      </div>
    </main>
  );
}
