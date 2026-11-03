"use client";

import Link from "next/link";
import { AlertTriangle, Gavel, MapPin, TrendingDown } from "lucide-react";
import PropertyImage from "@/components/PropertyImage";
import Badge, { type BadgeKind } from "@/components/ds/Badge";
import PriceEstimateBar from "@/components/ds/PriceEstimateBar";
import { formatEuros } from "@/lib/format";

interface PropertyCardProps {
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
  type: string;
  images: string | null;
  isAuction: boolean | null;
  auctionEndDate: number | Date | null;
  checkStatus?: string | null;
  currentBid: number | null;
  maxBid: number | null;
  sqm?: number | null;
  rentability?: number | null;
  valuationConfidence?: string | null;
  assetClass?: string | null;
}

const CHIP = "rp-eyebrow absolute z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5";

function parseImages(images: string | null): string[] {
  if (!images || typeof images !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(images);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function getScoreLabel(score: number | null): string {
  if (score === null) return "--";
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Boa";
  return "Moderada";
}

function getScoreTone(score: number | null, confidence?: string | null): string {
  if (score === null) return "text-rp-muted";
  if (confidence === "very_low") return "text-rp-anomaly";
  if (score >= 85) return "text-rp-cobalt";
  if (score >= 70) return "text-rp-accent";
  return "text-rp-ink-2";
}

function buildBadges(
  isVerified: boolean,
  marketValue: number | null,
  valuationConfidence?: string | null,
  checkStatus?: string | null,
): { kind: BadgeKind; label?: string }[] {
  const badges: { kind: BadgeKind; label?: string }[] = [];

  if (isVerified) badges.push({ kind: "confidence-high", label: "Verificado" });
  else if (checkStatus !== undefined && checkStatus !== null) badges.push({ kind: "to-verify" });

  if (marketValue === null) badges.push({ kind: "no-valuation" });

  if (valuationConfidence === "high") badges.push({ kind: "confidence-high" });
  else if (valuationConfidence === "medium") badges.push({ kind: "confidence-medium" });
  else if (valuationConfidence === "low") badges.push({ kind: "confidence-low" });
  else if (valuationConfidence === "very_low") {
    badges.push({ kind: "confidence-low", label: "Confiança muito baixa" });
  }

  return badges;
}

export default function PropertyCard({
  id,
  title,
  district,
  municipality,
  sourceName,
  price,
  marketValue,
  discountPct,
  score,
  type,
  images,
  isAuction,
  auctionEndDate,
  checkStatus,
  currentBid,
  maxBid,
  sqm,
  rentability,
  valuationConfidence,
}: PropertyCardProps) {
  const imageUrl = parseImages(images)[0] ?? null;
  const isVerified = checkStatus === "ok";

  let auctionDaysLeft: number | null = null;
  if (auctionEndDate) {
    const end = typeof auctionEndDate === "number" ? auctionEndDate * 1000 : new Date(auctionEndDate).getTime();
    auctionDaysLeft = Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const auctionMargin = currentBid !== null && maxBid !== null && maxBid > 0 ? maxBid - currentBid : null;
  const auctionAboveMax = currentBid !== null && maxBid !== null && currentBid >= maxBid;

  const badges = buildBadges(isVerified, marketValue, valuationConfidence, checkStatus);
  const askingPrice = isAuction && currentBid !== null ? currentBid : price;

  const isAuctionListing = isAuction && auctionDaysLeft !== null && auctionDaysLeft >= 0;
  const saleTypeText = isAuctionListing
    ? `Leilão • fecha em ${auctionDaysLeft} dias`
    : "Preço fixo";
  const saleTypeTone = isAuctionListing ? "bg-rp-orange text-rp-ink" : "bg-rp-ink text-rp-surface";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-rp border border-rp-line bg-rp-surface shadow-rp-1 transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(18,24,33,.18)]">
      {imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-rp-line bg-rp-ceramic">
          <Link
            href={`/imovel/${id}`}
            tabIndex={-1}
            aria-hidden="true"
            prefetch={false}
            className="absolute inset-0 block"
          >
            <PropertyImage
              src={imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] group-hover:scale-105"
            />
          </Link>

          <span className={`${CHIP} left-0 top-0 ${saleTypeTone}`}>
            {isAuctionListing ? <Gavel size={12} aria-hidden="true" /> : null}
            {saleTypeText}
          </span>

          <span className="rp-num absolute right-0 top-0 z-10 border-b border-l border-rp-line bg-rp-surface px-3 py-2 text-[13px] text-rp-ink">
            {score !== null ? score : "--"}
            <span className="ml-0.5 text-[11px] text-rp-muted">/100</span>
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-rp-line bg-rp-ink px-4 py-2.5">
          <span
            className={`rp-eyebrow inline-flex min-w-0 items-center gap-1.5 ${
              isAuctionListing ? "text-rp-orange" : "text-rp-surface"
            }`}
          >
            {isAuctionListing ? <Gavel size={12} aria-hidden="true" /> : null}
            <span className="truncate">{saleTypeText}</span>
          </span>
          <span className="rp-num shrink-0 text-[13px] text-rp-surface">
            {score !== null ? score : "--"}
            <span className="ml-0.5 text-[11px] text-rp-surface/70">/100</span>
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={`${badge.kind}-${index}`} kind={badge.kind} label={badge.label} />
            ))}
          </div>
        ) : null}

        <div>
          <h3 className="flex items-center rp-display text-[20px] leading-snug text-rp-ink">
            <Link
              href={`/imovel/${id}`}
              prefetch={false}
              className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-rp-muted">
            <MapPin size={14} aria-hidden="true" />
            <span className="truncate">
              {municipality}, {district}
            </span>
          </p>
        </div>

        <div>
          <p className="rp-eyebrow text-rp-muted">
            {isAuction && currentBid !== null ? "lance atual" : "preço pedido"}
          </p>
          <p className="rp-num text-[24px] font-medium leading-tight text-rp-ink">
            {isAuction && currentBid !== null ? formatEuros(currentBid) : formatEuros(price)}
          </p>

          {isAuction && currentBid !== null && maxBid !== null && maxBid > 0 && (
            <p className="mt-1 text-[13px] text-rp-ink-2">
              Máx. p/ 15% margem: {formatEuros(maxBid)}
            </p>
          )}

          {discountPct !== null && discountPct > 0 && (
            <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-rp-anomaly">
              <TrendingDown size={12} aria-hidden="true" /> -{discountPct}% mercado
            </p>
          )}
        </div>

        {isAuction && auctionAboveMax && (
          <p className="inline-flex w-fit items-center gap-1.5 border border-rp-anomaly bg-rp-ceramic px-2 py-1 text-[12px] text-rp-anomaly">
            <AlertTriangle size={12} aria-hidden="true" />
            Acima do lance máximo
          </p>
        )}

        {isAuction && auctionMargin !== null && auctionMargin > 0 && !auctionAboveMax && (
          <p className="inline-flex w-fit items-center gap-1.5 border border-rp-cobalt bg-rp-ceramic px-2 py-1 text-[12px] text-rp-cobalt">
            Margem: {formatEuros(auctionMargin)}
          </p>
        )}

        <dl className="grid grid-cols-3 gap-2 border-y border-rp-line py-2.5">
          <div className="min-w-0">
            <dt className="rp-eyebrow text-rp-muted">área</dt>
            <dd className="rp-num mt-1 truncate text-[13px] text-rp-ink">{sqm ? `${sqm}m²` : "— m²"}</dd>
          </div>
          <div className="min-w-0">
            <dt className="rp-eyebrow text-rp-muted">tipo</dt>
            <dd className="mt-1 truncate text-[13px] text-rp-ink">{type}</dd>
          </div>
          <div className="min-w-0">
            <dt className="rp-eyebrow text-rp-muted">fonte</dt>
            <dd className="mt-1 truncate text-[13px] text-rp-ink">{sourceName}</dd>
          </div>
        </dl>

        {rentability !== null && rentability !== undefined && (
          <p className="rp-num text-[13px] text-rp-ink-2">Rentabilidade: {rentability}%</p>
        )}

        <PriceEstimateBar
          askingPrice={askingPrice}
          estimatedValue={marketValue}
          status={isVerified ? "estimated" : "to-verify"}
        />

        <div className="flex items-center gap-2">
          <span className={`rp-eyebrow ${getScoreTone(score, valuationConfidence)}`}>
            {getScoreLabel(score)}
          </span>
          <span className="rp-num text-[12px] text-rp-muted">
            {score !== null ? `${score}/100` : "—"}
          </span>
        </div>

        <Link
          href={`/imovel/${id}`}
          prefetch={false}
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-1.5 border border-rp-ink bg-rp-ink px-4 text-[15px] text-rp-surface transition-[transform,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--rp-cobalt)] active:translate-x-0 active:translate-y-0"
        >
          Ver detalhes <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
