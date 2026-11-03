"use client";

import { useState, useEffect } from "react";
import { Trash2, MapPin, TrendingDown } from "lucide-react";
import Link from "next/link";
import PropertyImage from "@/components/PropertyImage";
import PageShell from "@/components/ds/PageShell";
import EmptyState from "@/components/ds/EmptyState";
import Button from "@/components/ds/Button";
import { formatEuros, formatOptional, formatScoreOutOf100 } from "@/lib/format";

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
    <PageShell
      eyebrow="Favoritos"
      title="Meus favoritos"
      description={`${properties.length} imóveis guardados`}
      backHref="/"
      backLabel="Voltar ao início"
    >
      {loading ? (
        <p className="text-rp-muted">A carregar…</p>
      ) : properties.length === 0 ? (
        <EmptyState
          title="Nenhum imóvel guardado"
          description="Clique no coração nos imóveis para os guardar aqui."
          action={
            <Button href="/oportunidades" variant="primary" size="md">
              Explorar oportunidades →
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => {
            const images = prop.images ? JSON.parse(prop.images) : [];
            const imageUrl = images[0] || null;
            return (
              <article
                key={prop.id}
                className="group flex h-full flex-col overflow-hidden rounded-rp border border-rp-line bg-rp-surface shadow-rp-1 transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(18,24,33,.18)]"
              >
                <Link href={`/imovel/${prop.id}`} className="relative block aspect-[16/9] overflow-hidden border-b border-rp-line bg-rp-ceramic">
                  <PropertyImage
                    src={imageUrl}
                    alt={prop.title}
                    fill
                    className="object-cover transition-transform duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] group-hover:scale-105"
                  />
                  <span className="rp-eyebrow absolute left-0 top-0 z-10 border-b border-r border-rp-line bg-rp-surface px-3 py-2 text-rp-ink-2">
                    {prop.sourceName}
                  </span>
                  <span className="rp-num absolute right-0 top-0 z-10 border-b border-l border-rp-line bg-rp-surface px-3 py-2 text-[13px] text-rp-ink">
                    {formatScoreOutOf100(prop.score)}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="rp-display text-[20px] leading-snug text-rp-ink">
                      <Link href={`/imovel/${prop.id}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                        {prop.title}
                      </Link>
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeFavorite(prop.id)}
                      aria-label={`Remover ${prop.title} dos favoritos`}
                      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-rp border border-rp-line bg-rp-surface text-rp-anomaly transition-colors duration-[var(--rp-dur-1)] hover:bg-rp-ceramic"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <p className="flex items-center gap-1.5 text-[13px] text-rp-muted">
                    <MapPin size={14} aria-hidden="true" />
                    {prop.municipality}, {prop.district}
                  </p>

                  <dl className="grid grid-cols-2 gap-4 border-y border-rp-line py-3">
                    <div>
                      <dt className="rp-eyebrow text-rp-muted">preço pedido</dt>
                      <dd className="rp-num mt-1 text-[20px] leading-none text-rp-ink">{formatEuros(prop.price)}</dd>
                    </div>
                    <div>
                      <dt className="rp-eyebrow text-rp-muted">valorização</dt>
                      <dd className="rp-num mt-1 text-[20px] leading-none text-rp-cobalt">
                        {formatEuros(prop.marketValue)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-[13px] text-rp-anomaly">
                      <TrendingDown size={14} aria-hidden="true" />
                      {formatOptional(prop.discountPct === null ? null : -prop.discountPct, "%")}
                    </span>
                    <span className="rp-num border border-rp-line bg-rp-ceramic px-2 py-1 text-[12px] text-rp-ink-2">
                      Rentabilidade: {formatOptional(prop.rentability, "%")}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
