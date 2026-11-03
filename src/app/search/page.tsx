"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import RadarAssistant from "@/components/RadarAssistant";
import PageShell from "@/components/ds/PageShell";
import Button from "@/components/ds/Button";

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
  currentBid?: number | null;
  maxBid?: number | null;
  valuationConfidence?: string | null;
  assetClass?: string | null;
}

const FIELD =
  "w-full min-h-11 rounded-rp border border-rp-line bg-rp-surface px-3 py-2 text-[14px] text-rp-ink focus:border-rp-cobalt focus:outline-none";

function AdvancedSearchPageInner() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [district, setDistrict] = useState("todos");
  const [type, setType] = useState("todos");
  const [source, setSource] = useState("todos");
  const [isAuction, setIsAuction] = useState("todos");
  const [listingType, setListingType] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState("score");
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    const urlListingType = searchParams.get("listing_type");
    const urlIsAuction = searchParams.get("is_auction");
    if (urlListingType) setListingType(urlListingType);
    if (urlIsAuction === "true") setIsAuction("leilao");
    else if (urlIsAuction === "false") setIsAuction("venda");
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (listingType) params.set("listing_type", listingType);
      if (isAuction === "leilao") params.set("is_auction", "true");
      else if (isAuction === "venda") params.set("is_auction", "false");
      const query = params.toString();
      const url = query ? "/api/properties?" + query : "/api/properties";
      const res = await fetch(url);
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
    <Suspense fallback={<div className="min-h-screen bg-rp-bg px-4 py-8 text-rp-muted">A carregar filtros…</div>}>
      <PageShell
        eyebrow="Pesquisa"
        title="Busca avançada"
        description={`${filtered.length} de ${properties.length} imóveis encontrados`}
        backHref="/"
        backLabel="Voltar ao início"
        actions={
          <Button
            type="button"
            variant="secondary"
            size="md"
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
          </Button>
        }
      >
        {/* Filters */}
        <div className="mb-8 border border-rp-line bg-rp-surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={20} className="text-rp-cobalt" aria-hidden="true" />
            <h2 className="rp-display text-[20px] leading-tight text-rp-ink">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <div>
              <label htmlFor="filter-search" className="rp-eyebrow mb-1 block text-rp-muted">
                Buscar
              </label>
              <input
                id="filter-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Título, localidade, tipo..."
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="filter-district" className="rp-eyebrow mb-1 block text-rp-muted">
                Distrito
              </label>
              <select
                id="filter-district"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPage(1);
                }}
                className={FIELD}
              >
                {districts.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label} ({d.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-type" className="rp-eyebrow mb-1 block text-rp-muted">
                Tipo
              </label>
              <select
                id="filter-type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className={FIELD}
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} ({t.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-source" className="rp-eyebrow mb-1 block text-rp-muted">
                Fonte
              </label>
              <select
                id="filter-source"
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setPage(1);
                }}
                className={FIELD}
              >
                {sources.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} ({s.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-sale-type" className="rp-eyebrow mb-1 block text-rp-muted">
                Tipo de venda
              </label>
              <select
                id="filter-sale-type"
                value={isAuction}
                onChange={(e) => {
                  setIsAuction(e.target.value);
                  setPage(1);
                }}
                className={FIELD}
              >
                <option value="todos">Todos</option>
                <option value="leilao">Apenas leilões</option>
                <option value="venda">Apenas venda</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-min-score" className="rp-eyebrow mb-1 block text-rp-muted">
                Score mínimo
              </label>
              <select
                id="filter-min-score"
                value={minScore}
                onChange={(e) => {
                  setMinScore(parseInt(e.target.value));
                  setPage(1);
                }}
                className={FIELD}
              >
                <option value={0}>Qualquer</option>
                <option value={70}>70+</option>
                <option value={80}>80+</option>
                <option value={90}>90+</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-max-price" className="rp-eyebrow mb-1 block text-rp-muted">
                Preço máximo
              </label>
              <input
                id="filter-max-price"
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className={FIELD}
                placeholder="Ex: 200000"
              />
            </div>

            <div>
              <label htmlFor="filter-min-discount" className="rp-eyebrow mb-1 block text-rp-muted">
                Desconto mínimo
              </label>
              <select
                id="filter-min-discount"
                value={minDiscount}
                onChange={(e) => {
                  setMinDiscount(parseInt(e.target.value));
                  setPage(1);
                }}
                className={FIELD}
              >
                <option value={0}>Qualquer</option>
                <option value={15}>15%+</option>
                <option value={20}>20%+</option>
                <option value={30}>30%+</option>
                <option value={40}>40%+</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <label htmlFor="filter-sort" className="rp-eyebrow mb-1 block text-rp-muted">
                  Ordenar por
                </label>
                <select
                  id="filter-sort"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className={FIELD}
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
        </div>

        {/* Radar Assistant */}
        <div className="mb-8">
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
          <div className="flex h-64 items-center justify-center">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-2 animate-pulse rounded-full bg-rp-cobalt" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-rp-line bg-rp-surface px-6 py-14 text-center">
            <Search size={32} className="mx-auto mb-4 text-rp-muted" aria-hidden="true" />
            <p className="rp-display text-[22px] leading-tight text-rp-ink">
              Nenhum imóvel encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="rp-eyebrow text-rp-muted">
                Exibindo {paginated.length} de {filtered.length} resultados
              </div>
              <div className="rp-num text-[12px] text-rp-muted">
                Página {page} de {totalPages}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  currentBid={prop.currentBid ?? null}
                  maxBid={prop.maxBid ?? null}
                  rentability={prop.rentability}
                  valuationConfidence={prop.valuationConfidence}
                  assetClass={prop.assetClass}
                />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="rp-num px-3 py-2 text-[13px] text-rp-muted">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próximo
                </Button>
              </div>
            )}
          </>
        )}
      </PageShell>
    </Suspense>
  );
}

export default function AdvancedSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-rp-bg px-4 py-8 text-rp-muted">A carregar filtros…</div>}>
      <AdvancedSearchPageInner />
    </Suspense>
  );
}
