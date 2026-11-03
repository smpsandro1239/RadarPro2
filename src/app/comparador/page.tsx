"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PageShell from "@/components/ds/PageShell";
import { formatOptional, formatScoreOutOf100 } from "@/lib/format";

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

export default function ComparadorPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selected = properties.filter((p) => selectedIds.includes(p.id));
  const available = properties.filter(
    (p) => !selectedIds.includes(p.id) && p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function addProperty(id: string) {
    if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function removeProperty(id: string) {
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
  }

  function formatPrice(value: number | null) {
    return value ? value.toLocaleString() + "€" : "—";
  }

  const ROW_LABEL = "border border-rp-line bg-rp-ceramic px-3 py-3 text-left align-top text-[13px] font-medium text-rp-ink";
  const ROW_CELL = "border border-rp-line px-3 py-3 text-center align-top text-[14px] text-rp-ink";

  return (
    <PageShell
      eyebrow="Comparador"
      title="Comparador de imóveis"
      description="Compare até 4 imóveis lado a lado. Selecione imóveis para comparar."
      backHref="/"
      backLabel="Voltar ao início"
    >
      {/* Selected properties */}
      {selected.length > 0 && (
        <div className="mb-8 overflow-x-auto border border-rp-line bg-rp-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={`${ROW_LABEL} rp-eyebrow text-rp-muted`}>
                  Característica
                </th>
                {selected.map((p) => {
                  const images = p.images ? JSON.parse(p.images) : [];
                  return (
                    <th key={p.id} scope="col" className="relative border border-rp-line px-3 py-3 text-center align-top min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => removeProperty(p.id)}
                        aria-label={`Remover ${p.title} da comparação`}
                        className="absolute -top-2 -right-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-rp-line bg-rp-surface text-rp-anomaly transition-colors duration-[var(--rp-dur-1)] hover:bg-rp-ceramic"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                      {images[0] && (
                        <Image
                          src={images[0]}
                          alt={p.title}
                          width={200}
                          height={120}
                          className="mx-auto mb-2 rounded-rp object-cover"
                        />
                      )}
                      <div className="rp-display text-[16px] leading-snug text-rp-ink">{p.title}</div>
                      <div className="mt-1 text-[12px] text-rp-muted">
                        {p.municipality}, {p.district}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className={ROW_LABEL}>Preço</th>
                {selected.map((p) => (
                  <td key={p.id} className={`${ROW_CELL} rp-num font-medium`}>
                    {formatPrice(p.price)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={ROW_LABEL}>Valorização</th>
                {selected.map((p) => (
                  <td key={p.id} className={`${ROW_CELL} rp-num text-rp-cobalt`}>
                    {formatPrice(p.marketValue)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={ROW_LABEL}>Desconto</th>
                {selected.map((p) => (
                  <td key={p.id} className={`${ROW_CELL} rp-num text-rp-anomaly`}>
                    {formatOptional(p.discountPct === null ? null : -p.discountPct, "%")}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={ROW_LABEL}>Score</th>
                {selected.map((p) => (
                  <td key={p.id} className={ROW_CELL}>
                    <span className="rp-num inline-flex items-center border border-rp-line bg-rp-ceramic px-2 py-1 text-[12px] text-rp-ink">
                      {formatScoreOutOf100(p.score)}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={ROW_LABEL}>Rentabilidade</th>
                {selected.map((p) => (
                  <td key={p.id} className={`${ROW_CELL} rp-num`}>
                    {formatOptional(p.rentability, "%")}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={ROW_LABEL}>Tipo</th>
                {selected.map((p) => (
                  <td key={p.id} className={ROW_CELL}>{p.type}</td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={ROW_LABEL}>Fonte</th>
                {selected.map((p) => (
                  <td key={p.id} className={`${ROW_CELL} text-[12px] text-rp-muted`}>{p.sourceName}</td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={ROW_LABEL}>Link</th>
                {selected.map((p) => (
                  <td key={p.id} className={ROW_CELL}>
                    <Link href={`/imovel/${p.id}`} className="text-rp-cobalt underline decoration-[1px] underline-offset-4 hover:text-rp-ink hover:decoration-2">
                      Ver detalhes
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Add property */}
      {selectedIds.length < 4 && (
        <div className="border border-rp-line bg-rp-surface p-6">
          <h2 className="rp-display mb-4 text-[20px] leading-tight text-rp-ink">
            Adicionar imóvel para comparar
          </h2>
          <label htmlFor="comparador-search" className="rp-eyebrow mb-1 block text-rp-muted">
            Pesquisar imóvel
          </label>
          <input
            id="comparador-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar imóvel..."
            className="mb-4 w-full min-h-11 rounded-rp border border-rp-line bg-rp-surface px-4 py-2 text-[14px] text-rp-ink placeholder:text-rp-muted focus:border-rp-cobalt focus:outline-none"
          />
          <div className="grid max-h-60 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {available.slice(0, 12).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addProperty(p.id)}
                className="flex min-h-11 items-center gap-3 rounded-rp border border-rp-line bg-rp-surface p-3 text-left transition-colors duration-[var(--rp-dur-1)] hover:bg-rp-ceramic"
              >
                <Plus size={16} className="shrink-0 text-rp-cobalt" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-rp-ink">{p.title}</span>
                  <span className="rp-num block text-[12px] text-rp-muted">
                    {p.price.toLocaleString()}€ · {p.municipality}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-rp-muted">A carregar imóveis…</p>}
    </PageShell>
  );
}
