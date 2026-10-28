"use client";

import { useState } from "react";
import { getSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen">
      <nav className="p-6 border-b flex justify-between items-center max-w-7xl mx-auto">
        <a href="/" className="text-2xl font-bold tracking-tight text-primary">
          RadarPro <span className="text-foreground">Portugal</span>
        </a>
      </nav>

      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4">
          Planos simples, sem surpresas
        </h1>
        <p className="text-xl text-secondary mb-12">
          Cancele quando quiser. Sem permanência.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-2xl p-8 ${
                plan.highlight
                  ? "border-primary shadow-xl scale-105"
                  : "border-slate-200"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-bold text-primary mb-2">
                  RECOMENDADO
                </div>
              )}
              <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
              <p className="text-secondary text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-secondary">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-success">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold transition ${
                  plan.highlight
                    ? "bg-primary text-white hover:opacity-90"
                    : "bg-slate-100 text-foreground hover:bg-slate-200"
                } disabled:opacity-50`}
              >
                {loading ? "A processar..." : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
