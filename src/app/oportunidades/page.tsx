import { getAllActiveProperties } from "@/lib/queries";
import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingDown, Trophy } from "lucide-react";
import PropertyImage from "@/components/PropertyImage";

export default async function OportunidadesPage() {
  const properties = await getAllActiveProperties();

  // Sort by score descending
  const ranked = [...properties].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Top 10 opportunities
  const top10 = ranked.slice(0, 10);

  // Best by district
  const byDistrict = ["Lisboa", "Porto", "Braga"].map((district) => {
    const props = ranked.filter((p) => p.district === district);
    return { district, best: props[0], count: props.length };
  });

  // Best by discount
  const bestDiscount = [...properties].sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0)).slice(0, 5);

  // Best by rentability
  const bestRentability = [...properties].filter((p) => (p.rentability || 0) > 0).sort((a, b) => (b.rentability || 0) - (a.rentability || 0)).slice(0, 5);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-2">Melhores Oportunidades</h1>
      <p className="text-secondary mb-8">
        Ranking das melhores oportunidades imobiliárias em Portugal, ordenadas por score.
      </p>

      {/* Top 3 podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {top10.slice(0, 3).map((prop, i) => {
          const images = prop.images ? JSON.parse(prop.images) : [];
          const imageUrl = images[0] || null;
          const medals = ["🥇", "🥈", "🥉"];
          return (
            <Link
              key={prop.id}
              href={`/imovel/${prop.id}`}
              className="border-2 border-primary rounded-2xl overflow-hidden hover:shadow-xl transition group block"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                <PropertyImage src={imageUrl} alt={prop.title} fill className="group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-4 left-4 text-3xl z-10">{medals[i]}</div>
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold z-10">
                  {prop.score}/100
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg truncate">{prop.title}</h3>
                <div className="flex items-center text-sm text-secondary mt-1">
                  <MapPin size={14} className="mr-1" />
                  {prop.municipality}, {prop.district}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-lg">{prop.price.toLocaleString()}€</span>
                  <span className="text-primary font-bold">-{prop.discountPct}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Best by district */}
      <h2 className="text-2xl font-bold mb-4">Melhor por distrito</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {byDistrict.map(({ district, best, count }) => (
          <Link
            key={district}
            href={best ? `/imovel/${best.id}` : "#"}
            className="bg-white border rounded-xl p-4 hover:shadow-lg transition block"
          >
            <div className="font-bold text-lg mb-1">{district}</div>
            <div className="text-sm text-secondary mb-2">{count} imóveis</div>
            {best && (
              <>
                <div className="font-medium text-sm truncate">{best.title}</div>
                <div className="flex justify-between mt-2">
                  <span className="font-bold">{best.price.toLocaleString()}€</span>
                  <span className="text-primary font-bold">{best.score}/100</span>
                </div>
              </>
            )}
          </Link>
        ))}
      </div>

      {/* Top 10 ranking */}
      <h2 className="text-2xl font-bold mb-4">Top 10 por score</h2>
      <div className="space-y-3 mb-8">
        {top10.map((prop, i) => {
          const images = prop.images ? JSON.parse(prop.images) : [];
          const imageUrl = images[0] || null;
          return (
            <Link
              key={prop.id}
              href={`/imovel/${prop.id}`}
              className="flex items-center gap-4 bg-white border rounded-xl p-3 hover:shadow-lg transition"
            >
              <div className="w-8 text-center font-bold text-lg text-primary">{i + 1}</div>
              <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden relative flex-shrink-0">
                <PropertyImage src={imageUrl} alt={prop.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{prop.title}</div>
                <div className="text-xs text-secondary">{prop.municipality}, {prop.district} · {prop.sourceName}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{prop.price.toLocaleString()}€</div>
                <div className="text-xs text-primary">-{prop.discountPct}% · {prop.score}/100</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Best by discount */}
      <h2 className="text-2xl font-bold mb-4">Maiores descontos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {bestDiscount.map((prop) => {
          const images = prop.images ? JSON.parse(prop.images) : [];
          const imageUrl = images[0] || null;
          return (
            <Link
              key={prop.id}
              href={`/imovel/${prop.id}`}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition group block"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                <PropertyImage src={imageUrl} alt={prop.title} fill className="group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold z-10">
                  -{prop.discountPct}%
                </div>
              </div>
              <div className="p-3">
                <div className="font-bold text-sm truncate">{prop.title}</div>
                <div className="text-xs text-secondary">{prop.municipality}</div>
                <div className="font-bold mt-1">{prop.price.toLocaleString()}€</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Best by rentability */}
      <h2 className="text-2xl font-bold mb-4">Melhor rentabilidade</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {bestRentability.map((prop) => {
          const images = prop.images ? JSON.parse(prop.images) : [];
          const imageUrl = images[0] || null;
          return (
            <Link
              key={prop.id}
              href={`/imovel/${prop.id}`}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition group block"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                <PropertyImage src={imageUrl} alt={prop.title} fill className="group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2 bg-success text-white px-2 py-0.5 rounded text-xs font-bold z-10">
                  {prop.rentability}%
                </div>
              </div>
              <div className="p-3">
                <div className="font-bold text-sm truncate">{prop.title}</div>
                <div className="text-xs text-secondary">{prop.municipality}</div>
                <div className="font-bold mt-1">{prop.price.toLocaleString()}€</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
