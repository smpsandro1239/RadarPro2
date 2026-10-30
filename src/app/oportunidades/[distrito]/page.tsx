import { getPropertiesByDistrict } from "@/lib/queries";
import PropertyCard from "@/components/PropertyCard";

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
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-2">
        Oportunidades em {districtName}
      </h1>
      <p className="text-secondary mb-8">
        {properties.length} imóveis abaixo do preço de mercado em {districtName}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-16 text-secondary">
          Nenhum imóvel encontrado neste distrito.
        </div>
      )}
    </main>
  );
}
