import { getAllActiveProperties } from "@/lib/queries";
import PropertyGrid from "@/components/PropertyGrid";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Leilões — RadarPro",
  description: "Imóveis em leilão em Portugal, com análise automática e lance máximo recomendado.",
};

export default async function LeiloesPage() {
  const all = await getAllActiveProperties();
  const lastChanges: Record<string, { type: "price_down" | "price_up"; changePct: number }> = {};
  for (const p of all) {
    const lc = p.lastChange;
    if (lc) lastChanges[p.id] = { type: lc.type, changePct: lc.changePct };
  }
  const auctions = all.filter((p) => p.isAuction);
  const recentBids = all.filter((p) => p.isAuction && p.lastChange).slice(0, 10);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">← Voltar</a>
      <h1 className="text-4xl font-extrabold mb-2">Leilões</h1>
      <p className="text-secondary mb-8">Imóveis em leilão, ordenados por oportunidade.</p>
      {recentBids.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Lances recentes</h2>
          <div className="space-y-3">
            {recentBids.map((p) => (
              <div key={p.id} className="border rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <Link href={`/imovel/${p.id}`} className="font-bold hover:text-primary">
                    {p.title}
                  </Link>
                  <div className="text-sm text-secondary">
                    {p.municipality}, {p.district} · {p.sourceName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {p.currentBid !== null ? p.currentBid.toLocaleString("pt-PT") + "€" : "—"}
                  </div>
                  <div className={`text-sm font-medium ${p.lastChange?.type === "price_down" ? "text-success" : "text-red-500"}`}>
                    {p.lastChange?.type === "price_down" ? "↓" : "↑"} {p.lastChange?.changePct}% (histórico)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Suspense fallback={<p>A carregar...</p>}>
        <PropertyGrid properties={auctions as any} totalCount={auctions.length} lastChanges={lastChanges} />
      </Suspense>
    </main>
  );
}