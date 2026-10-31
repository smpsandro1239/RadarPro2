"use client";

import Link from "next/link";
import { MapPin, Gavel, CheckCircle, TrendingDown, AlertTriangle, ChevronDown } from "lucide-react";
import PropertyImage from "@/components/PropertyImage";

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
  checkStatus: string | null;
  currentBid: number | null;
  maxBid: number | null;
  sqm?: number | null;
  valuationConfidence?: string | null;
  assetClass?: string | null;
}

function getScoreColor(score: number | null, confidence?: string | null): string {
  if (score === null) return "text-slate-400";
  if (confidence === "very_low") return "text-red-500 font-extrabold";
  if (score >= 85) return "text-success font-extrabold";
  if (score >= 70) return "text-warning font-bold";
  return "text-muted font-semibold";
}

function getScoreBadgeVariant(score: number | null, confidence?: string | null): string {
  if (score === null) return "bg-slate-100 text-slate-500";
  if (confidence === "very_low") return "bg-red-50 text-red-700 border border-red-100";
  if (score >= 85) return "bg-success/10 text-success border border-success/20";
  if (score >= 70) return "bg-warning/10 text-warning border border-warning/20";
  return "bg-slate-50 text-slate-600 border border-slate-200";
}

function getScoreLabel(score: number | null): string {
  if (score === null) return "--";
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Boa";
  return "Moderada";
}

export default function PropertyCard({
  id,
  title,
  district,
  municipality,
  sourceName,
  source,
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
  valuationConfidence,
  assetClass,
}: PropertyCardProps) {
  const imageList = images ? (typeof images === "string" ? JSON.parse(images) : images) : [];
  const imageUrl = imageList[0] || null;
  const isVerified = checkStatus === "ok";
  const formattedPrice = price.toLocaleString("pt-PT");

  // Calcular dias restantes do leilão
  let auctionDaysLeft: number | null = null;
  if (auctionEndDate) {
    const end = typeof auctionEndDate === "number" ? auctionEndDate * 1000 : new Date(auctionEndDate).getTime();
    const now = Date.now();
    auctionDaysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  // Badge de margem do leilão
  const auctionMargin = currentBid !== null && maxBid !== null && maxBid > 0 ? maxBid - currentBid : null;
  const auctionAboveMax = currentBid !== null && maxBid !== null && currentBid >= maxBid;

  return (
    <Link
      href={`/imovel/${id}`}
      className="border rounded-2xl overflow-hidden hover:shadow-xl transition group block"
      prefetch={false}
    >
      <div className="aspect-video bg-slate-200 relative overflow-hidden">
        <PropertyImage src={imageUrl} alt={title} fill className="group-hover:scale-105 transition-transform duration-300" />

        {/* Tipo: Leilão ou Preço fixo */}
        {isAuction && auctionDaysLeft !== null && auctionDaysLeft >= 0 ? (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold z-10 flex items-center gap-1.5">
            <Gavel size={12} />
            Leilão • fecha em {auctionDaysLeft} dias
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-slate-800/90 text-white px-2.5 py-1 rounded-lg text-xs font-bold z-10">
            Preço fixo
          </div>
        )}

        {/* Verificado */}
        {isVerified && (
          <div className="absolute bottom-4 right-4 bg-success text-white px-2.5 py-1 rounded-lg text-xs font-bold z-10 flex items-center gap-1.5">
            <CheckCircle size={14} />
            Verificado
          </div>
        )}

        {/* Confiança muito baixa */}
        {valuationConfidence === "very_low" && (
          <div className="absolute bottom-4 left-4 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold z-10 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Confiança baixa
          </div>
        )}

        {/* Score */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-bold z-10 ${getScoreBadgeVariant(score, valuationConfidence)} border`}>
          {score !== null ? score : "--"}<span className="text-[10px] opacity-80 ml-0.5">/100</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-base truncate">{title}</h3>
        </div>
        <div className="flex items-center text-xs text-secondary mb-2.5">
          <MapPin size={14} className="mr-1.5" />
          <span className="truncate">{municipality}, {district}</span>
        </div>

        {/* Preço em destaque */}
        <div className="mb-2.5">
          {isAuction && currentBid !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-primary">{currentBid.toLocaleString("pt-PT")}€</span>
              <span className="text-xs text-secondary ml-1">lance atual</span>
              {maxBid !== null && maxBid > 0 && (
                <span className="text-xs text-success ml-2">Máx. p/ 15% margem: {maxBid.toLocaleString("pt-PT")}€</span>
              )}
            </div>
          ) : (
            <span className="text-2xl font-extrabold text-primary">{formattedPrice}€</span>
          )}
          {discountPct !== null && discountPct > 0 && (
            <span className="text-xs text-success ml-2">
              <TrendingDown size={12} className="mr-1" /> -{discountPct}% mercado
            </span>
          )}
        </div>

        {/* Badges de leilão (margem ou acima do máximo) */}
        {isAuction && auctionAboveMax && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-bold border border-red-100">
            <AlertTriangle size={12} /> Acima do lance máximo
          </div>
        )}
        {isAuction && auctionMargin !== null && auctionMargin > 0 && !auctionAboveMax && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold border border-green-100">
            Margem: {auctionMargin.toLocaleString("pt-PT")}€
          </div>
        )}

        {/* Linha de 3 factos */}
        <div className="flex items-center justify-between text-xs text-secondary mb-3">
          <span className="flex items-center gap-1">
            {sqm ? `${sqm}m²` : "— m²"}
          </span>
          <span className="flex items-center gap-1">
            {type}
          </span>
          <span className="flex items-center gap-1">
            {sourceName}
          </span>
        </div>

        {/* Score único com cor semântica */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-bold ${getScoreColor(score, valuationConfidence)}`}>
            {getScoreLabel(score)}
          </span>
          <span className="text-[10px] text-slate-400">{score !== null ? score + "/100" : "—"}</span>
          {valuationConfidence === "very_low" && (
            <span className="text-[10px] text-red-500 font-medium ml-1">
              Confiança muito baixa
            </span>
          )}
        </div>

        <div className="mt-3">
          <a
            href={`/imovel/${id}`}
            className="w-full py-2.5 border border-primary text-primary text-sm font-medium rounded-lg text-center hover:bg-primary/50 transition flex items-center justify-center gap-1.5"
          >
            Ver detalhes <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </Link>
  );
}
