import { db } from "@/db";
import { properties, priceHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, TrendingDown, ExternalLink, Heart, ChevronDown, Info, AlertTriangle, Gavel } from "lucide-react";
import Image from "next/image";
import ValuationCard from "@/components/ValuationCard";
import { calculateMaxBid, getCostBreakdownText } from "@/lib/auction-calculator";
import { calculateCargasFromProperty } from "@/lib/valuation/cargas";
import { formatEuros, formatOptional, formatScore, formatScoreOutOf100 } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";
import PropertyImage from "@/components/PropertyImage";
import AuctionCountdown from "@/components/AuctionCountdown";
import SimilarProperties from "@/components/SimilarProperties";
import CommuteEstimator from "@/components/CommuteEstimator";
import VerifiedBadge from "@/components/VerifiedBadge";

import SourceContact from "@/components/SourceContact";
import NeighborhoodRadar from "@/components/NeighborhoodRadar";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  const prop = result[0];
  if (!prop) return { title: "Im\u00f3vel \u2014 RadarPro" };
  const title = `${prop.type ?? "Im\u00f3vel"} em ${prop.municipality} \u2014 ${prop.price.toLocaleString("pt-PT")}\u20ac | RadarPro`;
  const description = `Im\u00f3vel real em ${prop.municipality}, distrito ${prop.district}. Pre\u00e7o ${prop.price.toLocaleString("pt-PT")}\u20ac. Score ${prop.score ?? "\u2014"}/100. Avalia\u00e7\u00e3o com motor de valoriza\u00e7\u00e3o.`;
  return { title, description };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
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
  let auctionCalculation: any = null;
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

  const cargas = calculateCargasFromProperty({
    cargasTotal: prop.cargasTotal,
    condominiumDebt: prop.condominiumDebt,
    renovationEstimate: prop.renovationEstimate,
    embargos: prop.embargos,
    hipotecas: prop.hipotecas,
    marketValue: prop.marketValue,
  });

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

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden relative">
          <PropertyImage src={imageUrl} alt={prop.title} fill assetClass={prop.assetClass} />
          <VerifiedBadge
            isVerified={isVerified}
            hasImage={hasImage}
          />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
              prop.valuationConfidence === "very_low"
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-primary text-white"
            }`}>
              {formatScoreOutOf100(prop.score)}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-medium">
              {prop.type}
            </span>
            </div>

          {prop.valuationConfidence === "very_low" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                Confiança muito baixa na avaliação — score limitado a 40
              </span>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2">{prop.title}</h1>
          <div className="flex items-center text-secondary mb-6">
            <MapPin size={16} className="mr-1" />
            {prop.municipality}, {prop.district}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-xs text-secondary uppercase font-semibold mb-1">
                Preço de venda
              </div>
              <div className="text-2xl font-bold">{prop.price.toLocaleString()}€</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-xs text-secondary uppercase font-semibold mb-1">
                Valor de mercado
              </div>
              <div className="text-2xl font-bold text-success">
                {formatEuros(prop.marketValue)}
              </div>
            </div>
          </div>

          {prop.isAuction && prop.auctionEndDate && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <AuctionCountdown endDate={typeof prop.auctionEndDate === "number" ? prop.auctionEndDate : new Date(prop.auctionEndDate).getTime()} />
            </div>
          )}

          <div className="flex items-center gap-6 mb-6 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <TrendingDown size={18} className="text-primary" />
              <span className="font-bold text-primary">{formatOptional(prop.discountPct === null ? null : -prop.discountPct, "%")}</span>
              <span className="text-secondary">abaixo do mercado</span>
            </div>
            <div className="text-secondary">
              Rentabilidade: <span className="font-bold">{formatOptional(prop.rentability, "%")}</span>
            </div>
            {priceChange !== 0 && (
              <div className={`font-bold ${priceChange < 0 ? "text-success" : "text-red-500"}`}>
                {priceChange < 0 ? "↓" : "↑"} {Math.abs(priceChange).toFixed(1)}% desde o primeiro registo
              </div>
            )}
          </div>

          {prop.isAuction && auctionCalculation && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-orange-600" />
                <h3 className="font-bold text-orange-800 text-sm">
                  Lance máximo recomendado
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-secondary uppercase font-semibold">
                    Lance atual
                  </div>
                  <div className="text-xl font-bold">
                    {auctionCalculation.currentBid.toLocaleString("pt-PT")}€
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary uppercase font-semibold">
                    Máx. lance
                  </div>
                  <div className={`text-xl font-bold ${auctionCalculation.currentBidExceedsMax ? "text-red-600" : "text-success"}`}>
                    {auctionCalculation.maxBid.toLocaleString("pt-PT")}€
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium mb-3 ${auctionCalculation.currentBidExceedsMax ? "text-red-600" : "text-success"}`}>
                {auctionCalculation.currentBidExceedsMax ? "⚠️ Acima do lance máximo — não recomendado" : "✓ Margem de " + auctionCalculation.headroom.toLocaleString("pt-PT") + "€"}
              </div>
              <details className="text-xs text-secondary">
                <summary className="cursor-pointer hover:text-primary flex items-center gap-1 mb-2">
                  <ChevronDown size={14} className="transition-transform" />
                  Como calculámos?
                </summary>
                <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
                  {getCostBreakdownText(auctionCalculation).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {/* Análise de leilão — breakdown de custos e regra do VPT */}
          {prop.isAuction && auctionCalculation && (
            <div className="mb-6 border border-slate-200 rounded-xl p-6 bg-white">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Gavel size={20} className="text-orange-600" />
                Análise de leilão
              </h2>

              {/* Regra do VPT */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Info size={14} className="text-amber-600 mt-0.5" />
                  <span className="text-sm text-amber-800 font-medium">
                    Regra do VPT:
                  </span>
                </div>
                <p className="text-sm text-amber-700">
                  Os impostos (IMT e Imposto do Selo) incidem sobre o maior entre o valor de
                  mercado e o VPT: <strong>max(lance, VPT)</strong>.
                  {" "}
                  {prop.vpt && (
                    <>
                      VPT deste imóvel:{" "}
                      <span className="font-bold">{prop.vpt.toLocaleString("pt-PT")}€</span>.
                    </>
                  )}
                </p>
              </div>

              {/* Breakdown de custos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Custos de aquisição</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-secondary">
                      <span>Comissão da leiloeira</span>
                      <span className="font-medium">{auctionCalculation.auctionHouseConfig.commissionPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valor</span>
                      <span className="font-bold text-red-600">-{auctionCalculation.commission.toLocaleString("pt-PT")}€</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>IMT estimado</span>
                      <span className="font-medium">{auctionCalculation.auctionHouseConfig.imtPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valor</span>
                      <span className="font-bold text-red-600">-{auctionCalculation.imt.toLocaleString("pt-PT")}€</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>Imposto do Selo</span>
                      <span className="font-medium">{auctionCalculation.auctionHouseConfig.stampDutyPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valor</span>
                      <span className="font-bold text-red-600">-{auctionCalculation.stampDuty.toLocaleString("pt-PT")}€</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Custos adicionais</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dívida de condomínio</span>
                      <span className="font-bold text-red-600">-{auctionCalculation.condominiumDebt.toLocaleString("pt-PT")}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Renovação estimada</span>
                      <span className="font-bold text-red-600">-{auctionCalculation.renovationEstimate.toLocaleString("pt-PT")}€</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>Registo e custas</span>
                      <span className="font-medium">incluído nos custos</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold mt-2">
                      <span>Custos totais</span>
                      <span className="text-red-600">-{auctionCalculation.totalCosts.toLocaleString("pt-PT")}€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Base de tributação */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Base de tributação (VPT)</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-secondary">Valor de mercado</span>
                    <span className="font-mono">{formatEuros(prop.marketValue)}</span>
                  </div>
                  {prop.vpt && (
                    <div className="flex justify-between">
                      <span className="text-secondary">VPT</span>
                      <span className="font-mono">{prop.vpt.toLocaleString("pt-PT")}€</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                    <span>Base de imposto (max)</span>
                    <span className="font-mono text-orange-600">
                      {Math.max(prop.marketValue ?? 0, prop.vpt ?? 0).toLocaleString("pt-PT")}€
                    </span>
                  </div>
                </div>
              </div>

              {/* Cargas */}
              {cargas.total !== null && cargas.loadPct !== null && (
                <div className={`mb-4 p-3 rounded-lg border ${cargas.exceedsAlertThreshold ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Cargas estimadas</span>
                    <span className={`font-bold ${cargas.exceedsAlertThreshold ? "text-red-600" : "text-slate-900"}`}>
                      {cargas.total.toLocaleString("pt-PT")}€ ({cargas.loadPct.toFixed(1)}% do valor)
                    </span>
                  </div>
                  {cargas.exceedsAlertThreshold && (
                    <div className="mt-1 text-xs text-red-700 font-medium">
                      Cargas superam 20% do valor — lance máximo recomendado já considera estes custos.
                    </div>
                  )}
                </div>
              )}

              {/* Resumo */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="text-xs font-bold text-orange-800 uppercase mb-3">Resumo do lance máximo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Valor de mercado</span>
                    <span className="font-mono">{auctionCalculation.marketValue.toLocaleString("pt-PT")}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Margem de segurança (15%)</span>
                    <span className="font-mono text-red-600">-{Math.round(auctionCalculation.marketValue * 0.15).toLocaleString("pt-PT")}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Custos totais</span>
                    <span className="font-mono text-red-600">-{auctionCalculation.totalCosts.toLocaleString("pt-PT")}€</span>
                  </div>
                  <div className="pt-2 border-t border-orange-200 flex justify-between font-bold text-lg">
                    <span>Lance máximo recomendado</span>
                    <span className={`text-orange-700 ${auctionCalculation.currentBidExceedsMax ? "text-red-600" : ""}`}>
                      {auctionCalculation.maxBid.toLocaleString("pt-PT")}€
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${auctionCalculation.currentBidExceedsMax ? "text-red-600" : "text-green-600"}`}>
                    {auctionCalculation.currentBidExceedsMax
                      ? `⚠️ Lance atual (${auctionCalculation.currentBid.toLocaleString("pt-PT")}€) excede o máximo recomendado`
                      : `✓ Margem disponível: ${auctionCalculation.headroom.toLocaleString("pt-PT")}€`}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <a
              href={prop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary text-white py-3 rounded-lg font-bold text-center hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Ver anúncio original <ExternalLink size={16} />
            </a>
            <FavoriteButton propertyId={prop.id} />
          </div>

          {/* Valuation */}
          <div className="mb-6">
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
          </div>

          {/* AVM transparency */}
          <div className="mb-6 border border-slate-200 rounded-xl p-4">
            <details className="group">
              <summary className="cursor-pointer hover:text-primary flex items-center gap-2 font-bold text-sm">
                <Info size={16} />
                Como calculámos este valor?
              </summary>
              <div className="mt-4 space-y-3 text-xs text-secondary">
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Valor de mercado (AVM)
                    </div>
                    <div className="font-bold">{formatEuros(prop.marketValue)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Confiança
                    </div>
                    <div className="font-bold">{prop.marketValue ? "Alta (valor do anúncio)" : "Média (modelo estatístico)"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Preço/m²
                    </div>
                    <div className="font-bold">
                      {prop.marketValue ? Math.round(prop.price / 70) : "—"}€/m²
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Faixa de confiança
                    </div>
                    <div className="font-bold">
                      {prop.marketValue ? Math.round(prop.marketValue * 0.9).toLocaleString("pt-PT") + "€ – " + Math.round(prop.marketValue * 1.1).toLocaleString("pt-PT") + "€" : "—"}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] italic">
                  Esta é uma estimativa automática baseada em dados de mercado públicos e não uma avaliação oficial.
                  Para uma decisão de compra, consulte um profissional certificado.
                </p>
              </div>
            </details>
          </div>

          {/* Commute estimator */}
          {prop.lat && prop.lng && (
            <div className="mb-6">
              <CommuteEstimator propertyLat={prop.lat} propertyLng={prop.lng} />
            </div>
          )}

          {/* Neighborhood Radar */}
          {prop.lat && prop.lng && (
            <div className="mb-6">
              <NeighborhoodRadar district={prop.district} municipality={prop.municipality} />
            </div>
          )}

          {/* Similar properties */}
          <SimilarProperties
            currentPropertyId={prop.id}
            district={prop.district}
            municipality={prop.municipality}
            type={prop.type}
            price={prop.price}
            sqm={prop.areaSqm ?? null}
          />

          {/* Price history */}
          {history.length > 1 && (
            <div className="border-t pt-6 mb-6">
              <h2 className="font-bold mb-3">Histórico de preço</h2>
              <div className="relative h-48 w-full mt-4">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <line
                      key={pct}
                      x1="0"
                      y1={`${pct}%`}
                      x2="100%"
                      y2={`${pct}%`}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                  ))}
                  {/* Area */}
                  <polygon
                    points={history
                      .reverse()
                      .map((h, i) => {
                        const x = (i / (history.length - 1)) * 100;
                        const y = 100;
                        return `${x},${y}`;
                      })
                      .concat([`${100},100`, `0,100`])
                      .join(" ")}
                    fill="url(#priceGradient)"
                  />
                  {/* Line */}
                  <polyline
                    points={history
                      .reverse()
                      .map((h, i) => {
                        const x = (i / (history.length - 1)) * 100;
                        return `${x},${100}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  {/* Points */}
                  {history.reverse().map((h, i) => (
                    <circle
                      key={h.id}
                      cx={(i / (history.length - 1)) * 100}
                      cy={100}
                      r={3}
                      fill="#3b82f6"
                    />
                  ))}
                </svg>
                <div className="flex justify-between text-xs text-secondary mt-2">
                  {history.map((h, i) => (
                    <span key={h.id} className={`w-full text-center ${i === 0 || i === history.length - 1 ? "font-medium text-slate-900" : ""}`}>
                      {h.recordedAt ? new Date(h.recordedAt).toLocaleDateString("pt-PT", { day: "numeric", month: "short" }) : "—"}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-secondary mt-1">
                  {history.map((h) => (
                    <span key={h.id} className="w-full text-right">
                      {h.price.toLocaleString()}€
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs text-secondary mt-2">
                <span>
                  Primeira: {history[history.length - 1].price.toLocaleString()}€
                </span>
                <span>
                  Atual: {history[0].price.toLocaleString()}€
                </span>
                {history.length >= 2 && (
                  <span className={`font-medium ${history[0].price < history[history.length - 1].price ? "text-success" : "text-red-500"}`}>
                    {((history[0].price - history[history.length - 1].price) / history[history.length - 1].price * 100).toFixed(0)}% vs inicial
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="font-bold mb-3">Detalhes</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Tipo</span>
                <span className="font-medium">{prop.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Fonte</span>
                <span className="font-medium">{prop.sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Distrito</span>
                <span className="font-medium">{prop.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Concelho</span>
                <span className="font-medium">{prop.municipality}</span>
              </div>
              {prop.createdAt && (
                <div className="flex justify-between">
                  <span className="text-secondary">Atualizado</span>
                  <span className="font-medium">
                    {new Date(prop.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              )}
              {prop.lastChecked && (
                <div className="flex justify-between">
                  <span className="text-secondary">Última verificação</span>
                  <span className="font-medium flex items-center gap-1">
                    {prop.checkStatus === "ok" && <span className="text-success">✓</span>}
                    {prop.checkStatus === "not_found" && <span className="text-red-500">✗</span>}
                    {new Date(prop.lastChecked).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact source */}
          <div className="border-t pt-6">
            <h2 className="font-bold mb-4">Contactar Anúncio</h2>
            <SourceContact propertyTitle={prop.title} sourceName={prop.sourceName} isAuction={prop.isAuction} url={prop.url} />
          </div>
        </div>
      </div>
    </main>
  );
}
