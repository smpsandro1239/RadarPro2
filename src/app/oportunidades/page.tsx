import type { ReactNode } from "react";
import Link from "next/link";
import { getAllActiveProperties } from "@/lib/queries";
import PropertyImage from "@/components/PropertyImage";
import DsPropertyCard from "@/components/ds/PropertyCard";
import EmptyState from "@/components/ds/EmptyState";
import PageShell from "@/components/ds/PageShell";
import PriceEstimateBar from "@/components/ds/PriceEstimateBar";
import SectionHeader from "@/components/ds/SectionHeader";
import StatCard from "@/components/ds/StatCard";
import { formatEuros, formatOptional, formatScoreOutOf100 } from "@/lib/format";

type Property = Awaited<ReturnType<typeof getAllActiveProperties>>[number];

/**
 * O cartao do design system so expoe o titulo como link de texto. Aqui o
 * alvo de toque tem de ficar nos 44 px, por isso esticamos o link e o
 * cartao a partir do contentor, sem tocar no componente partilhado.
 */
const DS_CARD = "[&>article]:h-full [&_h3]:flex [&_h3]:items-center [&_h3>a]:inline-flex [&_h3>a]:min-h-11 [&_h3>a]:items-center";

function firstImage(images: string | null): string | null {
  if (!images) return null;
  try {
    const parsed: unknown = JSON.parse(images);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
  } catch {
    return null;
  }
  return null;
}

function proxiedImage(images: string | null): string | null {
  const url = firstImage(images);
  return url ? `/api/img?u=${encodeURIComponent(url)}` : null;
}

function discountLabel(discountPct: number | null): string {
  return formatOptional(discountPct === null ? null : -discountPct, "%");
}

function Section({
  index,
  eyebrow,
  title,
  description,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-rp-line pt-10">
      <div className="flex items-baseline gap-3">
        <span className="rp-num text-[12px] text-rp-muted">{index}</span>
        <SectionHeader eyebrow={eyebrow} title={title} description={description} className="flex-1" />
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function PodiumCard({ property, rank }: { property: Property; rank: number }) {
  const imageUrl = firstImage(property.images);
  const featured = rank === 1;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-rp border bg-rp-surface transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-y-0.5 ${
        featured
          ? "border-rp-cobalt shadow-rp-2 hover:shadow-[6px_6px_0_var(--rp-cobalt)]"
          : "border-rp-line shadow-rp-1 hover:shadow-[5px_5px_0_rgba(18,24,33,.18)]"
      }`}
    >
      {imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-rp-line bg-rp-ceramic">
          <Link
            href={`/imovel/${property.id}`}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 block"
          >
            <PropertyImage
              src={imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] group-hover:scale-105"
            />
          </Link>

          <span
            className={`rp-eyebrow absolute left-0 top-0 z-10 px-3 py-2 ${
              featured ? "bg-rp-orange text-rp-ink" : "bg-rp-ink text-rp-surface"
            }`}
          >
            Nº {String(rank).padStart(2, "0")}
          </span>

          <span className="rp-num absolute right-0 top-0 z-10 border-b border-l border-rp-line bg-rp-surface px-3 py-2 text-[13px] text-rp-ink">
            {formatScoreOutOf100(property.score)}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-rp-line bg-rp-ink px-4 py-2.5">
          <span
            className={`rp-eyebrow ${featured ? "text-rp-orange" : "text-rp-surface"}`}
          >
            Nº {String(rank).padStart(2, "0")}
          </span>
          <span className="rp-num text-[13px] text-rp-surface">
            {formatScoreOutOf100(property.score)}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="flex items-center rp-display text-[20px] leading-snug text-rp-ink">
            <Link
              href={`/imovel/${property.id}`}
              className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            >
              {property.title}
            </Link>
          </h3>
          <p className="mt-1 text-[13px] text-rp-muted">
            {property.municipality}, {property.district}
          </p>
        </div>

        <div>
          <p className="rp-eyebrow text-rp-muted">preço pedido</p>
          <p className="rp-num text-[24px] font-medium leading-tight text-rp-ink">
            {formatEuros(property.price)}
          </p>
        </div>

        <PriceEstimateBar
          askingPrice={property.price}
          estimatedValue={property.marketValue}
          status={property.checkStatus === "ok" ? "estimated" : "to-verify"}
        />

        <p className="mt-auto pt-1 text-[12px] text-rp-muted">Fonte: {property.sourceName}</p>
      </div>
    </article>
  );
}

export default async function OportunidadesPage() {
  const properties = await getAllActiveProperties();

  // Sort by score descending
  const ranked = [...properties].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Top 10 opportunities
  const top10 = ranked.slice(0, 10);

  // Best by district
  const byDistrict = ["Lisboa", "Porto", "Braga"].map((district) => {
    const props = ranked.filter((p) => p.district === district);
    return { district, best: props[0], count: props.length };
  });

  // Best by discount
  const bestDiscount = [...properties].sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0)).slice(0, 5);

  // Best by rentability
  const bestRentability = [...properties].filter((p) => (p.rentability || 0) > 0).sort((a, b) => (b.rentability || 0) - (a.rentability || 0)).slice(0, 5);

  return (
    <PageShell
      eyebrow="Oportunidades"
      title="Melhores Oportunidades"
      description="Ranking das melhores oportunidades imobiliárias em Portugal, ordenadas por score."
    >
      {properties.length === 0 ? (
        <EmptyState
          title="Nenhum imóvel encontrado"
          description="Ainda não há imóveis ativos para ordenar."
        />
      ) : (
        <>
          <Section
            index="01"
            eyebrow="Pódio"
            title="Top 3 por score"
            description="Os três imóveis com a pontuação mais alta entre os anúncios ativos."
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
              {top10.slice(0, 3).map((prop, i) => {
                const rank = i + 1;
                const placement =
                  rank === 1
                    ? "lg:col-start-2 lg:row-start-1"
                    : rank === 2
                      ? "lg:col-start-1 lg:row-start-2"
                      : "lg:col-start-3 lg:row-start-2";

                return (
                  <div key={prop.id} className={placement}>
                    <PodiumCard property={prop} rank={rank} />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section
            index="02"
            eyebrow="Território"
            title="Melhor por distrito"
            description="O imóvel com melhor score em Lisboa, Porto e Braga."
          >
            <div className="grid gap-6 md:grid-cols-3">
              {byDistrict.map(({ district, best, count }) => (
                <div key={district} className="flex flex-col gap-4">
                  <StatCard label={district} value={count} hint="imóveis neste distrito" />
                  <Link
                    href={best ? `/imovel/${best.id}` : "#"}
                    className="group flex flex-1 flex-col border border-rp-line bg-rp-surface p-4 shadow-rp-1 transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(18,24,33,.18)]"
                  >
                    <span className="rp-eyebrow text-rp-cobalt">melhor score</span>
                    <span className="rp-display mt-1 text-[19px] leading-snug text-rp-ink">
                      {best ? best.title : "Sem imóveis registados"}
                    </span>
                    <span className="mt-auto flex items-end justify-between gap-3 pt-4">
                      <span className="rp-num text-[18px] text-rp-ink">
                        {best ? formatEuros(best.price) : "—"}
                      </span>
                      <span className="rp-num text-[13px] text-rp-muted">
                        {best ? formatScoreOutOf100(best.score) : ""}
                      </span>
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </Section>

          <Section
            index="03"
            eyebrow="Classificação"
            title="Top 10 por score"
            description="Os dez imóveis mais bem pontuados, por ordem decrescente."
          >
            <ol className="border-t border-rp-line">
              {top10.map((prop, i) => {
                const imageUrl = firstImage(prop.images);

                return (
                  <li key={prop.id} className="border-b border-rp-line">
                    <Link
                      href={`/imovel/${prop.id}`}
                      className="group flex min-h-11 items-center gap-4 py-4 transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:bg-rp-ceramic"
                    >
                      <span className="rp-num w-9 shrink-0 text-[18px] text-rp-cobalt">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {imageUrl ? (
                        <span className="relative hidden h-12 w-16 shrink-0 overflow-hidden border border-rp-line bg-rp-ceramic sm:block">
                          <PropertyImage src={imageUrl} alt="" fill className="object-cover" />
                        </span>
                      ) : null}

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-rp-ink group-hover:text-rp-cobalt">
                          {prop.title}
                        </span>
                        <span className="block truncate text-[13px] text-rp-muted">
                          {prop.municipality}, {prop.district} · {prop.sourceName}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span className="rp-num block text-[16px] text-rp-ink">
                          {formatEuros(prop.price)}
                        </span>
                        <span className="rp-num block text-[12px] text-rp-muted">
                          {discountLabel(prop.discountPct)} · {formatScoreOutOf100(prop.score)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Section>

          <Section
            index="04"
            eyebrow="Desconto"
            title="Maiores descontos"
            description="Os cinco imóveis com a maior diferença face ao valor estimado."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bestDiscount.map((prop) => (
                <div key={prop.id} className={DS_CARD}>
                  <DsPropertyCard
                    title={prop.title}
                    location={`${prop.municipality}, ${prop.district}`}
                    askingPrice={prop.price}
                    estimatedValue={prop.marketValue}
                    badges={[{ kind: "opportunity", label: discountLabel(prop.discountPct) }]}
                    href={`/imovel/${prop.id}`}
                    source={prop.sourceName}
                    imageUrl={proxiedImage(prop.images)}
                    imageAlt={prop.title}
                    status={prop.checkStatus === "ok" ? "estimated" : "to-verify"}
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section
            index="05"
            eyebrow="Rendimento"
            title="Melhor rentabilidade"
            description="Os cinco imóveis com o maior rendimento anual estimado."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bestRentability.map((prop) => (
                <div key={prop.id} className={DS_CARD}>
                  <DsPropertyCard
                    title={prop.title}
                    location={`${prop.municipality}, ${prop.district}`}
                    askingPrice={prop.price}
                    estimatedValue={prop.marketValue}
                    badges={[{ kind: "confidence-high", label: formatOptional(prop.rentability, "%") }]}
                    href={`/imovel/${prop.id}`}
                    source={prop.sourceName}
                    imageUrl={proxiedImage(prop.images)}
                    imageAlt={prop.title}
                    status={prop.checkStatus === "ok" ? "estimated" : "to-verify"}
                  />
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </PageShell>
  );
}
