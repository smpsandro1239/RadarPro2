"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  TrendingDown,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Bath,
  Ruler,
  Filter,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PropertyImage from "@/components/PropertyImage";
import AuctionCountdown from "@/components/AuctionCountdown";
import ValuationCard from "@/components/ValuationCard";
import RadarAssistant from "@/components/RadarAssistant";

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
  lat?: number | null;
  lng?: number | null;
}

export default function AdvancedSearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState("todos");
  const [type, setType] = useState("todos");
  const [source, setSource] = useState("todos");
  const [isAuction, setIsAuction] = useState("todos");
  const [minScore, setMinScore] = useState(0);
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState("score");
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique filter options WITH COUNTS for faceted search
  const districts = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      counts[p.district] = (counts[p.district] || 0) + 1;
    });
    return [
      { label: "Todos", value: "todos", count: properties.length },
      ...Object.entries(counts).map(([district, count]) => ({
        label: district,
        value: district,
        count,
      })),
    ];
  }, [properties]);

  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return [
      { label: "Todos", value: "todos", count: properties.length },
      ...Object.entries(counts).map(([type, count]) => ({
        label: type,
        value: type,
        count,
      })),
    ];
  }, [properties]);

  const sources = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      counts[p.sourceName] = (counts[p.sourceName] || 0) + 1;
    });
    return [
      { label: "Todas", value: "todos", count: properties.length },
      ...Object.entries(counts).map(([source, count]) => ({
        label: source,
        value: source,
        count,
      })),
    ];
  }, [properties]);

  // Filter properties
  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      // Text search
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
      // District filter
      if (district !== "todos" && p.district !== district) return false;
      // Type filter
      if (type !== "todos" && p.type !== type) return false;
      // Source filter
      if (source !== "todos" && p.sourceName !== source) return false;
      // Auction filter
      if (isAuction === "leilao" && !p.isAuction) return false;
      if (isAuction === "venda" && p.isAuction) return false;
      // Min score
      if (minScore > 0 && (p.score || 0) < minScore) return false;
      // Max price
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      // Min discount
      if (minDiscount > 0 && (p.discountPct || 0) < minDiscount) return false;
      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "discount") return (b.discountPct || 0) - (a.discountPct || 0);
      if (sortBy === "rentability") return (b.rentability || 0) - (a.rentability || 0);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [properties, searchQuery, district, type, source, isAuction, minScore, maxPrice, minDiscount, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start gap-6 mb-8">
        <div>
          <a href="/" className="text-primary hover:underline mb-2 inline-block">
            ← Voltar
          </a>
          <h1 className="text-3xl font-extrabold mb-1">Busca Avançada</h1>
          <p className="text-secondary">
            {filtered.length} de {properties.length} imóveis encontrados
          </p>
        </div>
        <button
          className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/90 transition"
          onClick={() => {
            setSearchQuery("");
            setDistrict("todos");
            setType("todos");
            setSource("todos");
            setIsAuction("todos");
            setMinScore(0);
            setMaxPrice("");
            setMinDiscount(0);
            setSortBy("score");
            setPage(1);
          }}
        >
          Limpar todos
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-primary" />
          <h2 className="text-lg font-bold">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Buscar</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Título, localidade, tipo..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Distrito</label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {districts.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label} ({d.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} ({t.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Fonte</label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {sources.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Tipo de venda</label>
            <select
              value={isAuction}
              onChange={(e) => {
                setIsAuction(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="todos">Todos</option>
              <option value="leilao">Apenas leilões</option>
              <option value="venda">Apenas venda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Score mínimo</label>
            <select
              value={minScore}
              onChange={(e) => {
                setMinScore(parseInt(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value={0}>Qualquer</option>
              <option value={70}>70+</option>
              <option value={80}>80+</option>
              <option value={90}>90+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Preço máximo</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Ex: 200000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Desconto mínimo</label>
            <select
              value={minDiscount}
              onChange={(e) => {
                setMinDiscount(parseInt(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value={0}>Qualquer</option>
              <option value={15}>15%+</option>
              <option value={20}>20%+</option>
              <option value={30}>30%+</option>
              <option value={40}>40%+</option>
            </select>
          </div>

          <div className="flex items-end">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="score">Melhor score</option>
              <option value="discount">Maior desconto</option>
              <option value="rentability">Maior rentabilidade</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>
        </div>
      </div>

      {/* Radar Assistant */}
      <div className="border rounded-2xl p-6 mb-8">
        <RadarAssistant
          onApplyFilters={(filters) => {
            if (filters.district) setDistrict(filters.district);
            if (filters.type) setType(filters.type);
            if (filters.maxPrice !== undefined) setMaxPrice(String(filters.maxPrice));
            if (filters.minDiscount !== undefined) setMinDiscount(filters.minDiscount);
            if (filters.isAuction !== undefined) setIsAuction(filters.isAuction ? "leilao" : "todos");
            setPage(1);
          }}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-secondary">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nenhum imóvel encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-secondary">
              Exibindo {paginated.length} de {filtered.length} resultados
            </div>
            <div className="text-sm text-secondary">
              Página {page} de {totalPages}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((prop) => {
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
                    {prop.isAuction && (
                      <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 flex items-center gap-1">
                        <X size={12} /> Leilão
                      </div>
                    )}
                    {prop.isAuction && prop.auctionEndDate && (
                      <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded-lg text-xs font-bold text-orange-600 z-10">
                        <AuctionCountdown endDate={typeof prop.auctionEndDate === "number" ? prop.auctionEndDate : Math.floor(new Date(prop.auctionEndDate).getTime() / 1000)} compact />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg truncate flex-1">{prop.title}</h3>
                    </div>
                    <div className="flex items-center text-sm text-secondary mb-3">
                      <MapPin size={14} className="mr-1" />
                      {prop.municipality}, {prop.district}
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-y py-3 mb-3">
                      <div>
                        <div className="text-xs text-secondary uppercase font-semibold">Preço</div>
                        <div className="text-lg font-bold">{prop.price.toLocaleString()}€</div>
                      </div>
                      <div>
                        <div className="text-xs text-secondary uppercase font-semibold">Valorização</div>
                        <div className="text-lg font-bold text-success">{prop.marketValue?.toLocaleString()}€</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-primary font-bold">
                        <TrendingDown size={18} className="mr-1" />
                        -{prop.discountPct}%
                      </div>
                      <div className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-lg">
                        Rentabilidade: {prop.rentability}%
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
