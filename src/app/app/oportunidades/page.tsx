import { getLatestProperties } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin, TrendingDown, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function OportunidadesPage() {
  const session = await getSession();
  if (!session) redirect("/auth");

  const properties = await getLatestProperties();

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Oportunidades em Portugal</h1>
          <p className="text-secondary">
            Olá, {session.email} — {properties.length} imóveis disponíveis
          </p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
          >
            Sair
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop) => (
          <Link
            key={prop.id}
            href={`/imovel/${prop.id}`}
            className="border rounded-2xl overflow-hidden hover:shadow-xl transition group block"
          >
            <div className="aspect-video bg-slate-200 relative">
              <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                {prop.sourceName}
              </div>
              <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold">
                {prop.score}/100
              </div>
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                Foto do imóvel
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-lg truncate mb-2">{prop.title}</h3>
              <div className="flex items-center text-sm text-secondary mb-4">
                <MapPin size={14} className="mr-1" />
                {prop.municipality}, {prop.district}
              </div>

              <div className="grid grid-cols-2 gap-4 border-y py-4 mb-4">
                <div>
                  <div className="text-xs text-secondary uppercase font-semibold">
                    Preço
                  </div>
                  <div className="text-lg font-bold">
                    {prop.price.toLocaleString()}€
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary uppercase font-semibold">
                    Valorização
                  </div>
                  <div className="text-lg font-bold text-success">
                    {prop.marketValue?.toLocaleString()}€
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center text-primary font-bold">
                  <TrendingDown size={18} className="mr-1" />
                  -{prop.discountPct}%
                </div>
                <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-lg">
                  Rentabilidade: {prop.rentability}%
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
