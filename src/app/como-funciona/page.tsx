import { Search, TrendingDown, Bell, CheckCircle } from "lucide-react";
import Button from "@/components/ds/Button";
import PageShell from "@/components/ds/PageShell";

const STEPS = [
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

export default function ComoFuncionaPage() {
  return (
    <PageShell
      eyebrow="Guia"
      title="Como funciona"
      description="Sem experiência. Sem conhecimentos técnicos. Apenas oportunidades reais."
      backHref="/"
      backLabel="Voltar ao início"
    >
      <ol className="border-t border-rp-line">
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-5 border-b border-rp-line py-8 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-x-8"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-rp border border-rp-line bg-rp-surface text-rp-cobalt shadow-rp-1">
              <step.icon size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="rp-display text-[22px] leading-tight text-rp-ink">{step.title}</h2>
              <p className="mt-2 max-w-[62ch] text-[16px] leading-[1.55] text-rp-ink-2">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button href="/oportunidades" variant="primary" size="lg">
          Explorar a cidade
        </Button>
        <Button href="/precos" variant="link" size="lg">
          Planos simples, sem surpresas
        </Button>
      </div>
    </PageShell>
  );
}
