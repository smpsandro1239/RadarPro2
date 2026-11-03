"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";

interface SourceReliabilityBadgeProps {
  sourceName: string;
  score: number | null;
}

export default function SourceReliabilityBadge({ sourceName, score }: SourceReliabilityBadgeProps) {
  const getLabel = (s: number | null) => {
    if (s === null) return "Sem avaliação";
    if (s >= 13) return "Alta confiabilidade";
    if (s >= 9) return "Média confiabilidade";
    if (s >= 6) return "Confiança média-baixa";
    return "Baixa confiabilidade";
  };

  const getTone = (s: number | null) => {
    if (s === null) return "border-rp-line bg-rp-surface text-rp-muted";
    if (s >= 13) return "border-rp-cobalt bg-rp-surface text-rp-cobalt";
    if (s >= 9) return "border-rp-amber bg-rp-surface text-rp-ink-2";
    return "border-rp-orange bg-rp-surface text-rp-anomaly";
  };

  const label = getLabel(score);

  return (
    <span
      className={`rp-eyebrow inline-flex items-center gap-1.5 rounded-rp border px-2 py-[5px] text-[12px] ${getTone(score)}`}
      title={`${sourceName}: ${label}`}
      aria-label={`${sourceName}: ${label}`}
    >
      {score !== null && (score >= 13 ? <ShieldCheck size={12} aria-hidden="true" /> : <ShieldAlert size={12} aria-hidden="true" />)}
      <span className="rp-num">{score === null ? label : `${score}/15`}</span>
    </span>
  );
}
