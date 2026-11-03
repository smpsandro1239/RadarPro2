"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ds/Button";
import PageShell from "@/components/ds/PageShell";

const plans = [
  {
    name: "Gratuito",
    price: "0€",
    period: "/mês",
    description: "Para começar a explorar",
    features: [
      "5 oportunidades por semana",
      "Acesso às oportunidades de Lisboa",
      "Score básico",
    ],
    priceId: null,
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mês",
    description: "Para investidores sérios",
    features: [
      "Oportunidades ilimitadas",
      "Todos os distritos de Portugal",
      "Score completo + rentabilidade",
      "Alertas por email",
      "Acesso a leilões e imóveis de banco",
      "Suporte prioritário",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_placeholder",
    cta: "Assinar Pro",
    highlight: true,
  },
];

export default function PrecosPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout(priceId: string | null) {
    if (!priceId) {
      router.push("/auth");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <PageShell
      eyebrow="Preços"
      title="Planos simples, sem surpresas"
      description="Cancele quando quiser. Sem permanência."
      backHref="/"
      backLabel="Voltar ao início"
    >
      <div className="grid max-w-[880px] gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`flex flex-col rounded-rp border bg-rp-surface p-7 ${
              plan.highlight ? "border-rp-cobalt shadow-rp-2" : "border-rp-line shadow-rp-1"
            }`}
          >
            {plan.highlight ? <p className="rp-eyebrow mb-2 text-rp-cobalt">Recomendado</p> : null}
            <h2 className="rp-display text-[26px] leading-tight text-rp-ink">{plan.name}</h2>
            <p className="mt-1 text-[14px] text-rp-muted">{plan.description}</p>

            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="rp-num text-[44px] leading-none text-rp-ink">{plan.price}</span>
              <span className="rp-num text-[13px] text-rp-muted">{plan.period}</span>
            </p>

            <ul className="mt-7 flex flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-[15px] leading-snug text-rp-ink-2">
                  <span aria-hidden="true" className="mt-[10px] h-[2px] w-2 shrink-0 bg-rp-cobalt" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <Button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading}
                variant={plan.highlight ? "primary" : "secondary"}
                size="lg"
                className="w-full"
              >
                {loading ? "A processar..." : plan.cta}
              </Button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-[70ch] text-[14px] leading-snug text-rp-muted">
        Mensalidade fixa, sem comissão sobre a compra.
      </p>
    </PageShell>
  );
}
