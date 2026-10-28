import { calculateValuation, formatCurrency } from "@/lib/valuation";

interface ValuationCardProps {
  district: string;
  type: string;
  price: number;
  marketValue: number | null;
  rentability: number | null;
}

export default function ValuationCard({ district, type, price, marketValue, rentability }: ValuationCardProps) {
  const valuation = calculateValuation(district, type, price, 0, rentability || 0);

  const riskColors = {
    baixo: "text-success bg-green-50",
    médio: "text-yellow-600 bg-yellow-50",
    alto: "text-red-500 bg-red-50",
  };

  return (
    <div className="border rounded-2xl p-6 space-y-4">
      <h2 className="font-bold text-lg">Análise de Oportunidade</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">
            Valor estimado de mercado
          </div>
          <div className="text-xl font-bold">{formatCurrency(valuation.estimatedValue)}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">
            Preço/m²
          </div>
          <div className="text-xl font-bold">{valuation.pricePerSqm}€/m²</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-secondary">Score de oportunidade</div>
          <div className="text-3xl font-extrabold text-primary">{valuation.opportunityScore}/100</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${riskColors[valuation.riskLevel]}`}>
          Risco {valuation.riskLevel}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-secondary">Desconto vs. mercado</span>
          <span className="font-bold text-primary">{valuation.discountPct}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Rentabilidade estimada</span>
          <span className="font-bold">{valuation.yieldEstimate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Preço/m² médio da zona</span>
          <span className="font-medium">{valuation.marketAvgPerSqm}€/m²</span>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm">{valuation.recommendation}</p>
      </div>
    </div>
  );
}
