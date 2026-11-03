import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, Bell, Check, LineChart, Target } from "lucide-react";
import PageShell from "@/components/ds/PageShell";
import SectionHeader from "@/components/ds/SectionHeader";
import Button from "@/components/ds/Button";

const PLANS = [
  {
    name: "Básico",
    price: "49€",
    period: "/mês",
    features: [
      "Até 10 anúncios ativos",
      "Destaque na listagem",
      "Relatório mensal",
      "Suporte por email",
    ],
    cta: "Começar",
    recommended: false,
  },
  {
    name: "Profissional",
    price: "99€",
    period: "/mês",
    features: [
      "Até 50 anúncios ativos",
      "Destaque prioritário",
      "Relatório semanal",
      "Alertas de leads",
      "Suporte prioritário",
      "API de integração",
    ],
    cta: "Começar",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    features: [
      "Anúncios ilimitados",
      "Feed automático (XML/API)",
      "Relatórios personalizados",
      "Gestor de conta dedicado",
      "SLA garantido",
    ],
    cta: "Contactar",
    recommended: false,
  },
];

const BENEFITS = [
  {
    icon: Target,
    title: "Público qualificado",
    description:
      "Utilizadores que procuram ativamente oportunidades imobiliárias com desconto.",
  },
  {
    icon: LineChart,
    title: "Score de oportunidade",
    description:
      "Cada anúncio recebe um score automático que ajuda os compradores a decidir.",
  },
  {
    icon: Bell,
    title: "Alertas automáticos",
    description:
      "Os seus anúncios são enviados por email aos utilizadores com pesquisas correspondentes.",
  },
  {
    icon: BarChart3,
    title: "Relatórios detalhados",
    description: "Visualizações, cliques e leads por anúncio.",
  },
];

const FIELD =
  "w-full min-h-11 rounded-rp border border-rp-line bg-rp-surface px-4 py-2 text-[15px] text-rp-ink focus:border-rp-cobalt focus:outline-none";

export default async function AgenciasPage() {
  const session = await getSession();
  if (!session) redirect("/auth");

  return (
    <PageShell
      eyebrow="Agências"
      title="Portal para agências imobiliárias"
      description="Publique os seus imóveis no RadarPro Portugal e alcance mais compradores."
      backHref="/"
      backLabel="Voltar ao início"
    >
      {/* Pricing for agencies */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={`flex flex-col border bg-rp-surface p-6 ${
              plan.recommended
                ? "border-rp-cobalt shadow-rp-2"
                : "border-rp-line shadow-rp-1"
            }`}
          >
            {plan.recommended ? (
              <p className="rp-eyebrow mb-2 text-rp-cobalt">Recomendado</p>
            ) : null}
            <h2 className="rp-display text-[22px] leading-tight text-rp-ink">{plan.name}</h2>
            <p className="rp-num mt-2 text-[32px] leading-none text-rp-ink">
              {plan.price}
              {plan.period ? (
                <span className="ml-1 text-[14px] text-rp-muted">{plan.period}</span>
              ) : null}
            </p>
            <ul className="my-6 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[15px] leading-snug text-rp-ink-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-rp-cobalt" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant={plan.recommended ? "primary" : "secondary"}
              size="md"
              className="mt-auto w-full"
            >
              {plan.cta}
            </Button>
          </article>
        ))}
      </div>

      {/* Benefits */}
      <section className="mb-12">
        <SectionHeader
          eyebrow="Porquê publicar no RadarPro?"
          title="O que ganha quem publica aqui"
        />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="flex gap-4 border-l-2 border-rp-cobalt pl-4">
                <Icon size={22} className="mt-1 shrink-0 text-rp-cobalt" aria-hidden="true" />
                <div>
                  <h3 className="text-[16px] font-semibold text-rp-ink">{benefit.title}</h3>
                  <p className="mt-1 max-w-[52ch] text-[15px] leading-relaxed text-rp-ink-2">
                    {benefit.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Contact form */}
      <section className="border border-rp-line bg-rp-surface p-8">
        <SectionHeader eyebrow="Contacto" title="Contacte-nos" description="Preencha o formulário e entraremos em contacto." />
        <form className="mt-6 grid max-w-lg gap-4">
          <div>
            <label htmlFor="agencia-nome" className="rp-eyebrow mb-1 block text-rp-muted">
              Nome da agência
            </label>
            <input id="agencia-nome" type="text" className={FIELD} />
          </div>
          <div>
            <label htmlFor="agencia-email" className="rp-eyebrow mb-1 block text-rp-muted">
              Email
            </label>
            <input id="agencia-email" type="email" className={FIELD} />
          </div>
          <div>
            <label htmlFor="agencia-telefone" className="rp-eyebrow mb-1 block text-rp-muted">
              Telefone
            </label>
            <input id="agencia-telefone" type="tel" className={FIELD} />
          </div>
          <div>
            <label htmlFor="agencia-mensagem" className="rp-eyebrow mb-1 block text-rp-muted">
              Mensagem
            </label>
            <textarea id="agencia-mensagem" rows={4} className={FIELD} />
          </div>
          <div>
            <Button type="submit" variant="primary" size="lg">
              Enviar
            </Button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
