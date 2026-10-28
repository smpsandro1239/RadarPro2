import { MapPin, TrendingDown, ExternalLink } from "lucide-react";
import { getLatestProperties } from "@/lib/queries";

export default async function Home() {
  const properties = await getLatestProperties();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <nav className="p-6 border-b flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-primary">
          RadarPro <span className="text-foreground">Portugal</span>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium">Como funciona</button>
          <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            Ver oportunidades
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Encontre as melhores <br />
          <span className="text-primary">oportunidades imobiliárias</span>
        </h1>
        <p className="text-xl text-secondary mb-10">
          Analisamos anúncios de bancos, portais e leilões em Portugal e selecionamos apenas os que valem a pena.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {["Lisboa", "Porto", "Braga", "Algarve", "Coimbra"].map((city) => (
            <span key={city} className="px-4 py-2 bg-slate-100 rounded-full text-sm font-medium hover:bg-primary/10 cursor-pointer transition">
              {city}
            </span>
          ))}
        </div>
      </section>

      {/* Grid de Imóveis */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Últimas oportunidades detectadas</h2>
          <div className="text-sm text-secondary">
            <span className="inline-block w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
            Detectada há 2 min
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <div key={prop.id} className="border rounded-2xl overflow-hidden hover:shadow-xl transition group">
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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg truncate flex-1">{prop.title}</h3>
                  <ExternalLink size={18} className="text-secondary opacity-0 group-hover:opacity-100 transition" />
                </div>

                <div className="flex items-center text-sm text-secondary mb-4">
                  <MapPin size={14} className="mr-1" />
                  {prop.municipality}, {prop.district}
                </div>

                <div className="grid grid-cols-2 gap-4 border-y py-4 mb-4">
                  <div>
                    <div className="text-xs text-secondary uppercase font-semibold">Preço</div>
                    <div className="text-lg font-bold">{prop.price.toLocaleString()}€</div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary uppercase font-semibold">Valorização</div>
                    <div className="text-lg font-bold text-success">{prop.marketValue?.toLocaleString()}€</div>
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
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-50 py-20 mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para comprar com vantagem?</h2>
        <p className="text-secondary mb-8">Acesse centenas de imóveis com lucro garantido antes de todo o mundo.</p>
        <button className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition shadow-lg">
          Ver todas as oportunidades em Portugal
        </button>
      </section>
    </main>
  );
}
