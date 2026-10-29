"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";

interface SourceReliabilityBadgeProps {
  sourceName: string;
  score: number;
}

export default function SourceReliabilityBadge({ sourceName, score }: SourceReliabilityBadgeProps) {
  const getLabel = (s: number) => {
    if (s >= 13) return "Alta confiabilidade";
    if (s >= 9) return "Média confiabilidade";
    if (s >= 6) return "Confiança média-baixa";
    return "Baixa confiabilidade";
  };

  const getColor = (s: number) => {
    if (s >= 13) return "text-success bg-green-50 border-green-200";
    if (s >= 9) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-500 bg-red-50 border-red-200";
  };

  return (
    <div className={`px-2 py-1 rounded text-xs font-bold border ${getColor(score)} flex items-center gap-1.5`}>
      {score >= 13 ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
      <span>{score}/15</span>
    </div>
  );
}
