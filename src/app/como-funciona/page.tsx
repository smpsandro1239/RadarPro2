import { Search, TrendingDown, Bell, CheckCircle } from "lucide-react";

export default function ComoFuncionaPage() {
  const steps = [
    {
      icon: Search,
      title: "1. Escolha onde quer comprar",
      desc: "Selecione o distrito e o tipo de imóvel que procura.",
    },
    {
      icon: TrendingDown,
      title: "2. Detecte o desconto ao instante",
      desc: "Cada imóvel mostra quanto pode poupar face ao preço de mercado.",
    },
    {
      icon: Bell,
      title: "3. Receba alertas",
      desc: "Seja notificado quando novas oportunidades aparecem na sua zona.",
    },
    {
      icon: CheckCircle,
      title: "4. Compre com vantagem",
      desc: "Aceda ao anúncio original e aja antes dos outros compradores.",
    },
  ];

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-4">Como funciona</h1>
      <p className="text-xl text-secondary mb-12">
        Sem experiência. Sem conhecimentos técnicos. Apenas oportunidades reais.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {steps.map((step) => (
          <div key={step.title} className="border rounded-2xl p-6">
            <step.icon size={32} className="text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">{step.title}</h2>
            <p className="text-secondary">{step.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
