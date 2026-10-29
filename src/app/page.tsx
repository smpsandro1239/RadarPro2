import { getLatestProperties } from "@/lib/queries";
import PropertyGrid from "@/components/PropertyGrid";
import PropertyImage from "@/components/PropertyImage";

export default async function Home() {
  const properties = await getLatestProperties();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-12 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Encontre as melhores <br />
          <span className="text-primary">oportunidades imobiliárias</span>
        </h1>
        <p className="text-xl text-secondary mb-8">
          Analisamos anúncios de bancos, portais e leilões em Portugal e selecionamos apenas os que valem a pena.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
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

      {/* Properties with search */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Oportunidades detectadas</h2>
          <div className="text-sm text-secondary">
            <span className="inline-block w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
            {properties.length} imóveis de 7 fontes
          </div>
        </div>

        <PropertyGrid properties={properties} />
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
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <a href="/como-funciona" className="hover:text-primary">Como funciona</a>
          <a href="/precos" className="hover:text-primary">Preços</a>
          <a href="/credito" className="hover:text-primary">Crédito</a>
          <a href="/mapa" className="hover:text-primary">Mapa</a>
          <a href="/alertas" className="hover:text-primary">Alertas</a>
          <a href="/favoritos" className="hover:text-primary">Favoritos</a>
          <a href="/comparador" className="hover:text-primary">Comparador</a>
          <a href="/oportunidades" className="hover:text-primary">Melhores</a>
          <a href="/estatisticas" className="hover:text-primary">Estatísticas</a>
          <a href="/agencias" className="hover:text-primary">Agências</a>
          <a href="/valoracao" className="hover:text-primary">Valorização</a>
          <a href="/blog" className="hover:text-primary">Blog</a>
          <a href="/faq" className="hover:text-primary">FAQ</a>
          <a href="/privacidade" className="hover:text-primary">Privacidade</a>
          <a href="/termos" className="hover:text-primary">Termos</a>
        </div>
        <p>© 2026 RadarPro Portugal. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
