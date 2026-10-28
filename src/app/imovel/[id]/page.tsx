import { db } from "@/db";
import { properties, priceHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MapPin, TrendingDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import ValuationCard from "@/components/ValuationCard";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (result.length === 0) notFound();
  const prop = result[0];

  // Get price history
  const history = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.propertyId, id))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(10);

  const images = prop.images ? JSON.parse(prop.images) : [];
  const imageUrl = images[0] || null;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: prop.title,
    description: `${prop.type} em ${prop.municipality}, ${prop.district}`,
    url: `https://radarpro-portugal.vercel.app/imovel/${prop.id}`,
    datePosted: prop.createdAt?.toISOString(),
    price: prop.price,
    priceCurrency: "EUR",
    address: {
      "@type": "PostalAddress",
      addressLocality: prop.municipality,
      addressRegion: prop.district,
      addressCountry: "PT",
    },
    ...(imageUrl && { image: imageUrl }),
  };

  const priceChange =
    history.length >= 2
      ? ((history[0].price - history[history.length - 1].price) /
          history[history.length - 1].price) *
        100
      : 0;

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden relative">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={prop.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-bold">
              {prop.score}/100
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-medium">
              {prop.sourceName}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-medium">
              {prop.type}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2">{prop.title}</h1>
          <div className="flex items-center text-secondary mb-6">
            <MapPin size={16} className="mr-1" />
            {prop.municipality}, {prop.district}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-xs text-secondary uppercase font-semibold mb-1">
                Preço de venda
              </div>
              <div className="text-2xl font-bold">{prop.price.toLocaleString()}€</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-xs text-secondary uppercase font-semibold mb-1">
                Valor de mercado
              </div>
              <div className="text-2xl font-bold text-success">
                {prop.marketValue?.toLocaleString()}€
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <TrendingDown size={18} className="text-primary" />
              <span className="font-bold text-primary">-{prop.discountPct}%</span>
              <span className="text-secondary">abaixo do mercado</span>
            </div>
            <div className="text-secondary">
              Rentabilidade: <span className="font-bold">{prop.rentability}%</span>
            </div>
            {priceChange !== 0 && (
              <div className={`font-bold ${priceChange < 0 ? "text-success" : "text-red-500"}`}>
                {priceChange < 0 ? "↓" : "↑"} {Math.abs(priceChange).toFixed(1)}% desde o primeiro registo
              </div>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <a
              href={prop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary text-white py-3 rounded-lg font-bold text-center hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Ver anúncio original <ExternalLink size={16} />
            </a>
          </div>

          {/* Valuation */}
          <div className="mb-6">
            <ValuationCard
              district={prop.district}
              type={prop.type}
              price={prop.price}
              marketValue={prop.marketValue}
              rentability={prop.rentability}
            />
          </div>

          {/* Price history */}
          {history.length > 1 && (
            <div className="border-t pt-6 mb-6">
              <h2 className="font-bold mb-3">Histórico de preço</h2>
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="flex justify-between text-sm">
                    <span className="text-secondary">
                      {h.recordedAt ? new Date(h.recordedAt).toLocaleDateString("pt-PT") : "—"}
                    </span>
                    <span className="font-medium">{h.price.toLocaleString()}€</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="font-bold mb-3">Detalhes</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Tipo</span>
                <span className="font-medium">{prop.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Fonte</span>
                <span className="font-medium">{prop.sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Distrito</span>
                <span className="font-medium">{prop.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Concelho</span>
                <span className="font-medium">{prop.municipality}</span>
              </div>
              {prop.createdAt && (
                <div className="flex justify-between">
                  <span className="text-secondary">Atualizado</span>
                  <span className="font-medium">
                    {new Date(prop.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              )}
              {prop.lastChecked && (
                <div className="flex justify-between">
                  <span className="text-secondary">Última verificação</span>
                  <span className="font-medium flex items-center gap-1">
                    {prop.checkStatus === "ok" && <span className="text-success">✓</span>}
                    {prop.checkStatus === "not_found" && <span className="text-red-500">✗</span>}
                    {new Date(prop.lastChecked).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
