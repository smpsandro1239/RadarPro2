import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { db } from "@/db";
import { properties, priceHistory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

interface PriceDrop {
  propertyId: string;
  title: string;
  district: string;
  municipality: string;
  sourceName: string;
  url: string;
  oldPrice: number;
  newPrice: number;
  changePct: number;
  recordedAt: Date | number | null;
}

export default async function BaixaramPage() {
  const history = await db
    .select({
      propertyId: priceHistory.propertyId,
      price: priceHistory.price,
      recordedAt: priceHistory.recordedAt,
      title: properties.title,
      district: properties.district,
      municipality: properties.municipality,
      sourceName: properties.sourceName,
      url: properties.url,
    })
    .from(priceHistory)
    .innerJoin(properties, eq(priceHistory.propertyId, properties.id))
    .where(eq(properties.dataOrigin, "scrape"))
    .orderBy(desc(priceHistory.recordedAt));

  const byProperty = new Map<string, Array<{ price: number; recordedAt: Date | number | null }>>();
  for (const h of history) {
    const pid = String(h.propertyId);
    const arr = byProperty.get(pid) ?? [];
    arr.push({ price: Number(h.price), recordedAt: h.recordedAt });
    byProperty.set(pid, arr);
  }

  const drops: PriceDrop[] = [];
  for (const [pid, entries] of byProperty) {
    const sorted = entries.slice().sort(
      (a, b) => new Date(b.recordedAt as any).getTime() - new Date(a.recordedAt as any).getTime(),
    );
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.price < prev.price && curr.price > 0) {
        const changePct = Math.round(((curr.price - prev.price) / prev.price) * 100);
        const prop = history.find((h) => String(h.propertyId) === pid);
        drops.push({
          propertyId: pid,
          title: String(prop?.title ?? pid),
          district: String(prop?.district ?? ""),
          municipality: String(prop?.municipality ?? ""),
          sourceName: String(prop?.sourceName ?? ""),
          url: String(prop?.url ?? ""),
          oldPrice: prev.price,
          newPrice: curr.price,
          changePct,
          recordedAt: curr.recordedAt,
        });
      }
    }
  }

  drops.sort((a, b) => b.changePct - a.changePct);

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        Voltar
      </Link>
      <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
        <TrendingDown className="text-primary" size={32} />
        Imóveis que baixaram de preço
      </h1>
      <p className="text-xl text-secondary mb-8">
        Quedas de preço registadas no histórico (últimos registos por imóvel).
      </p>

      {drops.length === 0 ? (
        <div className="border rounded-2xl p-8 text-center text-secondary">
          Ainda não registamos quedas de preço nos dados reais. Quando um imóvel for
          atualizado com um valor inferior ao anterior, vai aparecer aqui.
          <div className="mt-6">
            <Link href="/melhores" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition">
              Ver oportunidades
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {drops.map((d) => (
            <div key={d.propertyId + String(d.recordedAt)} className="border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/imovel/${d.propertyId}`} className="text-lg font-bold text-primary hover:underline">
                    {d.title}
                  </Link>
                  <div className="text-sm text-secondary mt-1">
                    {d.municipality}, {d.district} · {d.sourceName}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-secondary">
                    De {d.oldPrice.toLocaleString("pt-PT")}€ para{" "}
                    <span className="font-bold text-red-500">{d.newPrice.toLocaleString("pt-PT")}€</span>
                  </div>
                  <div className="text-lg font-extrabold text-success">↓ {d.changePct}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
