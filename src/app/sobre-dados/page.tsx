import Link from "next/link";

export default function SobreDadosPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </Link>
      <h1 className="text-4xl font-extrabold mb-4">Sobre os dados</h1>
      <p className="text-xl text-secondary mb-12">
        Transparência total sobre a origem, qualidade e limitações dos dados do RadarPro.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Como recolhemos os dados</h2>
        <p className="text-secondary mb-4">
          O RadarPro recolhe imóveis em oferta para venda em Portugal através de canais públicos
          e gratuitos: portais imobiliários, leilões e fontes institucionais. Cada registo nasce de
          um anúncio real, com preço, área e fotografia obtidos directamente do anunciante.
        </p>
        <p className="text-secondary">
          Atualmente operamos com um conjunto limitado de imóveis verificados. A equipa continua a
          expandir a recolha e a melhorar a qualidade de cada registo.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Qualidade atual</h2>
        <p className="text-secondary mb-4">
          Dos imóveis recolhidos, a grande maioria tem área física confirmada e avaliação por
          comparação com o preço de mercado. Imóveis com avaliação pendente aparecem apenas quando
          as condições de avaliação estão reunidas.
        </p>
        <p className="text-secondary">
          A métrica pública do projecto reflecte o estado real do processo: dados completos,
          avaliações concluídas e classificações honestas sobre o que falta.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">O que significa o score</h2>
        <p className="text-secondary mb-4">
          O score (0–100) mede o desconto de um imóvel face ao valor de mercado estimado para a
          zona. Um score mais alto indica uma oportunidade real de compra abaixo do valor justo.
        </p>
        <p className="text-secondary">
          O valor de mercado é calculado por modelos hedónicos sobre dados de zona, não inventado —
          e apenas aplicado quando a avaliação é fiável.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">O que significa &quot;sem avaliação&quot;</h2>
        <p className="text-secondary mb-4">
          Alguns imóveis não recebem score porque a sua tipologia (prédio com frações mistas,
          terrenos rurais ou urbanos, ativos comerciais) exige avaliação manual. Isto não é falta de
          dados — é honestidade metodológica. Não apresentamos valores estimados como se fossem reais.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Limitações conhecidas</h2>
        <p className="text-secondary mb-4">
          A recolha está em fase inicial. O número de imóveis com avaliação completa é limitado
          pelas fontes gratuitas disponíveis. Conforme a base cresce, o número de imóveis rankeáveis
          e a cobertura geográfica aumentam.
        </p>
      </section>

      <Link href="/melhores" className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition">
        Ver os melhores imóveis
      </Link>
    </main>
  );
}
