import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { getAllActiveProperties } from "@/lib/queries";
import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingDown } from "lucide-react";
import PropertyImage from "@/components/PropertyImage";

interface Props {
  currentPropertyId: string;
  district: string;
  type: string;
  price: number;
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
    <div className="border-t pt-6 mt-6">
      <h2 className="font-bold text-lg mb-4">Imóveis semelhantes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {similar.map((prop) => {
          const images = prop.images ? JSON.parse(prop.images) : [];
          const imageUrl = images[0] || null;
          return (
            <Link
              key={prop.id}
              href={`/imovel/${prop.id}`}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition group block"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                <PropertyImage src={imageUrl} alt={prop.title} fill className="group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2 bg-primary text-white px-2 py-0.5 rounded text-xs font-bold z-10">
                  {prop.score}/100
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate">{prop.title}</h3>
                <div className="flex items-center text-xs text-secondary mt-1">
                  <MapPin size={12} className="mr-1" />
                  {prop.municipality}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm">{prop.price.toLocaleString()}€</span>
                  <span className="text-xs text-primary font-bold">-{prop.discountPct}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
