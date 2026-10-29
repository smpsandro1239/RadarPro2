"use client";

import { useState, useMemo } from "react";
import {
  MapPin,
  TrendingDown,
  Search,
  SlidersHorizontal,
  X,
  Gavel,
} from "lucide-react";
import Link from "next/link";
import PropertyImage from "@/components/PropertyImage";
import AuctionCountdown from "@/components/AuctionCountdown";
import ValuationCard from "@/components/ValuationCard";

interface Property {
  id: string;
  title: string;
  district: string;
  municipality: string;
  sourceName: string;
  source: string;
  price: number;
  marketValue: number | null;
  discountPct: number | null;
  score: number | null;
  rentability: number | null;
  type: string;
  images: string | null;
  isAuction: boolean | null;
  auctionEndDate: number | Date | null;
  isActive: boolean | null;
  lat?: number | null;
  lng?: number | null;
}

export default function PropertyGrid({ properties }: { properties: Property[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState("todos");
  const [type, setType] = useState("todos");
  const [source, setSource] = useState("todos");
  const [auctionFilter, setAuctionFilter] = useState("todos");
  const [minScore, setMinScore] = useState(0);
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState("score");
  const [showFilters, setShowFilters] = useState(false);

  const districts = ["todos", ...Array.from(new Set(properties.map((p) => p.district)))];
  const types = ["todos", ...Array.from(new Set(properties.map((p) => p.type)))];
  const sources = ["todos", ...Array.from(new Set(properties.map((p) => p.sourceName)))];

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.municipality.toLowerCase().includes(q) &&
          !p.district.toLowerCase().includes(q) &&
          !p.type.toLowerCase().includes(q) &&
          !p.sourceName.toLowerCase().includes(q)
        )
          return false;
      }
      if (district !== "todos" && p.district !== district) return false;
      if (type !== "todos" && p.type !== type) return false;
      if (source !== "todos" && p.sourceName !== source) return false;
      if (auctionFilter === "leilao" && !p.isAuction) return false;
      if (auctionFilter === "venda" && p.isAuction) return false;
      if (minScore > 0 && (p.score || 0) < minScore) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      if (minDiscount > 0 && (p.discountPct || 0) < minDiscount) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "discount") return (b.discountPct || 0) - (a.discountPct || 0);
      if (sortBy === "rentability") return (b.rentability || 0) - (a.rentability || 0);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [properties, searchQuery, district, type, source, auctionFilter, minScore, maxPrice, minDiscount, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setDistrict("todos");
    setType("todos");
    setSource("todos");
    setAuctionFilter("todos");
    setMinScore(0);
    setMaxPrice("");
    setMinDiscount(0);
    setSortBy("score");
  };

  const hasActiveFilters =
    searchQuery || district !== "todos" || type !== "todos" || source !== "todos" ||
    minScore > 0 || maxPrice || minDiscount > 0;

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, localidade, tipo, fonte..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition ${
            showFilters ? "bg-primary text-white border-primary" : "hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-slate-50 border rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Pesquisa avançada</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary hover:underline flex items-center gap-1">
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Distrito</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {districts.map((d) => (
                  <option key={d} value={d}>{d === "todos" ? "Todos" : d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {types.map((t) => (
                  <option key={t} value={t}>{t === "todos" ? "Todos" : t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Fonte</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {sources.map((s) => (
                  <option key={s} value={s}>{s === "todos" ? "Todas" : s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Tipo de venda</label>
              <select value={auctionFilter} onChange={(e) => setAuctionFilter(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="todos">Todos</option>
                <option value="leilao">Apenas leilões</option>
                <option value="venda">Apenas venda normal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Ordenar por</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="score">Melhor score</option>
                <option value="discount">Maior desconto</option>
                <option value="rentability">Maior rentabilidade</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Score mínimo</label>
              <select value={minScore} onChange={(e) => setMinScore(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value={0}>Qualquer</option>
                <option value={70}>70+</option>
                <option value={80}>80+</option>
                <option value={90}>90+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Desconto mínimo</label>
              <select value={minDiscount} onChange={(e) => setMinDiscount(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value={0}>Qualquer</option>
                <option value={15}>15%+</option>
                <option value={20}>20%+</option>
                <option value={30}>30%+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Preço máximo (€)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Ex: 200000"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-secondary">
          {filtered.length} de {properties.length} imóveis
        </span>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <PropertyImage src={imageUrl} alt={prop.title} fill className="group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm z-10">
                  {prop.sourceName}
                </div>
                {prop.isAuction && (
                  <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 flex items-center gap-1">
                    <Gavel size={12} /> Leilão
                  </div>
                )}
                {(prop as any).checkStatus === "ok" && (
                  <div className="absolute bottom-4 right-4 bg-success text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                    ✓ Verificado
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold z-10">
                  {prop.score}/100
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg truncate mb-2">{prop.title}</h3>
                <div className="flex items-center text-sm text-secondary mb-3">
                  <MapPin size={14} className="mr-1" />
                  {prop.municipality}, {prop.district}
                </div>

                <ValuationCard
                  district={prop.district}
                  municipality={prop.municipality}
                  type={prop.type}
                  price={prop.price}
                  marketValue={prop.marketValue}
                  rentability={prop.rentability}
                  sourceName={prop.sourceName}
                  source={prop.source}
                  createdAt={null}
                  isActive={prop.isActive ?? true}
                />

                <div className="flex justify-between items-center mt-3">
                  <a href={`/imovel/${prop.id}`} className="text-primary text-sm font-medium hover:underline">
                    Ver detalhes
                  </a>
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
