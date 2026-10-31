/**
 * RadarPro Portugal - Dispatcher do motor de avaliação
 *
 * Exporta evaluateProperty(property): ValuationResult
 * - Lê asset_class e listing_type (derivado de isAuction/auction_type)
 * - Despacha para o motor correto
 * - Depois aplica calculateScore e devolve { valuation, score, engine, confidence, breakdown }
 */

import { evaluateApartment } from "./apartment";
import { evaluateUrbanLand } from "./land-urban";
import { evaluateRuralLand } from "./land-rural";
import { evaluateCommercial } from "./commercial";
import { calculateMaxBid } from "@/lib/auction-calculator";
import { calculateScore } from "./score";
import type { AssetClass, ListingType, ValuationResult } from "./types";

function deriveListingType(property: any): ListingType | null {
  if (property.isAuction === true) {
    const t = (property.auction_type || "").toLowerCase();
    if (t === "judicial") return "auction_judicial";
    if (t === "fiscal") return "auction_fiscal";
    if (t === "private") return "auction_private";
    return "auction_private"; // default para leilão sem tipo especificado
  }
  return "fixed_price";
}

function deriveAssetClass(property: any): AssetClass {
  const stored = property.asset_class;
  if (stored && stored !== "mixed") return stored as AssetClass;
  return "apartment"; // fallback
}

function runAuctionEngine(property: any): ValuationResult {
  const marketValue = property.marketValue ?? property.price * 1.2;
  const result = calculateMaxBid({
    marketValue: marketValue > 0 ? marketValue : 0,
    currentBid: property.currentBid ?? 0,
    auctionHouse: property.auctionHouse ?? undefined,
    vpt: property.vpt ?? undefined,
    condominiumDebt: property.condominiumDebt ?? 0,
    renovationEstimate: property.renovationEstimate ?? 0,
    targetMargin: 15,
  });

  return {
    valuation: result.maxBid > 0 ? result.maxBid : null,
    score: 0,
    engine: "auction",
    confidence: result.maxBid > 0 ? "medium" : "low",
    breakdown: {
      maxBid: result.maxBid,
      currentBid: result.currentBid,
      headroom: result.headroom,
      currentBidExceedsMax: result.currentBidExceedsMax,
      totalCosts: result.totalCosts,
      commission: result.commission,
      imt: result.imt,
      stampDuty: result.stampDuty,
      auctionHouse: result.auctionHouseConfig.name,
      vpt: result.vpt,
    },
  };
}

export function evaluateProperty(property: any): ValuationResult {
  const assetClass: AssetClass = deriveAssetClass(property);
  const listingType: ListingType | null = deriveListingType(property);
  const isAuction = listingType ? listingType.startsWith("auction_") : property.isAuction === true;

  // Leilão: usa motor de auction (maxBid)
  if (isAuction) {
    const auctionResult = runAuctionEngine(property);
    const scoreResult = calculateScore(
      { ...property, listing_type: listingType },
      auctionResult
    );
    return {
      ...auctionResult,
      score: scoreResult.score,
      breakdown: {
        ...auctionResult.breakdown,
        scoreBreakdown: scoreResult.breakdown,
        scoreBadges: scoreResult.badges,
        scoreCapped: scoreResult.capped,
        scoreMax: scoreResult.maxScore,
      },
    };
  }

  // Não-leilão: despacha por asset_class
  let engineResult: ValuationResult;

  switch (assetClass) {
    case "urban_land":
      engineResult = evaluateUrbanLand(property);
      break;
    case "rural_land":
      engineResult = evaluateRuralLand(property);
      break;
    case "commercial":
      engineResult = evaluateCommercial(property);
      break;
    case "garage":
      engineResult = evaluateApartment({ ...property, type: "Garagem", sqm: property.sqm || 15 });
      break;
    case "mixed":
      engineResult = evaluateApartment({ ...property, type: "T2" });
      engineResult.confidence = "low";
      break;
    case "apartment":
    case "house":
    default:
      engineResult = evaluateApartment(property);
      break;
  }

  const scoreResult = calculateScore(
    { ...property, listing_type: listingType },
    engineResult
  );

  return {
    ...engineResult,
    score: scoreResult.score,
    breakdown: {
      ...engineResult.breakdown,
      scoreBreakdown: scoreResult.breakdown,
      scoreBadges: scoreResult.badges,
      scoreCapped: scoreResult.capped,
      scoreMax: scoreResult.maxScore,
    },
  };
}
