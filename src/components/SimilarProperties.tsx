import { getAllActiveProperties } from "@/lib/queries";
import DsPropertyCard from "@/components/ds/PropertyCard";
import SectionHeader from "@/components/ds/SectionHeader";
import { formatOptional, formatScoreOutOf100 } from "@/lib/format";

interface Props {
  currentPropertyId: string;
  district: string;
  type: string;
  price: number;
}

function firstImage(images: string | null): string | null {
  if (!images) return null;
  try {
    const parsed: unknown = JSON.parse(images);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
  } catch {
    return null;
  }
  return null;
}

function proxiedImage(images: string | null): string | null {
  const url = firstImage(images);
  return url ? `/api/img?u=${encodeURIComponent(url)}` : null;
}

export default async function SimilarProperties({ currentPropertyId, district, type, price }: Props) {
  const allProperties = await getAllActiveProperties();

  // Find similar properties: same district, similar price range (±30%), different property
  const similar = allProperties
    .filter((p) => {
      if (p.id === currentPropertyId) return false;
      if (p.district !== district) return false;
      const priceDiff = Math.abs(p.price - price) / price;
      return priceDiff <= 0.4; // within 40% price range
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16 border-t border-rp-line pt-10">
      <SectionHeader
        eyebrow="Comparáveis"
        title="Imóveis semelhantes"
        description="Outros anúncios do mesmo distrito, dentro de 40% deste preço."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {similar.map((prop) => {
          const imageUrl = proxiedImage(prop.images);
          const discount = formatOptional(prop.discountPct === null ? null : -prop.discountPct, "%");

          const badges = [
            { kind: "confidence-medium" as const, label: formatScoreOutOf100(prop.score) },
            ...(prop.discountPct !== null
              ? [{ kind: "opportunity" as const, label: discount }]
              : []),
            ...(prop.marketValue === null
              ? [{ kind: "no-valuation" as const }]
              : []),
          ];

          return (
            <DsPropertyCard
              key={prop.id}
              title={prop.title}
              location={prop.municipality}
              askingPrice={prop.price}
              estimatedValue={prop.marketValue}
              badges={badges}
              href={`/imovel/${prop.id}`}
              source={prop.sourceName}
              imageUrl={imageUrl}
              imageAlt={prop.title}
              status={prop.checkStatus === "ok" ? "estimated" : "to-verify"}
            />
          );
        })}
      </div>
    </section>
  );
}
