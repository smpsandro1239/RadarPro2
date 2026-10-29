import { getPropertiesByDistrict } from "@/lib/queries";
import { MapPin, TrendingDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PropertyImage from "@/components/PropertyImage";

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((prop) => {
          const images = prop.images ? JSON.parse(prop.images) : [];
          const imageUrl = images[0] || null;
          return (
            <Link
              key={prop.id}
              href={`/imovel/${prop.id}`}
              className="border rounded-2xl overflow-hidden hover:shadow-xl transition group block"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                <PropertyImage src={imageUrl} alt={prop.title} fill className="group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm z-10">
                  {prop.sourceName}
                </div>
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold z-10">
                  {prop.score}/100
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg truncate mb-2">{prop.title}</h3>
                <div className="flex items-center text-sm text-secondary mb-4">
                  <MapPin size={14} className="mr-1" />
                  {prop.municipality}, {prop.district}
                </div>
                <div className="grid grid-cols-2 gap-4 border-y py-4 mb-4">
                  <div>
                    <div className="text-xs text-secondary uppercase font-semibold">
                      Preço
                    </div>
                    <div className="text-lg font-bold">
                      {prop.price.toLocaleString()}€
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary uppercase font-semibold">
                      Valorização
                    </div>
                    <div className="text-lg font-bold text-success">
                      {prop.marketValue?.toLocaleString()}€
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-primary font-bold">
                  <TrendingDown size={18} className="mr-1" />
                  -{prop.discountPct}%
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
