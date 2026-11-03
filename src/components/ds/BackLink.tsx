import Link from "next/link";

export interface BackLinkProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackLink({ href, label = "Voltar", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`rp-eyebrow inline-flex min-h-11 items-center gap-2 text-rp-cobalt underline decoration-[1px] underline-offset-4 transition-colors duration-[var(--rp-dur-1)] hover:text-rp-ink hover:decoration-2 ${className ?? ""}`}
    >
      <span aria-hidden="true">&larr;</span>
      {label}
    </Link>
  );
}
