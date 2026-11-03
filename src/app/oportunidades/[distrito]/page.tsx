import { getPropertiesByDistrict } from "@/lib/queries";
import PropertyCard from "@/components/PropertyCard";
import EmptyState from "@/components/ds/EmptyState";
import PageShell from "@/components/ds/PageShell";

const districtNames: Record<string, string> = {
  lisboa: "Lisboa",
  porto: "Porto",
  braga: "Braga",
};

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ distrito: string }>;
}) {
  const { distrito } = await params;
  const districtName = districtNames[distrito.toLowerCase()] || distrito;
  const properties = await getPropertiesByDistrict(districtName);

  return (
    <PageShell
      eyebrow="Oportunidades"
      title={`Oportunidades em ${districtName}`}
      description={`${properties.length} imóveis abaixo do preço de mercado em ${districtName}`}
      backHref="/"
      backLabel="Voltar"
    >
      {properties.length === 0 ? (
        <EmptyState title="Nenhum imóvel encontrado neste distrito." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <PropertyCard
              key={prop.id}
              id={prop.id}
              title={prop.title}
              district={prop.district}
              municipality={prop.municipality}
              sourceName={prop.sourceName}
              source={prop.source}
              price={prop.price}
              marketValue={prop.marketValue}
              discountPct={prop.discountPct}
              score={prop.score}
              type={prop.type}
              images={prop.images}
              isAuction={prop.isAuction}
              auctionEndDate={prop.auctionEndDate}
              checkStatus={prop.checkStatus}
              currentBid={prop.currentBid}
              maxBid={prop.maxBid}
              valuationConfidence={prop.valuationConfidence}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
