import type { ReactNode } from "react";
import BackLink from "@/components/ds/BackLink";
import SiteFooter from "@/components/ds/SiteFooter";

export interface PageShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  footer?: boolean;
  wide?: boolean;
}

/**
 * Moldura das paginas interiores: fundo, largura de leitura, cabecalho e rodape.
 * As paginas usam apenas tokens `--rp-*`; os aliases legados ficam para a
 * pagina principal.
 */
export default function PageShell({
  children,
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel,
  footer = true,
  wide = false,
}: PageShellProps) {
  return (
    <main className="min-h-screen bg-rp-bg text-rp-ink">
      <div
        className={`mx-auto w-full px-4 pb-20 pt-8 sm:px-6 ${wide ? "max-w-[1400px]" : "max-w-[1200px]"}`}
      >
        {backHref ? <BackLink href={backHref} label={backLabel} /> : null}

        {title ? (
          <header className="mb-10 flex flex-col gap-5 border-b border-rp-line pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              {eyebrow ? <p className="rp-eyebrow text-rp-cobalt">{eyebrow}</p> : null}
              <h1 className="rp-display text-[38px] leading-[1.06] text-rp-ink sm:text-[48px]">{title}</h1>
              {description ? (
                <p className="max-w-[62ch] text-[16px] leading-relaxed text-rp-ink-2">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
          </header>
        ) : null}

        {children}
      </div>

      {footer ? <SiteFooter /> : null}
    </main>
  );
}
