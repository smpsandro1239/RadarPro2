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

  const riskColors: Record<string, string> = {
    baixo: "text-success bg-green-50 border-green-200",
    medio: "text-yellow-600 bg-yellow-50 border-yellow-200",
    alto: "text-red-500 bg-red-50 border-red-200",
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
    <div className="border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Análise de Oportunidade</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColors[val.risk]}`}>
          {riskLabels[val.risk]}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-5xl font-extrabold text-primary">{val.score}</div>
        <div className="text-sm text-secondary">/100</div>
        <div className="flex-1">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${val.score}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {Object.entries(val.factors).map(([key, value]) => (
          <div key={key} className="bg-slate-50 p-2 rounded-lg text-center">
            <div className="text-secondary">{factorLabels[key]}</div>
            <div className="font-bold">{value}/{maxValues[key]}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">
            Valor de mercado (AVM)
          </div>
          <div className="text-xl font-bold">{formatCurrency(val.avm)}</div>
          <div className="text-xs text-secondary">Confiança: {val.avmConfidence}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">Faixa de valor</div>
          <div className="text-sm font-bold">{formatCurrency(val.avmLow)} - {formatCurrency(val.avmHigh)}</div>
          <div className="text-xs text-secondary">{val.pricePerSqm}€/m² vs {val.marketAvgPerSqm}€/m² média</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-xs">
        {Object.entries(val.valuationFactors).map(([key, value]) => (
          <div key={key} className="bg-slate-50 p-2 rounded-lg text-center">
            <div className="text-secondary">{valuationFactorLabels[key]}</div>
            <div className="font-bold">{value}x</div>
          </div>
        ))}
      </div>

      <details className="text-xs text-secondary">
        <summary className="cursor-pointer hover:text-primary">Metodologia AVM</summary>
        <p className="mt-2">{val.methodology}</p>
      </details>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm">{formatScoreText(val.score)}</p>
      </div>
    </div>
  );
}
