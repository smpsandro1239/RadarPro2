import Button from "@/components/ds/Button";
import PageShell from "@/components/ds/PageShell";

const faqs = [
  {
    q: "O que é o RadarPro Portugal?",
    a: "Uma plataforma que deteta e analisa oportunidades imobiliárias abaixo do preço de mercado. Centraliza propriedades dispersas ou com pouca visibilidade e filtra-as previamente para saber se têm potencial antes de comprar.",
  },
  {
    q: "O RadarPro é só para investidores?",
    a: "Não. Serve tanto investidores como quem procura casa para viver. O score e a rentabilidade ajudam a tomar decisões informadas.",
  },
  {
    q: "É seguro comprar estas oportunidades?",
    a: "As oportunidades vêm de fontes oficiais (bancos, leilões judiciais, portais). Recomendamos sempre verificação jurídica antes de comprar. O RadarPro não media transações.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem permanência nem contratos. Cancele a qualquer momento.",
  },
  {
    q: "O que é o Score de um anúncio?",
    a: "Um valor de 0 a 100 que combina desconto face ao mercado, rentabilidade estimada e liquidez da zona.",
  },
  {
    q: "Que distritos estão cobertos?",
    a: "Atualmente Lisboa, Porto e Braga, com expansão planeada para todo o país.",
  },
];

export default function FAQPage() {
  return (
    <PageShell
      eyebrow="Perguntas frequentes"
      title="As dúvidas que mais nos chegam"
      backHref="/"
      backLabel="Voltar ao início"
    >
      <div className="max-w-[820px] border-t border-rp-line">
        {faqs.map((faq) => (
          <details key={faq.q} className="group border-b border-rp-line">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[17px] font-semibold leading-snug text-rp-ink transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:text-rp-cobalt [&::-webkit-details-marker]:hidden">
              <span>{faq.q}</span>
              <span aria-hidden="true" className="rp-num mt-[3px] shrink-0 text-rp-cobalt group-open:hidden">
                +
              </span>
              <span aria-hidden="true" className="rp-num mt-[3px] hidden shrink-0 text-rp-cobalt group-open:inline">
                −
              </span>
            </summary>
            <p className="max-w-[70ch] pb-6 text-[16px] leading-[1.55] text-rp-ink-2">{faq.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10">
        <Button href="/como-funciona" variant="link" size="lg">
          Ver como calculamos o valor →
        </Button>
      </div>
    </PageShell>
  );
}
