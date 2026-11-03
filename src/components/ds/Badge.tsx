export type BadgeKind =
  | "opportunity"
  | "to-verify"
  | "no-valuation"
  | "confidence-high"
  | "confidence-medium"
  | "confidence-low";

export interface BadgeProps {
  kind: BadgeKind;
  label?: string;
  className?: string;
}

const DEFAULT_LABELS: Record<BadgeKind, string> = {
  opportunity: "Oportunidade",
  "to-verify": "A verificar",
  "no-valuation": "Sem avaliação",
  "confidence-high": "Confiança alta",
  "confidence-medium": "Confiança média",
  "confidence-low": "Confiança baixa",
};

const TONES: Record<BadgeKind, string> = {
  opportunity: "bg-[rgba(242,107,58,.14)] border-[var(--rp-orange)] text-[var(--rp-anomaly)]",
  "to-verify": "bg-[rgba(224,160,48,.18)] border-[var(--rp-amber)] text-[var(--rp-ink-2)]",
  "no-valuation": "bg-rp-ceramic border-rp-line text-rp-muted",
  "confidence-high": "bg-rp-ceramic border-rp-line text-[var(--rp-cobalt)]",
  "confidence-medium": "bg-rp-ceramic border-rp-line text-[var(--rp-ink-2)]",
  "confidence-low": "bg-rp-ceramic border-rp-line text-[var(--rp-anomaly)]",
};

export default function Badge({ kind, label, className }: BadgeProps) {
  return (
    <span
      className={`rp-eyebrow inline-flex items-center rounded-rp border px-2 py-[3px] text-[12px] ${TONES[kind]} ${
        className ?? ""
      }`}
    >
      {label ?? DEFAULT_LABELS[kind]}
    </span>
  );
}
