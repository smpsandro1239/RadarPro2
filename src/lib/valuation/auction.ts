/**
 * RadarPro Portugal - Leilões (v2)
 *
 * valuation = lance máximo sustentável (maxBid), nunca o preço de mercado.
 * O valor de mercado vem do motor da classe de ativo (ou do anúncio) - NUNCA de price*1.2.
 * `price` num leilão é o lance atual (convenção do schema); currentBid tem prioridade.
 */
import { calculateMaxBid } from "@/lib/auction-calculator";
import type { EngineResult, PropertyInput } from "./types";
import { calculateCargas, calculateCargasFromProperty } from "./cargas";
import { downgrade, minConfidence, noValuation } from "./utils";

export function evaluateAuction(p: PropertyInput, base: EngineResult): EngineResult {
  const marketValue = p.marketValue ?? base.valuation;
  if (marketValue === null || marketValue <= 0) {
    return noValuation(
      "auction",
      "Sem valor de mercado de referência para calcular o lance máximo",
      "very_low",
      {},
      base.warnings,
    );
  }

  const currentBid = p.currentBid ?? p.price;
  if (currentBid === null || currentBid < 0) {
    return noValuation("auction", "Lance atual em falta", "very_low");
  }

  const unknown: string[] = [];
  if (p.condominiumDebt === null) unknown.push("dívida de condomínio");
  if (p.renovationEstimate === null) unknown.push("custo de obras");
  if (p.vpt === null) unknown.push("VPT");

  const cargas = calculateCargasFromProperty(p);

  const r = calculateMaxBid({
    marketValue,
    currentBid,
    auctionHouse: p.auctionHouse ?? undefined,
    vpt: p.vpt ?? undefined,
    condominiumDebt: p.condominiumDebt ?? 0,
    renovationEstimate: p.renovationEstimate ?? 0,
    targetMargin: 15,
  });

  // Valor de mercado vindo do anúncio não está verificado.
  let confidence = minConfidence(p.marketValue !== null ? "low" : base.confidence, "medium");
  if (unknown.length > 0) confidence = downgrade(confidence);

  const warnings = [...base.warnings];
  if (unknown.length > 0) warnings.push(`Custos desconhecidos (assumidos 0): ${unknown.join(", ")}`);
  if (r.currentBidExceedsMax) warnings.push("Lance atual igual ou acima do lance máximo");
  if (cargas.total !== null && cargas.loadPct !== null && cargas.exceedsAlertThreshold) {
    warnings.push(`Cargas elevadas: ${cargas.total.toLocaleString("pt-PT")}€ (${cargas.loadPct.toFixed(1)}% do valor)`);
  }

  return {
    valuation: Math.max(0, r.maxBid),
    engine: "auction",
    confidence,
    breakdown: {
      maxBid: r.maxBid,
      currentBid: r.currentBid,
      headroom: r.headroom,
      currentBidExceedsMax: r.currentBidExceedsMax,
      totalCosts: r.totalCosts,
      commission: r.commission,
      imt: r.imt,
      stampDuty: r.stampDuty,
      auctionHouse: r.auctionHouseConfig.name,
      vpt: r.vpt,
      marketValue,
      marketValueSource: p.marketValue !== null ? "listing" : `engine:${base.engine}`,
      basePerSqm: base.breakdown["basePerSqm"] ?? null,
      cargasTotal: cargas.total,
      cargasLoadPct: cargas.loadPct,
      cargasExceedsAlert: cargas.exceedsAlertThreshold,
    },
    warnings,
    assumptions: [...base.assumptions],
  };
}
