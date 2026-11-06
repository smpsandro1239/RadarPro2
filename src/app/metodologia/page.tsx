import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Metodologia — RadarPro Portugal",
  description: "Como o RadarPro calcula avaliações e scores de imóveis, e quais são as limitações.",
};

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        <ArrowLeft size={16} className="mr-1" />
        Voltar
      </Link>
      <h1 className="text-4xl font-extrabold mb-2">Metodologia</h1>
      <p className="text-xl text-secondary mb-8">Como o RadarPro avalia imóveis.</p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Motor de avaliação v2</h2>
        <p className="text-secondary mb-2">
          Avaliação combina: <strong>AVM hedónica</strong>, valor patrimonial (VPT/INE), renda (INE), valor de terreno e motor de leilões
          (compra em leilão via max_bid).
        </p>
        <p className="text-secondary">
          Cada imóvel recebe um <strong>score /100</strong> com fatores: desconto vs mercado, rendibilidade, liquidez de fonte, confiança.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Limitações</h2>
        <ul className="list-disc pl-6 text-secondary space-y-2">
          <li>Fontes gratuitas de imóveis em leilão são limitadas (Martelo.pt API pública).</li>
          <li>Preços de mercado: apenas ~25 municípios com mediana carregada.</li>
          <li>Comparáveis: mesmo distrito/município ±20% de área.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Fontes</h2>
        <p className="text-secondary">
          INE via flatin.pt, RSS Estamo (placeholder), API pública Martelo.pt. Imovirtual/Casa Sapo bloqueados.
        </p>
      </section>
    </main>
  );
}
