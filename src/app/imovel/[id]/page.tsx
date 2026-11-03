import { db } from "@/db";
import { properties, priceHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ExternalLink,
  Gavel,
  Info,
  MapPin,
  TrendingDown,
  X,
} from "lucide-react";
import ValuationCard from "@/components/ValuationCard";
import {
  calculateMaxBid,
  getCostBreakdownText,
  type AuctionCalculationResult,
} from "@/lib/auction-calculator";
import { formatEuros, formatOptional, formatScoreOutOf100 } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";
import PropertyImage from "@/components/PropertyImage";
import AuctionCountdown from "@/components/AuctionCountdown";
import SimilarProperties from "@/components/SimilarProperties";
import CommuteEstimator from "@/components/CommuteEstimator";
import VerifiedBadge from "@/components/VerifiedBadge";
import SourceReliabilityBadge from "@/components/SourceReliabilityBadge";
import VisitBooking from "@/components/VisitBooking";
import NeighborhoodRadar from "@/components/NeighborhoodRadar";
import PageShell from "@/components/ds/PageShell";
import Badge from "@/components/ds/Badge";
import PriceEstimateBar from "@/components/ds/PriceEstimateBar";

const CHART_W = 600;
const CHART_H = 200;
const CHART_PAD = 20;
const COBALT = "#1F4FA3";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (result.length === 0) notFound();
  const prop = result[0];

  // Get price history
  const history = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.propertyId, id))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(10);

  const images = prop.images ? JSON.parse(prop.images) : [];
  const imageUrl = images[0] || null;
  const isVerified = prop.checkStatus === "ok";
  const hasImage = !!(prop.image_url && prop.image_status === "real");

  // Auction max bid calculation
  let auctionCalculation: AuctionCalculationResult | null = null;
  if (prop.isAuction && prop.marketValue) {
    auctionCalculation = calculateMaxBid({
      marketValue: prop.marketValue,
      currentBid: prop.currentBid ?? 0,
      auctionHouse: prop.auctionHouse ?? undefined,
      vpt: prop.vpt ?? undefined,
      condominiumDebt: prop.condominiumDebt ?? 0,
      renovationEstimate: prop.renovationEstimate ?? 0,
      targetMargin: 15,
    });
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: prop.title,
    description: `${prop.type} em ${prop.municipality}, ${prop.district}`,
    url: `https://radarpro-portugal.vercel.app/imovel/${prop.id}`,
    datePosted: prop.createdAt?.toISOString(),
    price: prop.price,
    priceCurrency: "EUR",
    address: {
      "@type": "PostalAddress",
      addressLocality: prop.municipality,
      addressRegion: prop.district,
      addressCountry: "PT",
    },
    ...(imageUrl && { image: imageUrl }),
  };

  const priceChange =
    history.length >= 2
      ? ((history[0].price - history[history.length - 1].price) /
          history[history.length - 1].price) *
        100
      : 0;

  // Série cronológica (antigo → recente), sem mutar o array da query.
  const series = [...history].reverse();
  const seriesPrices = series.map((h) => h.price);
  const minPrice = seriesPrices.length ? Math.min(...seriesPrices) : 0;
  const maxPrice = seriesPrices.length ? Math.max(...seriesPrices) : 1;
  const priceSpan = maxPrice - minPrice || Math.max(minPrice * 0.02, 1);
  const axisLo = minPrice - priceSpan * 0.15;
  const axisHi = maxPrice + priceSpan * 0.15;
  const xFor = (i: number) =>
    series.length > 1 ? (i / (series.length - 1)) * CHART_W : CHART_W / 2;
  const yFor = (price: number) =>
    CHART_H - CHART_PAD - ((price - axisLo) / (axisHi - axisLo)) * (CHART_H - CHART_PAD * 2);
  const linePoints = series.map((h, i) => `${xFor(i)},${yFor(h.price)}`).join(" ");
  const areaPoints = `${linePoints} ${CHART_W},${CHART_H} 0,${CHART_H}`;
  const historyRising =
    series.length > 1 && series[series.length - 1].price > series[0].price;
  return (
    <PageShell backHref="/" backLabel="Voltar ao início">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
        {/* Imagem */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-rp border border-rp-line bg-rp-ceramic">
          <PropertyImage src={imageUrl} alt={prop.title} fill />
          <div className="absolute left-0 top-0 z-10 p-3">
            <VerifiedBadge isVerified={isVerified} hasImage={hasImage} />
          </div>
          <div className="absolute bottom-0 right-0 z-10 p-3">
            <AuctionCountdown
              endDate={Math.floor(new Date(prop.auctionEndDate!).getTime() / 1000)}
              compact
            />
          </div>
        </div>

        {/* Cabeçalho e resumo */}
        <div className="flex flex-col gap-6">
          <header>
            <p className="rp-eyebrow flex items-center gap-1.5 text-rp-cobalt">
              <MapPin size={13} aria-hidden="true" />
              {prop.municipality}, {prop.district}
            </p>
            <h1 className="rp-display mt-3 text-[34px] leading-[1.08] text-rp-ink sm:text-[42px]">
              {prop.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge
                kind={prop.valuationConfidence === "very_low" ? "confidence-low" : "confidence-high"}
                label={formatScoreOutOf100(prop.score)}
              />
              <span className="rp-eyebrow inline-flex items-center rounded-rp border border-rp-line bg-rp-ceramic px-2 py-[3px] text-[12px] text-rp-muted">
                {prop.type}
              </span>
              {prop.isAuction ? (
                <span className="rp-eyebrow inline-flex items-center gap-1.5 rounded-rp border border-rp-orange bg-[rgba(242,107,58,.14)] px-2 py-[3px] text-[12px] text-rp-anomaly">
                  <Gavel size={12} aria-hidden="true" />
                  Leilão
                </span>
              ) : null}
              <SourceReliabilityBadge sourceName={prop.sourceName} score={prop.score} />
            </div>
          </header>

          {prop.valuationConfidence === "very_low" ? (
            <div
              className="flex items-start gap-2 border border-rp-amber bg-[rgba(224,160,48,.14)] p-3 text-[14px] font-medium text-rp-ink-2"
              role="alert"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rp-amber" aria-hidden="true" />
              <span>Confiança muito baixa na avaliação — score limitado a 40</span>
            </div>
          ) : null}

          <div className="border border-rp-line bg-rp-surface p-5 shadow-rp-1">
            <p className="rp-eyebrow text-rp-muted">Preço de venda</p>
            <p className="rp-num mt-2 text-[40px] leading-none text-rp-ink">
              {prop.price.toLocaleString()}€
            </p>
            <div className="mt-4">
              <PriceEstimateBar
                askingPrice={prop.price}
                estimatedValue={prop.marketValue}
                rangePct={10}
                status={isVerified ? "estimated" : "to-verify"}
              />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-rp-line pt-4">
              <div>
                <dt className="rp-eyebrow text-rp-muted">Valor de mercado</dt>
                <dd className="rp-num mt-1 text-[22px] leading-none text-rp-cobalt">
                  {formatEuros(prop.marketValue)}
                </dd>
              </div>
              <div>
                <dt className="rp-eyebrow text-rp-muted">Rentabilidade</dt>
                <dd className="rp-num mt-1 text-[22px] leading-none text-rp-ink">
                  {formatOptional(prop.rentability, "%")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
            <span className="inline-flex items-center gap-1.5">
              <TrendingDown size={16} className="text-rp-anomaly" aria-hidden="true" />
              <span className="rp-num font-medium text-rp-anomaly">
                {formatOptional(prop.discountPct === null ? null : -prop.discountPct, "%")}
              </span>
              <span className="text-rp-muted">abaixo do mercado</span>
            </span>
            {priceChange !== 0 ? (
              <span
                className={`inline-flex items-center gap-1.5 ${
                  priceChange < 0 ? "text-rp-cobalt" : "text-rp-anomaly"
                }`}
              >
                {priceChange < 0 ? (
                  <ArrowDown size={16} aria-hidden="true" />
                ) : (
                  <ArrowUp size={16} aria-hidden="true" />
                )}
                <span className="rp-num font-medium">{Math.abs(priceChange).toFixed(1)}%</span>
                <span className="text-rp-muted">desde o primeiro registo</span>
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={prop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-rp border border-rp-ink bg-rp-ink px-5 py-2.5 text-[15px] font-medium text-rp-surface shadow-rp-2 transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--rp-cobalt)]"
            >
              Ver anúncio original <ExternalLink size={16} aria-hidden="true" />
            </a>
            <FavoriteButton propertyId={prop.id} />
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
        {/* Coluna principal */}
        <div className="flex flex-col gap-10">
          {/* Lance máximo recomendado */}
          {prop.isAuction && auctionCalculation ? (
            <section className="border border-rp-line bg-rp-surface p-6 shadow-rp-1">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-rp-cobalt" aria-hidden="true" />
                <h2 className="rp-display text-[20px] leading-tight text-rp-ink">
                  Lance máximo recomendado
                </h2>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="rp-eyebrow text-rp-muted">Lance atual</dt>
                  <dd className="rp-num mt-1 text-[24px] leading-none text-rp-ink">
                    {auctionCalculation.currentBid.toLocaleString("pt-PT")}€
                  </dd>
                </div>
                <div>
                  <dt className="rp-eyebrow text-rp-muted">Máx. lance</dt>
                  <dd
                    className={`rp-num mt-1 text-[24px] leading-none ${
                      auctionCalculation.currentBidExceedsMax ? "text-rp-anomaly" : "text-rp-cobalt"
                    }`}
                  >
                    {auctionCalculation.maxBid.toLocaleString("pt-PT")}€
                  </dd>
                </div>
              </dl>
              <p
                className={`mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium ${
                  auctionCalculation.currentBidExceedsMax ? "text-rp-anomaly" : "text-rp-cobalt"
                }`}
              >
                {auctionCalculation.currentBidExceedsMax ? (
                  <>
                    <AlertTriangle size={14} aria-hidden="true" />
                    Acima do lance máximo — não recomendado
                  </>
                ) : (
                  <>
                    <Check size={14} aria-hidden="true" />
                    Margem de {auctionCalculation.headroom.toLocaleString("pt-PT")}€
                  </>
                )}
              </p>
              <details className="group mt-3 border-t border-rp-line pt-3">
                <summary className="rp-eyebrow flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-rp-cobalt">
                  <ChevronDown
                    size={14}
                    className="transition-transform duration-[var(--rp-dur-2)] group-open:rotate-180"
                    aria-hidden="true"
                  />
                  Como calculámos?
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-rp-ink-2">
                  {getCostBreakdownText(auctionCalculation).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </details>
            </section>
          ) : null}

          {/* Análise de leilão */}
          {prop.isAuction && auctionCalculation ? (
            <section className="border border-rp-line bg-rp-surface p-6">
              <h2 className="rp-display flex items-center gap-2 text-[24px] leading-tight text-rp-ink">
                <Gavel size={20} className="text-rp-orange" aria-hidden="true" />
                Análise de leilão
              </h2>

              <div className="mt-5 border border-rp-amber bg-[rgba(224,160,48,.12)] p-4">
                <p className="flex items-start gap-2 text-[14px] font-medium text-rp-ink-2">
                  <Info size={14} className="mt-0.5 shrink-0 text-rp-amber" aria-hidden="true" />
                  Regra do VPT:
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-rp-ink-2">
                  Os impostos (IMT e Imposto do Selo) incidem sobre o maior entre o valor de
                  mercado e o VPT: <strong>max(lance, VPT)</strong>.
                  {prop.vpt ? (
                    <>
                      {" "}
                      VPT deste imóvel:{" "}
                      <span className="rp-num font-medium text-rp-ink">
                        {prop.vpt.toLocaleString("pt-PT")}€
                      </span>
                      .
                    </>
                  ) : null}
                </p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="border border-rp-line bg-rp-ceramic p-4">
                  <h3 className="rp-eyebrow text-rp-muted">Custos de aquisição</h3>
                  <dl className="mt-3 space-y-2 text-[14px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Comissão da leiloeira</dt>
                      <dd className="rp-num text-rp-ink-2">
                        {auctionCalculation.auctionHouseConfig.commissionPct}%
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Valor</dt>
                      <dd className="rp-num text-rp-anomaly">
                        -{auctionCalculation.commission.toLocaleString("pt-PT")}€
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">IMT estimado</dt>
                      <dd className="rp-num text-rp-ink-2">
                        {auctionCalculation.auctionHouseConfig.imtPct}%
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Valor</dt>
                      <dd className="rp-num text-rp-anomaly">
                        -{auctionCalculation.imt.toLocaleString("pt-PT")}€
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Imposto do Selo</dt>
                      <dd className="rp-num text-rp-ink-2">
                        {auctionCalculation.auctionHouseConfig.stampDutyPct}%
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Valor</dt>
                      <dd className="rp-num text-rp-anomaly">
                        -{auctionCalculation.stampDuty.toLocaleString("pt-PT")}€
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-rp-line bg-rp-ceramic p-4">
                  <h3 className="rp-eyebrow text-rp-muted">Custos adicionais</h3>
                  <dl className="mt-3 space-y-2 text-[14px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Dívida de condomínio</dt>
                      <dd className="rp-num text-rp-anomaly">
                        -{auctionCalculation.condominiumDebt.toLocaleString("pt-PT")}€
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Renovação estimada</dt>
                      <dd className="rp-num text-rp-anomaly">
                        -{auctionCalculation.renovationEstimate.toLocaleString("pt-PT")}€
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">Registo e custas</dt>
                      <dd className="text-rp-ink-2">incluído nos custos</dd>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-rp-line pt-2">
                      <dt className="font-medium text-rp-ink">Custos totais</dt>
                      <dd className="rp-num text-rp-anomaly">
                        -{auctionCalculation.totalCosts.toLocaleString("pt-PT")}€
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-4 border border-rp-line bg-rp-ceramic p-4">
                <h3 className="rp-eyebrow text-rp-muted">Base de tributação (VPT)</h3>
                <dl className="mt-3 space-y-2 text-[14px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-rp-muted">Valor de mercado</dt>
                    <dd className="rp-num text-rp-ink-2">{formatEuros(prop.marketValue)}</dd>
                  </div>
                  {prop.vpt ? (
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-rp-muted">VPT</dt>
                      <dd className="rp-num text-rp-ink-2">
                        {prop.vpt.toLocaleString("pt-PT")}€
                      </dd>
                    </div>
                  ) : null}
                  <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-rp-line pt-2">
                    <dt className="font-medium text-rp-ink">Base de imposto (max)</dt>
                    <dd className="rp-num text-rp-orange">
                      {Math.max(prop.marketValue ?? 0, prop.vpt ?? 0).toLocaleString("pt-PT")}€
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 border border-rp-orange bg-[rgba(242,107,58,.10)] p-4">
                <h3 className="rp-eyebrow text-rp-ink-2">Resumo do lance máximo</h3>
                <dl className="mt-3 space-y-2 text-[14px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-rp-muted">Valor de mercado</dt>
                    <dd className="rp-num text-rp-ink-2">
                      {auctionCalculation.marketValue.toLocaleString("pt-PT")}€
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-rp-muted">Margem de segurança (15%)</dt>
                    <dd className="rp-num text-rp-anomaly">
                      -{Math.round(auctionCalculation.marketValue * 0.15).toLocaleString("pt-PT")}€
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-rp-muted">Custos totais</dt>
                    <dd className="rp-num text-rp-anomaly">
                      -{auctionCalculation.totalCosts.toLocaleString("pt-PT")}€
                    </dd>
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3 border-t border-rp-line pt-2">
                    <dt className="text-[15px] font-medium text-rp-ink">
                      Lance máximo recomendado
                    </dt>
                    <dd className="rp-num text-[18px] text-rp-orange">
                      {auctionCalculation.maxBid.toLocaleString("pt-PT")}€
                    </dd>
                  </div>
                </dl>
                <p
                  className={`mt-3 inline-flex items-start gap-1.5 text-[13px] font-medium ${
                    auctionCalculation.currentBidExceedsMax ? "text-rp-anomaly" : "text-rp-cobalt"
                  }`}
                >
                  {auctionCalculation.currentBidExceedsMax ? (
                    <>
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                      Lance atual ({auctionCalculation.currentBid.toLocaleString("pt-PT")}€) excede
                      o máximo recomendado
                    </>
                  ) : (
                    <>
                      <Check size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                      Margem disponível: {auctionCalculation.headroom.toLocaleString("pt-PT")}€
                    </>
                  )}
                </p>
              </div>
            </section>
          ) : null}

          {/* Valuation */}
          <ValuationCard
            district={prop.district}
            municipality={prop.municipality}
            type={prop.type}
            price={prop.price}
            marketValue={prop.marketValue}
            rentability={prop.rentability}
            sourceName={prop.sourceName}
            source={prop.source}
            createdAt={prop.createdAt?.toISOString() || null}
            isActive={prop.isActive ?? true}
            isAuction={prop.isAuction}
            currentBid={prop.currentBid}
            auctionType={prop.auctionType}
            vpt={prop.vpt}
            condominiumDebt={prop.condominiumDebt}
            renovationEstimate={prop.renovationEstimate}
          />

          {/* AVM transparency */}
          <section className="border border-rp-line bg-rp-surface p-5">
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[15px] font-medium text-rp-ink">
                <Info size={16} className="text-rp-cobalt" aria-hidden="true" />
                Como calculámos este valor?
              </summary>
              <dl className="mt-4 grid grid-cols-2 gap-4 border border-rp-line bg-rp-ceramic p-4 sm:grid-cols-4">
                <div>
                  <dt className="rp-eyebrow text-rp-muted">Valor de mercado (AVM)</dt>
                  <dd className="rp-num mt-1 text-[15px] font-medium text-rp-ink">
                    {formatEuros(prop.marketValue)}
                  </dd>
                </div>
                <div>
                  <dt className="rp-eyebrow text-rp-muted">Confiança</dt>
                  <dd className="mt-1 text-[15px] font-medium text-rp-ink">
                    {prop.marketValue ? "Alta (valor do anúncio)" : "Média (modelo estatístico)"}
                  </dd>
                </div>
                <div>
                  <dt className="rp-eyebrow text-rp-muted">Preço/m²</dt>
                  <dd className="rp-num mt-1 text-[15px] font-medium text-rp-ink">
                    {prop.marketValue ? Math.round(prop.price / 70) : "—"}€/m²
                  </dd>
                </div>
                <div>
                  <dt className="rp-eyebrow text-rp-muted">Faixa de confiança</dt>
                  <dd className="rp-num mt-1 text-[15px] font-medium text-rp-ink">
                    {prop.marketValue
                      ? Math.round(prop.marketValue * 0.9).toLocaleString("pt-PT") +
                        "€ – " +
                        Math.round(prop.marketValue * 1.1).toLocaleString("pt-PT") +
                        "€"
                      : "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[12px] italic leading-relaxed text-rp-muted">
                Esta é uma estimativa automática baseada em dados de mercado públicos e não uma
                avaliação oficial. Para uma decisão de compra, consulte um profissional
                certificado.
              </p>
            </details>
          </section>

          {/* Commute estimator */}
          {prop.lat && prop.lng ? <CommuteEstimator propertyLat={prop.lat} propertyLng={prop.lng} /> : null}

          {/* Neighborhood Radar */}
          {prop.lat && prop.lng ? (
            <NeighborhoodRadar district={prop.district} municipality={prop.municipality} />
          ) : null}
        </div>

        {/* Coluna lateral */}
        <aside className="flex flex-col gap-10">
          {/* Histórico de preço */}
          {history.length > 1 ? (
            <section className="border border-rp-line bg-rp-surface p-5">
              <h2 className="rp-display text-[20px] leading-tight text-rp-ink">
                Histórico de preço
              </h2>
              <div className="relative mt-5 h-48 w-full">
                <svg
                  className="h-full w-full"
                  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`Evolução do preço de ${formatEuros(history[history.length - 1].price)} para ${formatEuros(history[0].price)}.`}
                >
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COBALT} stopOpacity="0.28" />
                      <stop offset="100%" stopColor={COBALT} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={CHART_PAD + (i * (CHART_H - CHART_PAD * 2)) / 4}
                      x2={CHART_W}
                      y2={CHART_PAD + (i * (CHART_H - CHART_PAD * 2)) / 4}
                      stroke="rgba(18,24,33,0.14)"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  <polygon points={areaPoints} fill="url(#priceGradient)" />
                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke={COBALT}
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                  />
                  {series.map((h, i) => (
                    <circle
                      key={h.id}
                      cx={xFor(i)}
                      cy={yFor(h.price)}
                      r={3}
                      fill={COBALT}
                      stroke="var(--rp-surface)"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-[12px] text-rp-muted">
                {series.map((h, i) => (
                  <span
                    key={h.id}
                    className={`w-full text-center ${
                      i === 0 || i === series.length - 1 ? "font-medium text-rp-ink" : ""
                    }`}
                  >
                    {h.recordedAt
                      ? new Date(h.recordedAt).toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </span>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[12px] text-rp-muted">
                {series.map((h) => (
                  <span key={h.id} className="rp-num w-full text-right">
                    {h.price.toLocaleString()}€
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-rp-line pt-3 text-[13px] text-rp-muted">
                <span>
                  Primeira:{" "}
                  <span className="rp-num text-rp-ink-2">
                    {history[history.length - 1].price.toLocaleString()}€
                  </span>
                </span>
                <span>
                  Atual:{" "}
                  <span className="rp-num text-rp-ink-2">{history[0].price.toLocaleString()}€</span>
                </span>
                {series.length >= 2 ? (
                  <span
                    className={`rp-num font-medium ${historyRising ? "text-rp-anomaly" : "text-rp-cobalt"}`}
                  >
                    {((history[0].price - history[history.length - 1].price) /
                      history[history.length - 1].price) *
                      100 >=
                    0
                      ? "+"
                      : ""}
                    {(
                      ((history[0].price - history[history.length - 1].price) /
                        history[history.length - 1].price) *
                      100
                    ).toFixed(0)}
                    % vs inicial
                  </span>
                ) : null}
              </div>
            </section>
          ) : null}

          {/* Detalhes */}
          <section className="border border-rp-line bg-rp-surface p-5">
            <h2 className="rp-display text-[20px] leading-tight text-rp-ink">Detalhes</h2>
            <dl className="mt-4 space-y-3 text-[14px]">
              <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                <dt className="text-rp-muted">Tipo</dt>
                <dd className="font-medium text-rp-ink">{prop.type}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                <dt className="text-rp-muted">Fonte</dt>
                <dd className="font-medium text-rp-ink">{prop.sourceName}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                <dt className="text-rp-muted">Distrito</dt>
                <dd className="font-medium text-rp-ink">{prop.district}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                <dt className="text-rp-muted">Concelho</dt>
                <dd className="font-medium text-rp-ink">{prop.municipality}</dd>
              </div>
              {prop.createdAt ? (
                <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                  <dt className="text-rp-muted">Atualizado</dt>
                  <dd className="rp-num font-medium text-rp-ink">
                    {new Date(prop.createdAt).toLocaleDateString("pt-PT")}
                  </dd>
                </div>
              ) : null}
              {prop.lastChecked ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-rp-muted">Última verificação</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-rp-ink">
                    {prop.checkStatus === "ok" ? (
                      <Check size={14} className="text-rp-cobalt" aria-label="Anúncio ativo" />
                    ) : prop.checkStatus === "not_found" ? (
                      <X size={14} className="text-rp-anomaly" aria-label="Anúncio não encontrado" />
                    ) : null}
                    <span className="rp-num">
                      {new Date(prop.lastChecked).toLocaleDateString("pt-PT")}
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {/* Agendar visita */}
          <VisitBooking propertyTitle={prop.title} propertyId={prop.id} sourceName={prop.sourceName} />
        </aside>
      </div>

      {/* Imóveis semelhantes */}
      <SimilarProperties
        currentPropertyId={prop.id}
        district={prop.district}
        type={prop.type}
        price={prop.price}
      />
    </PageShell>
  );
}
