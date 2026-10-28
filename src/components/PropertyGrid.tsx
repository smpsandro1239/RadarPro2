"use client";

import { useState, useMemo } from "react";
import { MapPin, TrendingDown } from "lucide-react";
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

export default function PropertyGrid({ properties }: { properties: Property[] }) {
  const [district, setDistrict] = useState("todos");
  const [type, setType] = useState("todos");
  const [sortBy, setSortBy] = useState("score");

  const districts = ["todos", ...Array.from(new Set(properties.map((p) => p.district)))];
  const types = ["todos", ...Array.from(new Set(properties.map((p) => p.type)))];

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (district !== "todos" && p.district !== district) return false;
      if (type !== "todos" && p.type !== type) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "discount") return (b.discountPct || 0) - (a.discountPct || 0);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [properties, district, type, sortBy]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d === "todos" ? "Todos os distritos" : d}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "todos" ? "Todos os tipos" : t}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="score">Melhor score</option>
          <option value="discount">Maior desconto</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>

        <span className="text-sm text-secondary self-center">
          {filtered.length} de {properties.length} imóveis
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((prop) => {
          const images = prop.images ? JSON.parse(prop.images) : [];
          const imageUrl = images[0] || null;
          return (
            <Link
              key={prop.id}
              href={`/imovel/${prop.id}`}
              className="border rounded-2xl overflow-hidden hover:shadow-xl transition group block"
            >
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
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-secondary">
          Nenhum imóvel encontrado com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
