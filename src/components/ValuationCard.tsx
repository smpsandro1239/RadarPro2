"use client";

import { calculateValuation, formatCurrency, formatScoreText } from "@/lib/valuation";

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
  const val = calculateValuation({
    district,
    municipality,
    type,
    price,
    marketValue: marketValue ?? undefined,
    source,
    sourceName,
    createdAt: createdAt ? new Date(createdAt) : null,
    isActive,
  });

  const riskTones: Record<string, string> = {
    baixo: "border-rp-cobalt text-rp-cobalt",
    medio: "border-rp-amber text-rp-ink-2",
    alto: "border-rp-orange text-rp-anomaly",
  };

  const riskLabels: Record<string, string> = {
    baixo: "Risco Baixo",
    medio: "Risco Médio",
    alto: "Risco Alto",
  };

  const factorLabels: Record<string, string> = {
    discount: "Desconto",
    rentability: "Rentabilidade",
    pricePerSqm: "Preço/m²",
    liquidity: "Liquidez",
    source: "Fonte",
  };

  const maxValues: Record<string, number> = {
    discount: 30,
    rentability: 20,
    pricePerSqm: 25,
    liquidity: 15,
    source: 10,
  };

  const valuationFactorLabels: Record<string, string> = {
    basePricePerSqm: "Preço/m² base",
    typeMultiplier: "Tipo",
    municipalityPremium: "Localização",
    marketTrend: "Tendência",
    conditionFactor: "Condição",
  };

  return (
    <section className="border border-rp-line bg-rp-surface p-5 shadow-rp-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rp-line pb-4">
        <h2 className="rp-display text-[24px] leading-tight text-rp-ink">Análise de Oportunidade</h2>
        <span
          className={`rp-eyebrow inline-flex items-center rounded-rp border px-2 py-[5px] text-[12px] ${riskTones[val.risk]}`}
        >
          {riskLabels[val.risk]}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <p className="rp-num text-[48px] leading-none text-rp-cobalt">{val.score}</p>
        <p className="rp-num text-[14px] text-rp-muted">/100</p>
        <div className="h-3 flex-1 overflow-hidden rounded-rp border border-rp-line bg-rp-ceramic">
          <div
            className="h-full bg-rp-cobalt transition-[width] duration-[var(--rp-dur-3)] ease-[var(--rp-ease-1)]"
            style={{ width: `${val.score}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(val.factors).map(([key, value]) => (
          <div key={key} className="border border-rp-line bg-rp-ceramic p-2 text-center">
            <p className="text-rp-muted">{factorLabels[key]}</p>
            <p className="rp-num mt-1 font-medium text-rp-ink">
              {value}/{maxValues[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-rp-line bg-rp-ceramic p-3">
          <p className="rp-eyebrow text-rp-muted">Valor de mercado (AVM)</p>
          <p className="rp-num mt-1 text-[22px] leading-tight text-rp-ink">{formatCurrency(val.avm)}</p>
          <p className="mt-1 text-[12px] text-rp-muted">Confiança: {val.avmConfidence}</p>
        </div>
        <div className="border border-rp-line bg-rp-ceramic p-3">
          <p className="rp-eyebrow text-rp-muted">Faixa de valor</p>
          <p className="rp-num mt-1 text-[15px] font-medium text-rp-ink">
            {formatCurrency(val.avmLow)} - {formatCurrency(val.avmHigh)}
          </p>
          <p className="mt-1 text-[12px] text-rp-muted">
            {val.pricePerSqm}€/m² vs {val.marketAvgPerSqm}€/m² média
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(val.valuationFactors).map(([key, value]) => (
          <div key={key} className="border border-rp-line bg-rp-ceramic p-2 text-center">
            <p className="text-rp-muted">{valuationFactorLabels[key]}</p>
            <p className="rp-num mt-1 font-medium text-rp-ink">{value}x</p>
          </div>
        ))}
      </div>

      <details className="group mt-4 border border-rp-line bg-rp-ceramic p-3 text-[12px] text-rp-ink-2">
        <summary className="cursor-pointer font-medium text-rp-cobalt transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:text-rp-ink">
          Metodologia AVM
        </summary>
        <p className="mt-2 leading-relaxed">{val.methodology}</p>
      </details>

      <div className="mt-4 border-l-2 border-rp-cobalt bg-rp-ceramic p-4">
        <p className="text-[14px] text-rp-ink">{formatScoreText(val.score)}</p>
      </div>
    </section>
  );
}
