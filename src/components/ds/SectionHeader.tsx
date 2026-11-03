export interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-2 ${alignment} ${className ?? ""}`}>
      <p className="rp-eyebrow text-[var(--rp-cobalt)]">{eyebrow}</p>
      <h2 className="rp-display text-[32px] leading-[1.15] text-[var(--rp-ink)]">{title}</h2>
      {description ? (
        <p className="max-w-[62ch] text-[16px] leading-relaxed text-[var(--rp-ink-2)]">{description}</p>
      ) : null}
    </div>
  );
}
