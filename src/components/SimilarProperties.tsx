import Link from "next/link";
import { MapPin } from "lucide-react";
import { findComparables } from "@/lib/valuation/comparables";
import { formatEuros, formatScoreOutOf100 } from "@/lib/format";

interface Props {
  currentPropertyId: string;
  district: string;
  municipality: string;
  type: string;
  price: number;
  sqm: number | null;
}

export default async function SimilarProperties({
  currentPropertyId,
  district,
  municipality,
  type,
  price,
  sqm,
}: Props) {
  const comparables = await findComparables(currentPropertyId, district, municipality, type, sqm, 3);
  const currentPricePerSqm = sqm && sqm > 0 ? price / sqm : null;
  const pricedComparables = comparables.filter((c) => c.pricePerSqm !== null);
  const comparableAvg = pricedComparables.length > 0 ? pricedComparables.reduce((acc, c) => acc + (c.pricePerSqm ?? 0), 0) / pricedComparables.length : null;

  return (
    <div className="border-t pt-6 mt-6">
      <h2 className="font-bold text-lg mb-4">Imóveis semelhantes</h2>
      {comparables.length === 0 ? (
        <p className="text-secondary">Ainda não há imóveis similares registados nesta zona.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {comparables.map((comp) => (
              <Link
                key={comp.id}
                href={`/imovel/${comp.id}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition group block"
              >
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate">{comp.title ?? comp.id}</h3>
                  <div className="flex items-center text-xs text-secondary mt-1">
                    <MapPin size={12} className="mr-1" />
                    {municipality}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-sm">{formatEuros(comp.price)}</span>
                    <span className="text-xs text-primary font-bold">{formatEuros(comp.pricePerSqm)}/m²</span>
                  </div>
                  <div className="text-xs text-secondary mt-1">Score: {formatScoreOutOf100(comp.score)}</div>
                </div>
              </Link>
            ))}
          </div>
          {comparableAvg !== null && currentPricePerSqm !== null && (
            <div className="mt-6 border rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4">Comparação com a zona</h2>
              <p className="text-secondary mb-2">
                Este imóvel: <span className="font-bold text-foreground">{formatEuros(currentPricePerSqm)}/m²</span>
              </p>
              <p className="text-secondary mb-2">
                Média de imóveis semelhantes: <span className="font-bold text-foreground">{formatEuros(comparableAvg)}/m²</span>
              </p>
              {currentPricePerSqm < comparableAvg ? (
                <p className="text-success font-bold">→ {Math.round(((comparableAvg - currentPricePerSqm) / comparableAvg) * 100)}% abaixo da média dos comparáveis</p>
              ) : (
                <p className="text-foreground font-bold">→ acima da média dos comparáveis</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
