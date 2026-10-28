import { calculateOpportunityScore, calculateAVM } from "@/lib/scoring";

interface ValuationCardProps {
  district: string;
  type: string;
  price: number;
  marketValue: number | null;
  rentability: number | null;
  sourceName: string;
  createdAt: string | null;
  isActive: boolean;
}

export default function ValuationCard({ district, type, price, marketValue, rentability, sourceName, createdAt, isActive }: ValuationCardProps) {
  const score = calculateOpportunityScore({
    price,
    marketValue,
    discountPct: marketValue ? Math.round(((marketValue - price) / marketValue) * 100) : null,
    rentability,
    sourceName,
    district,
    type,
    createdAt: createdAt ? new Date(createdAt) : null,
    isActive,
  });

  const avm = calculateAVM({ district, type, price, marketValue });

  const riskColors = {
    baixo: "text-success bg-green-50 border-green-200",
    médio: "text-yellow-600 bg-yellow-50 border-yellow-200",
    alto: "text-red-500 bg-red-50 border-red-200",
  };

  const riskLabels = {
    baixo: "Risco Baixo",
    médio: "Risco Médio",
    alto: "Risco Alto",
  };

  return (
    <div className="border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Análise de Oportunidade</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColors[score.riskLevel]}`}>
          {riskLabels[score.riskLevel]}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-extrabold text-primary">{score.total}</div>
        <div className="text-sm text-secondary">/100</div>
        <div className="flex-1">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${score.total}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {Object.entries(score.breakdown).map(([key, value]) => {
          const labels: Record<string, string> = {
            discount: "Desconto",
            rentability: "Rentabilidade",
            liquidity: "Liquidez",
            source: "Fonte",
            pricePerSqm: "Preço/m²",
            freshness: "Atualidade",
          };
          const maxValues: Record<string, number> = {
            discount: 30, rentability: 20, liquidity: 15, source: 15, pricePerSqm: 10, freshness: 10,
          };
          return (
            <div key={key} className="bg-slate-50 p-2 rounded-lg">
              <div className="text-secondary">{labels[key]}</div>
              <div className="font-bold">{value}/{maxValues[key]}</div>
            </div>
          );
        })}
      </div>

      {/* AVM */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">
            Valor estimado (AVM)
          </div>
          <div className="text-xl font-bold">{avm.estimatedValue.toLocaleString()}€</div>
          <div className="text-xs text-secondary">Confiança: {avm.confidence}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">
            Faixa de valor
          </div>
          <div className="text-sm font-bold">
            {avm.valuationRange.min.toLocaleString()}€ - {avm.valuationRange.max.toLocaleString()}€
          </div>
          <div className="text-xs text-secondary">{avm.pricePerSqm}€/m² vs {avm.marketAvgPerSqm}€/m² média</div>
        </div>
      </div>

      {/* Factors */}
      {score.factors.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-semibold text-secondary">Fatores</div>
          <ul className="text-sm space-y-1">
            {score.factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm">{score.recommendation}</p>
      </div>
    </div>
  );
}
