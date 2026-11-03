import Link from "next/link";

export interface SiteFooterProps {
  className?: string;
}

const FOOTER_LINKS = [
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/precos", label: "Preços" },
  { href: "/faq", label: "FAQ" },
  { href: "/mapa", label: "Mapa" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos" },
  { href: "/credito", label: "Crédito" },
];

const SECONDARY_TEXT = "text-[rgba(250,251,252,.72)]";

export default function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={`bg-rp-ink text-rp-surface ${className ?? ""}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-[rgba(250,251,252,.18)] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="rp-display text-[22px] leading-none">RadarPro</p>
            <p className={`mt-2 text-[13px] ${SECONDARY_TEXT}`}>
              Oportunidades imobiliárias em Portugal
            </p>
          </div>

          <nav aria-label="Ligações do rodapé">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`inline-flex min-h-11 items-center text-[13px] underline-offset-4 hover:text-rp-surface hover:underline ${SECONDARY_TEXT}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className={`text-[12px] ${SECONDARY_TEXT}`}>© 2026 RadarPro Portugal</p>
      </div>
    </footer>
  );
}
