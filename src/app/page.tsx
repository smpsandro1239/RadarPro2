import { MapPin, TrendingDown, ExternalLink } from "lucide-react";
import { getLatestProperties } from "@/lib/queries";
import Image from "next/image";

export default async function Home() {
  const properties = await getLatestProperties();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <nav className="p-6 border-b flex justify-between items-center max-w-7xl mx-auto">
        <a href="/" className="text-2xl font-bold tracking-tight text-primary">
          RadarPro <span className="text-foreground">Portugal</span>
        </a>
        <div className="flex gap-4 items-center">
          <a href="/como-funciona" className="px-4 py-2 text-sm font-medium hover:text-primary">
            Como funciona
          </a>
          <a href="/precos" className="px-4 py-2 text-sm font-medium hover:text-primary">
            Preços
          </a>
          <a href="/auth" className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            Aceder
          </a>
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
          {["Lisboa", "Porto", "Braga"].map((city) => (
            <a
              key={city}
              href={`/oportunidades/${city.toLowerCase()}`}
              className="px-4 py-2 bg-slate-100 rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition"
            >
              {city}
            </a>
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
          {properties.map((prop) => {
            const images = prop.images ? JSON.parse(prop.images) : [];
            const imageUrl = images[0] || null;
            return (
              <a
                key={prop.id}
                href={`/imovel/${prop.id}`}
                className="border rounded-2xl overflow-hidden hover:shadow-xl transition group block"
              >
                <div className="aspect-video bg-slate-200 relative overflow-hidden">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={prop.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm z-10">
                    {prop.sourceName}
                  </div>
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold z-10">
                    {prop.score}/100
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
              </a>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-50 py-20 mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para comprar com vantagem?</h2>
        <p className="text-secondary mb-8">
          Acesse centenas de imóveis com lucro garantido antes de todo o mundo.
        </p>
        <a
          href="/app/oportunidades"
          className="inline-block bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition shadow-lg"
        >
          Ver todas as oportunidades em Portugal
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-secondary">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/como-funciona" className="hover:text-primary">Como funciona</a>
          <a href="/precos" className="hover:text-primary">Preços</a>
          <a href="/faq" className="hover:text-primary">FAQ</a>
        </div>
        <p>© 2026 RadarPro Portugal. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
