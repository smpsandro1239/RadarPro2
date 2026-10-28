import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MapPin, TrendingDown, ExternalLink } from "lucide-react";
import Image from "next/image";

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
  const images = prop.images ? JSON.parse(prop.images) : [];
  const imageUrl = images[0] || null;

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
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

          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-1">
              <TrendingDown size={18} className="text-primary" />
              <span className="font-bold text-primary">-{prop.discountPct}%</span>
              <span className="text-secondary">abaixo do mercado</span>
            </div>
            <div className="text-secondary">
              Rentabilidade: <span className="font-bold">{prop.rentability}%</span>
            </div>
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
