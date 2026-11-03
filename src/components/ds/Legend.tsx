import type { CSSProperties } from "react";

export type LegendTone = "solid" | "ghost" | "opportunity" | "anomaly" | "road" | "park" | "water";

export interface LegendItem {
  label: string;
  tone: LegendTone;
}

export interface LegendProps {
  items: LegendItem[];
  className?: string;
}

const TONE_STYLES: Record<LegendTone, CSSProperties> = {
  solid: { backgroundColor: "var(--rp-ink)" },
  ghost: { backgroundColor: "rgba(31,79,163,.28)", border: "1px solid var(--rp-cobalt)" },
  opportunity: { backgroundColor: "var(--rp-orange)" },
  anomaly: {
    backgroundColor: "rgba(224,160,48,.18)",
    backgroundImage: "repeating-linear-gradient(45deg, rgba(224,160,48,.55) 0 4px, transparent 4px 8px)",
    border: "1px solid var(--rp-anomaly)",
  },
  road: { backgroundColor: "var(--rp-ink)" },
  park: { backgroundColor: "rgba(169,205,180,.9)" },
  water: { backgroundColor: "rgba(141,179,224,.9)" },
};

export default function Legend({ items, className }: LegendProps) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className ?? ""}`}>
      {items.map((item) => (
        <li
          key={`${item.tone}-${item.label}`}
          className="inline-flex items-center gap-2 text-[12px] text-[var(--rp-ink-2)]"
        >
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 rounded-rp"
            style={TONE_STYLES[item.tone]}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
