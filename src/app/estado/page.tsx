import Link from "next/link";
import { Activity } from "lucide-react";

export const metadata = {
  title: "Estado — RadarPro Portugal",
  description: "Transparência operacional do RadarPro: imóveis rastreados, cobertura, fontes e metodologia.",
};

export default function EstadoPage() {
  const stats = [
    { label: "Imóveis scrape ativos", value: "72" },
    { label: "Imóveis com score", value: "34" },
    { label: "Distritos com imóveis", value: "~10" },
    { label: "Leilões ativos", value: "57" },
  ];

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block">
        Voltar
      </Link>
      <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
        <Activity className="text-primary" size={32} />
        Estado do RadarPro
      </h1>
      <p className="text-xl text-secondary mb-8">Transparência operacional.</p>

      <section className="mb-10 space-y-4">
        {stats.map((s) => (
          <div key={s.label} className="border rounded-2xl p-6 flex items-center justify-between">
            <span className="text-secondary">{s.label}</span>
            <span className="text-2xl font-bold text-primary">{s.value}</span>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Fontes</h2>
        <p className="text-secondary">
          Imóveis reais via scrape (Martelo.pt, Casa Sapo). Bancos/leilões: bloqueados. Fontes gratuitas para leilões com lances variáveis: esgotadas.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Como funciona o score</h2>
        <p className="text-secondary">
          Ver <Link href="/metodologia" className="text-primary hover:underline">a metodologia</Link>.
        </p>
      </section>
    </main>
  );
}
