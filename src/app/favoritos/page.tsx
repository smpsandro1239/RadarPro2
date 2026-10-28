"use client";

import { useState, useEffect } from "react";
import { Heart, Trash2, MapPin, TrendingDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Property {
  id: string;
  title: string;
  district: string;
  municipality: string;
  sourceName: string;
  price: number;
  marketValue: number | null;
  discountPct: number | null;
  score: number | null;
  rentability: number | null;
  type: string;
  images: string | null;
}

export default function FavoritosPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favoritos")
      .then((r) => r.json())
      .then((data) => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function removeFavorite(propertyId: string) {
    await fetch("/api/favoritos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    setProperties(properties.filter((p) => p.id !== propertyId));
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-2">Meus Favoritos</h1>
      <p className="text-secondary mb-8">
        {properties.length} imóveis guardados
      </p>

      {loading ? (
        <p className="text-secondary">A carregar...</p>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-secondary">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nenhum imóvel guardado.</p>
          <p className="text-sm">Clique no coração nos imóveis para os guardar aqui.</p>
          <a href="/" className="inline-block mt-4 text-primary hover:underline">
            Explorar oportunidades →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => {
            const images = prop.images ? JSON.parse(prop.images) : [];
            const imageUrl = images[0] || null;
            return (
              <div key={prop.id} className="border rounded-2xl overflow-hidden hover:shadow-xl transition group">
                <Link href={`/imovel/${prop.id}`} className="block">
                  <div className="aspect-video bg-slate-200 relative overflow-hidden">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={prop.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm z-10">
                      {prop.sourceName}
                    </div>
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold z-10">
                      {prop.score}/100
                    </div>
                  </div>
                </Link>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate flex-1">{prop.title}</h3>
                    <button
                      onClick={() => removeFavorite(prop.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center text-sm text-secondary mb-4">
                    <MapPin size={14} className="mr-1" />
                    {prop.municipality}, {prop.district}
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y py-4 mb-4">
                    <div>
                      <div className="text-xs text-secondary uppercase font-semibold">Preço</div>
                      <div className="text-lg font-bold">{prop.price.toLocaleString()}€</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary uppercase font-semibold">Valorização</div>
                      <div className="text-lg font-bold text-success">{prop.marketValue?.toLocaleString()}€</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-primary font-bold">
                      <TrendingDown size={18} className="mr-1" />
                      -{prop.discountPct}%
                    </div>
                    <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-lg">
                      Rentabilidade: {prop.rentability}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
