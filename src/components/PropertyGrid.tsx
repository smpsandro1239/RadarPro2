"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  SlidersHorizontal,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import ListingTabs from "@/components/ListingTabs";

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
  checkStatus: string | null;
  currentBid: number | null;
  maxBid: number | null;
  sqm?: number | null;
  valuationConfidence?: string | null;
  assetClass?: string | null;
}

interface MunicipalityOption {
  value: string;
  label: string;
}

// Todos os distritos de Portugal continental + ilhas
const ALL_DISTRICTS: string[] = [
  "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra",
  "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Portalegre", "Porto",
  "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu",
  "Açores", "Madeira",
];

// Concelhos por distrito (subconjunto dos mais relevantes)
const MUNICIPALITIES_BY_DISTRICT: Record<string, MunicipalityOption[]> = {
  Lisboa: [
    { value: "Lisboa", label: "Lisboa" },
    { value: "Cascais", label: "Cascais" },
    { value: "Oeiras", label: "Oeiras" },
    { value: "Sintra", label: "Sintra" },
    { value: "Amadora", label: "Amadora" },
    { value: "Odivelas", label: "Odivelas" },
    { value: "Loures", label: "Loures" },
    { value: "Mafra", label: "Mafra" },
    { value: "Torres Vedras", label: "Torres Vedras" },
    { value: "Vila Franca de Xira", label: "Vila Franca de Xira" },
  ],
  Porto: [
    { value: "Porto", label: "Porto" },
    { value: "Vila Nova de Gaia", label: "Vila Nova de Gaia" },
    { value: "Matosinhos", label: "Matosinhos" },
    { value: "Gondomar", label: "Gondomar" },
    { value: "Maia", label: "Maia" },
    { value: "Valongo", label: "Valongo" },
    { value: "Póvoa de Varzim", label: "Póvoa de Varzim" },
    { value: "Vila do Conde", label: "Vila do Conde" },
    { value: "Felgueiras", label: "Felgueiras" },
    { value: "Santo Tirso", label: "Santo Tirso" },
  ],
  Braga: [
    { value: "Braga", label: "Braga" },
    { value: "Guimarães", label: "Guimarães" },
    { value: "Barcelos", label: "Barcelos" },
    { value: "Vila Nova de Famalicão", label: "Vila Nova de Famalicão" },
    { value: "Fafe", label: "Fafe" },
    { value: "Póvoa de Lanhoso", label: "Póvoa de Lanhoso" },
    { value: "Esposende", label: "Esposende" },
    { value: "Amares", label: "Amares" },
    { value: "Vila Verde", label: "Vila Verde" },
  ],
  Aveiro: [
    { value: "Aveiro", label: "Aveiro" },
    { value: "Ílhavo", label: "Ílhavo" },
    { value: "Ovar", label: "Ovar" },
    { value: "Santa Maria da Feira", label: "Santa Maria da Feira" },
    { value: "Oliveira de Azeméis", label: "Oliveira de Azeméis" },
  ],
  Faro: [
    { value: "Faro", label: "Faro" },
    { value: "Loulé", label: "Loulé" },
    { value: "Lagos", label: "Lagos" },
    { value: "Portimão", label: "Portimão" },
    { value: "Tavira", label: "Tavira" },
    { value: "Albufeira", label: "Albufeira" },
    { value: "Lagos", label: "Lagos" },
  ],
  Coimbra: [
    { value: "Coimbra", label: "Coimbra" },
    { value: "Figueira da Foz", label: "Figueira da Foz" },
    { value: "CantANILDE", label: "Cantanhede" },
    { value: "Pombal", label: "Pombal" },
    { value: "Arganil", label: "Arganil" },
  ],
  Setúbal: [
    { value: "Setúbal", label: "Setúbal" },
    { value: "Almada", label: "Almada" },
    { value: "Seixal", label: "Seixal" },
    { value: "Barreiro", label: "Barreiro" },
    { value: "Montijo", label: "Montijo" },
  ],
  Leiria: [
    { value: "Leiria", label: "Leiria" },
    { value: "Caldas da Rainha", label: "Caldas da Rainha" },
    { value: "Alcobaça", label: "Alcobaça" },
    { value: "Marinha Grande", label: "Marinha Grande" },
    { value: "Ourém", label: "Ourém" },
  ],
  Santarém: [
    { value: "Santarém", label: "Santarém" },
    { value: "Santarém", label: "Santarém" },
    { value: "Tomar", label: "Tomar" },
    { value: "Ourém", label: "Ourém" },
  ],
  Viseu: [
    { value: "Viseu", label: "Viseu" },
    { value: "Lamego", label: "Lamego" },
    { value: "Vila Nova de Paiva", label: "Vila Nova de Paiva" },
    { value: "São João da Pesqueira", label: "São João da Pesqueira" },
  ],
  BragaM: [
    { value: "Braga", label: "Braga" },
  ],
};

const OTHER_DISTRICTS_WITHOUT_MUNICIPALITIES = [
  "Beja", "Bragança", "Castelo Branco", "Évora", "Guarda",
  "Portalegre", "Viana do Castelo", "Vila Real", "Açores", "Madeira",
];

export default function PropertyGrid({
  properties,
  totalCount,
  pageParam = 1,
  perPage = 24,
}: {
  properties: Property[];
  totalCount?: number;
  pageParam?: number;
  perPage?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState<string>("todos");
  const [municipality, setMunicipality] = useState<string>("todos");
  const [type, setType] = useState<string>("todos");
  const [source, setSource] = useState<string>("todos");
  const [auctionFilter, setAuctionFilter] = useState<string>("todos");
  const [minScore, setMinScore] = useState(0);
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState("score");
  const [showFilters, setShowFilters] = useState(false);
  const [loadedCount, setLoadedCount] = useState(perPage);

  // Sincronizar filtros com URL ao montar
  useEffect(() => {
    const urlDistrict = searchParams.get("distrito");
    const urlMunicipality = searchParams.get("concelho");
    const urlType = searchParams.get("tipo");
    const urlSource = searchParams.get("fonte");
    const urlListingType = searchParams.get("listing_type");
    const urlIsAuction = searchParams.get("is_auction");
    const urlAuction = searchParams.get("leilao");
    const urlMinScore = searchParams.get("score_min");
    const urlMaxPrice = searchParams.get("preco_max");
    const urlMinDiscount = searchParams.get("desconto_min");
    const urlSort = searchParams.get("ordenar");
    const urlQ = searchParams.get("q");

    if (urlDistrict) setDistrict(urlDistrict);
    if (urlMunicipality) setMunicipality(urlMunicipality);
    if (urlType) setType(urlType);
    if (urlSource) setSource(urlSource);
    if (urlAuction) setAuctionFilter(urlAuction);
    if (urlListingType === "fixed_price") setAuctionFilter("venda");
    else if (urlIsAuction === "true") setAuctionFilter("leilao");
    if (urlMinScore) setMinScore(parseInt(urlMinScore));
    if (urlMaxPrice) setMaxPrice(urlMaxPrice);
    if (urlMinDiscount) setMinDiscount(parseInt(urlMinDiscount));
    if (urlSort) setSortBy(urlSort);
    if (urlQ) setSearchQuery(urlQ);
  }, [searchParams]);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (district && district !== "todos") params.set("distrito", district);
    if (municipality && municipality !== "todos") params.set("concelho", municipality);
    if (type && type !== "todos") params.set("tipo", type);
    if (source && source !== "todos") params.set("fonte", source);
    if (auctionFilter && auctionFilter !== "todos") params.set("leilao", auctionFilter);
    if (auctionFilter === "leilao") {
      params.set("listing_type", "auction_*");
      params.set("is_auction", "true");
    } else if (auctionFilter === "venda") {
      params.set("listing_type", "fixed_price");
      params.delete("is_auction");
    } else {
      params.delete("listing_type");
      params.delete("is_auction");
    }
    if (minScore > 0) params.set("score_min", String(minScore));
    if (maxPrice) params.set("preco_max", maxPrice);
    if (minDiscount > 0) params.set("desconto_min", String(minDiscount));
    if (sortBy !== "score") params.set("ordenar", sortBy);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchQuery, district, municipality, type, source, auctionFilter, minScore, maxPrice, minDiscount, sortBy]);

  // Concelhos disponíveis para o distrito selecionado
  const availableMunicipalities = useMemo(() => {
    if (district === "todos") return [];
    const fromMap = MUNICIPALITIES_BY_DISTRICT[district];
    if (fromMap) return fromMap;
    return [];
  }, [district]);

  // Opções de tipo e fonte derivadas dos dados
  const types = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => set.add(p.type));
    return ["todos", ...Array.from(set).sort()];
  }, [properties]);

  const hasRentability = properties.some((p) => "rentability" in p && p.rentability !== null && p.rentability !== undefined);

  const sources = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => p.sourceName && set.add(p.sourceName));
    return ["todos", ...Array.from(set).sort()];
  }, [properties]);

  // Filtrar propriedades
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
      if (municipality !== "todos" && p.municipality !== municipality) return false;
      if (type !== "todos" && p.type !== type) return false;
      if (source !== "todos" && p.sourceName !== source) return false;
      if (auctionFilter === "leilao" && !p.isAuction) return false;
      if (auctionFilter === "venda" && p.isAuction) return false;
      if (minScore > 0 && (p.score || 0) < minScore) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      if (minDiscount > 0 && (p.discountPct || 0) < minDiscount) return false;
      return true;
    });

    result.sort((a: any, b: any) => {
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "discount") return (b.discountPct || 0) - (a.discountPct || 0);
      if (sortBy === "rentability") return ((b.rentability || 0) - (a.rentability || 0));
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [properties, searchQuery, district, municipality, type, source, auctionFilter, minScore, maxPrice, minDiscount, sortBy]);

  const paginated = filtered.slice(0, loadedCount);
  const hasMore = loadedCount < filtered.length;

  const clearFilters = () => {
    setSearchQuery("");
    setDistrict("todos");
    setMunicipality("todos");
    setType("todos");
    setSource("todos");
    setAuctionFilter("todos");
    setMinScore(0);
    setMaxPrice("");
    setMinDiscount(0);
    setSortBy("score");
    setLoadedCount(perPage);
    router.push("/", { scroll: false });
  };

  const loadMore = () => {
    setLoadedCount((prev) => Math.min(prev + perPage, filtered.length));
  };

  const hasActiveFilters =
    searchQuery || district !== "todos" || municipality !== "todos" ||
    type !== "todos" || source !== "todos" ||
    minScore > 0 || maxPrice || minDiscount > 0;

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Distrito, concelho, código postal, tipo ou fonte..."
            onBlur={() => updateUrl()}
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
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setMunicipality("todos");
                  updateUrl();
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="todos">Todos os distritos</option>
                {ALL_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {availableMunicipalities.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Concelho</label>
                <select
                  value={municipality}
                  onChange={(e) => {
                    setMunicipality(e.target.value);
                    updateUrl();
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="todos">Todos os concelhos</option>
                  {availableMunicipalities.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); updateUrl(); }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t === "todos" ? "Todos os tipos" : t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Fonte</label>
              <select
                value={source}
                onChange={(e) => { setSource(e.target.value); updateUrl(); }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {sources.map((s) => (
                  <option key={s} value={s}>{s === "todos" ? "Todas as fontes" : s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Tipo de venda</label>
              <select
                value={auctionFilter}
                onChange={(e) => { setAuctionFilter(e.target.value); updateUrl(); }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="todos">Todos</option>
                <option value="leilao">Apenas leilões</option>
                <option value="venda">Apenas venda normal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Score mínimo</label>
              <select
                value={minScore}
                onChange={(e) => { setMinScore(parseInt(e.target.value)); updateUrl(); }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value={0}>Qualquer</option>
                <option value={70}>70+</option>
                <option value={80}>80+</option>
                <option value={90}>90+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Desconto mínimo</label>
              <select
                value={minDiscount}
                onChange={(e) => { setMinDiscount(parseInt(e.target.value)); updateUrl(); }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
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
                onChange={(e) => { setMaxPrice(e.target.value); updateUrl(); }}
                placeholder="Ex: 200000"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); updateUrl(); }}
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
      )}

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-secondary">
          A mostrar {paginated.length} de {filtered.length} imóveis
        </span>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((prop) => (
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
            sqm={prop.sqm}
            valuationConfidence={prop.valuationConfidence}
            assetClass={prop.assetClass}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="w-full py-4 border border-primary text-primary text-sm font-medium rounded-lg text-center hover:bg-primary/50 transition flex items-center justify-center gap-2 mx-auto my-8 max-w-md"
        >
          Carregar mais <ChevronRight size={16} />
          <span className="text-xs text-secondary">(+{perPage} imóveis)</span>
        </button>
      )}

      {!hasMore && filtered.length > 0 && (
        <p className="text-center text-sm text-secondary mt-8">
          A mostrar todos os {filtered.length} imóveis encontrados
        </p>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-secondary">
          <p className="text-lg">Nenhum imóvel encontrado com os filtros selecionados.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 text-primary hover:underline">
              Limpar todos os filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
