"use client";

import { calculateValuation, formatCurrency, formatScoreText } from "@/lib/valuation";
import { calculateAuctionValuation } from "@/lib/auction";

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

export default function ValuationCard({ district, municipality, type, price, marketValue, rentability, sourceName, source, createdAt, isActive, isAuction, currentBid, auctionType, vpt, condominiumDebt, renovationEstimate }: ValuationCardProps) {
  const isAuctionBool = isAuction === true;

  // Usar cálculo de leilão se for leilão, senão uso normal
  const val = isAuctionBool
    ? calculateAuctionValuation({
        district,
        municipality: municipality || district,
        type,
        price,
        marketValue,
        source,
        sourceName,
        createdAt: createdAt ? new Date(createdAt) : null,
        isActive,
        sqm: 0, // Não temos área no card simplificado
        condominiumDebt: condominiumDebt || 0,
        renovationEstimate: renovationEstimate || 0,
      })
    : calculateValuation({
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

  const costBreakdown = isAuctionBool ? val.costBreakdown : null;

  return (
    <div className="border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">{isAuctionBool ? "Análise de Leilão" : "Análise de Oportunidade"}</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColors[val.risk as string]}`}>
          {riskLabels[val.risk as string]}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="text-5xl font-extrabold text-primary">{val.score}</div>
        <div className="text-sm text-secondary">/100</div>
        <div className="flex-1">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${val.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Custos do Leilão */}
      {isAuctionBool && costBreakdown && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-orange-700 uppercase mb-3">Custos Totais do Leilão</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Lance atual</span>
              <span className="font-medium">{formatCurrency(costBreakdown.basePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Comissão leiloeira</span>
              <span className="font-medium">{formatCurrency(costBreakdown.commission)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">IMT</span>
              <span className="font-medium">{formatCurrency(costBreakdown.imt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Imposto do Selo</span>
              <span className="font-medium">{formatCurrency(costBreakdown.stampDuty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Registo Predial</span>
              <span className="font-medium">{formatCurrency(costBreakdown.registrationFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Custas judiciais</span>
              <span className="font-medium">{formatCurrency(costBreakdown.courtCosts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Condomínio em atraso</span>
              <span className="font-medium">{formatCurrency(costBreakdown.condominiumDebt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Obras estimadas</span>
              <span className="font-medium">{formatCurrency(costBreakdown.renovationEstimate)}</span>
            </div>
            <div className="flex justify-between border-t border-orange-200 pt-2">
              <span className="text-sm font-medium text-secondary">Custos totais sem lance</span>
              <span className="font-bold text-orange-600">{formatCurrency(costBreakdown.totalCosts)}</span>
            </div>
            <div className="flex justify-between border-t border-orange-200 pt-2">
              <span className="text-sm font-medium text-secondary">Lance máximo sustentável</span>
              <span className="font-bold text-orange-700">{formatCurrency(costBreakdown.maxBid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-secondary">Margem remanescente</span>
              <span className={`text-xs font-bold ${costBreakdown.remainingMargin > 15 ? "text-success" : costBreakdown.remainingMargin > 5 ? "text-yellow-600" : "text-red-500"}`}>
                {costBreakdown.remainingMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Resultado Principal */}
      <div className="flex items-center gap-4 mt-4">
        <div className="text-5xl font-extrabold text-primary">{val.score}</div>
        <div className="text-sm text-secondary">/100</div>
        <div className="flex-1">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${val.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {Object.entries(val.factors).map(([key, value]) => {
          const labels: Record<string, string> = {
            discount: "Desconto",
            rentability: "Rentabilidade",
            pricePerSqm: "Preço/m²",
            liquidity: "Liquidez",
            source: "Fonte",
          };
          const maxValues: Record<string, number> = {
            discount: 30, rentability: 20, pricePerSqm: 25, liquidity: 15, source: 10,
          };
          return (
            <div key={key} className="bg-slate-50 p-2 rounded-lg">
              <div className="text-secondary">{labels[key as keyof typeof labels]}</div>
              <div className="font-bold">{value as number}/{maxValues[key as keyof typeof maxValues]}</div>
            </div>
          );
        })}
      </div>

      {/* Valuation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">
            Valor de mercado (AVM)
          </div>
          <div className="text-xl font-bold">{formatCurrency(val.avm)}</div>
          <div className="text-xs text-secondary">Confiança: {val.avmConfidence}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl">
          <div className="text-xs text-secondary uppercase font-semibold mb-1">
            Faixa de valor
          </div>
          <div className="text-sm font-bold">
            {formatCurrency(val.avmLow)} - {formatCurrency(val.avmHigh)}
          </div>
          <div className="text-xs text-secondary">{val.pricePerSqm}€/m² vs {val.marketAvgPerSqm}€/m² média</div>
        </div>
      </div>

      {/* AVM Factors */}
      <div className="grid grid-cols-5 gap-2 text-xs">
        {Object.entries(val.valuationFactors).map(([key, value]) => {
          const labels: Record<string, string> = {
            basePricePerSqm: "Base €/m²",
            typeMultiplier: "Tipo",
            municipalityPremium: "Localização",
            marketTrend: "Tendência",
            conditionFactor: "Condição",
          };
          return (
            <div key={key} className="bg-slate-50 p-2 rounded-lg text-center">
              <div className="text-secondary">{labels[key as keyof typeof labels]}</div>
    <div className="font-bold">{value as number}x</div>
            </div>
          );
        })}
      </div>
      <details className="text-xs text-secondary">
        <summary className="cursor-pointer hover:text-primary">Metodologia AVM</summary>
        <p className="mt-2">{val.methodology}</p>
      </details>

      {/* Factors */}
      {val.factors && (
        <div className="space-y-1">
          <div className="text-sm font-semibold text-secondary">Fatores de score</div>
          <ul className="text-sm space-y-1">
            {Object.entries(val.factors).map(([key, value]) => {
              const labels: Record<string, string> = {
                discount: "Desconto",
                rentability: "Rentabilidade",
                pricePerSqm: "Preço/m²",
                liquidity: "Liquidez",
                source: "Fonte",
              };
              return (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{labels[key as keyof typeof labels]}: {value as number}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm">{formatScoreText(val.score)}</p>
      </div>
    </div>
  );
}
