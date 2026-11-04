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
  const auctions = all.filter((p) => p.isAuction);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">← Voltar</a>
      <h1 className="text-4xl font-extrabold mb-2">Leilões</h1>
      <p className="text-secondary mb-8">Imóveis em leilão, ordenados por oportunidade.</p>
      <Suspense fallback={<p>A carregar...</p>}>
        <PropertyGrid properties={auctions as any} totalCount={auctions.length} />
      </Suspense>
    </main>
  );
}