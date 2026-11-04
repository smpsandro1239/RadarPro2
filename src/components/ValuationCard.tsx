"use client";

import { evaluateProperty } from "@/lib/valuation/index";
import { formatEuros } from "@/lib/format";
import type { ValuationResult } from "@/lib/valuation/types";

interface ValuationCardProps {
  district: string;
  municipality: string;
  type: string;
  price: number;
  marketValue: number | null;
  rentability: number | null;
  sourceName: string;
  source: string;
  createdAt: string | null;
  isActive: boolean;
  isAuction: boolean | null;
  currentBid: number | null;
  auctionType: string | null;
  vpt: number | null;
  condominiumDebt: number | null;
  renovationEstimate: number | null;
}

export default function ValuationCard({
  district,
  municipality,
  type,
  price,
  marketValue,
  rentability,
  sourceName,
  source,
  createdAt,
  isActive,
  isAuction,
  currentBid,
  auctionType,
  vpt,
  condominiumDebt,
  renovationEstimate,
}: ValuationCardProps) {
  const val: ValuationResult = evaluateProperty({
    district,
    municipality,
    type,
    price,
    marketValue: marketValue ?? undefined,
    source,
    sourceName,
    createdAt: createdAt ? new Date(createdAt) : null,
    isActive,
    isAuction: isAuction ?? false,
    auctionType: auctionType ?? undefined,
    currentBid: currentBid ?? undefined,
    vpt: vpt ?? undefined,
    condominiumDebt: condominiumDebt ?? undefined,
    renovationEstimate: renovationEstimate ?? undefined,
    rentability: rentability ?? undefined,
  });

  const confidenceLabel: Record<string, string> = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
    very_low: "Muito baixa",
  };

  const riskTone = val.score === null
    ? "border-rp-line text-rp-muted"
    : val.score >= 85
      ? "border-rp-cobalt text-rp-cobalt"
      : val.score >= 70
        ? "border-rp-amber text-rp-ink-2"
        : "border-rp-orange text-rp-anomaly";

  const riskLabel = val.score === null
    ? "Sem avaliação"
    : val.score >= 85
      ? "Risco Baixo"
      : val.score >= 70
        ? "Risco Médio"
        : "Risco Alto";

  const rangeLow = (val.breakdown.rangeLow as number | undefined) ?? val.valuation ?? 0;
  const rangeHigh = (val.breakdown.rangeHigh as number | undefined) ?? val.valuation ?? 0;
  const areaSqm = (val.breakdown.areaSqm as number | undefined) ?? null;
  const basePerSqm = (val.breakdown.basePerSqm as number | undefined) ?? (val.breakdown.adjustedPerSqm as number | undefined) ?? null;

  return (
    <section className="border border-rp-line bg-rp-surface p-5 shadow-rp-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rp-line pb-4">
        <h2 className="rp-display text-[24px] leading-tight text-rp-ink">Análise de Oportunidade</h2>
        <span className={`rp-eyebrow inline-flex items-center rounded-rp border px-2 py-[5px] text-[12px] ${riskTone}`}>
          {riskLabel}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <p className="rp-num text-[48px] leading-none text-rp-cobalt">
          {val.score !== null ? val.score : "—"}
        </p>
        <p className="rp-num text-[14px] text-rp-muted">/100</p>
        {val.score !== null && (
          <div className="h-3 flex-1 overflow-hidden rounded-rp border border-rp-line bg-rp-ceramic">
            <div
              className="h-full bg-rp-cobalt transition-[width] duration-[var(--rp-dur-3)] ease-[var(--rp-ease-1)]"
              style={{ width: `${val.score}%` }}
            />
          </div>
        )}
      </div>

      {Array.isArray(val.breakdown.scoreBadges) && val.breakdown.scoreBadges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(val.breakdown.scoreBadges as string[]).map((b, i) => (
            <span key={i} className="rp-eyebrow rounded-rp border border-rp-amber bg-rp-ceramic px-2 py-1 text-[11px] text-rp-ink-2">
              {b}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-rp-line bg-rp-ceramic p-3">
          <p className="rp-eyebrow text-rp-muted">Valor de mercado (AVM)</p>
          <p className="rp-num mt-1 text-[22px] leading-tight text-rp-ink">
            {val.valuation !== null ? formatEuros(val.valuation) : "Sem avaliação"}
          </p>
          <p className="mt-1 text-[12px] text-rp-muted">Confiança: {confidenceLabel[val.confidence] ?? val.confidence}</p>
        </div>
        <div className="border border-rp-line bg-rp-ceramic p-3">
          <p className="rp-eyebrow text-rp-muted">Faixa de valor</p>
          <p className="rp-num mt-1 text-[15px] font-medium text-rp-ink">
            {val.valuation !== null ? `${formatEuros(rangeLow)} - ${formatEuros(rangeHigh)}` : "—"}
          </p>
          <p className="mt-1 text-[12px] text-rp-muted">
            {areaSqm ? `${areaSqm} m²` : "Sem área"}{basePerSqm ? ` · ${basePerSqm}€/m² base` : ""}
          </p>
        </div>
      </div>

      {val.warnings && val.warnings.length > 0 && (
        <div className="mt-4 border-l-2 border-rp-orange bg-rp-ceramic p-3 text-[12px] text-rp-ink-2">
          <p className="rp-eyebrow text-rp-anomaly mb-1">Avisos</p>
          <ul className="list-disc pl-4">
            {val.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {val.assumptions && val.assumptions.length > 0 && (
        <details className="group mt-4 border border-rp-line bg-rp-ceramic p-3 text-[12px] text-rp-ink-2">
          <summary className="cursor-pointer font-medium text-rp-cobalt">Pressupostos</summary>
          <ul className="mt-2 list-disc pl-4">
            {val.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </details>
      )}

      <div className="mt-4 border-l-2 border-rp-cobalt bg-rp-ceramic p-4">
        <p className="text-[14px] text-rp-ink">
          {val.score !== null ? (val.score >= 85 ? "Excelente oportunidade" : val.score >= 70 ? "Boa oportunidade" : val.score >= 55 ? "Oportunidade razoável" : "Oportunidade fraca") : "Sem avaliação disponível"}
        </p>
      </div>
    </section>
  );
}