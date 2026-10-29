import { calculateValuation } from "@/lib/valuation";

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

  const riskLabels = {
    baixo: "Risco Baixo",
    medio: "Risco Médio",
    alto: "Risco Alto",
  };

  return (
    <div className="border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Análise de Oportunidade</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColors[val.risk]}\}>
          {riskLabels[val.risk]}
        </div>
      </div>
      ...
    </div>
  );
}
