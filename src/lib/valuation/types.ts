/**
 * RadarPro Portugal - Tipos do motor de avaliação (v2)
 *
 * Princípio: os motores recebem SEMPRE um PropertyInput normalizado
 * (camelCase, null em vez de undefined/""/NaN) e nunca inventam dados em falta.
 */

export type AssetClass =
  | "apartment"
  | "house"
  | "urban_land"
  | "rural_land"
  | "commercial"
  | "garage"
  | "mixed";

export type ListingType =
  | "fixed_price"
  | "auction_judicial"
  | "auction_fiscal"
  | "auction_private";

export type ConfidenceLevel = "high" | "medium" | "low" | "very_low";

export type EngineName =
  | "hedonic"
  | "land_urban"
  | "land_rural"
  | "income"
  | "auction"
  | "none";

/** Imóvel normalizado: é o único formato aceite pelos motores e pelo score. */
export interface PropertyInput {
  id: string | null;
  title: string | null;
  type: string | null;
  assetClass: AssetClass | null;

  district: string | null;
  municipality: string | null;
  parish: string | null;

  /** Preço pedido (preço fixo) ou lance atual (leilão). */
  price: number | null;
  sqm: number | null;

  floor: number | null;
  totalFloors: number | null;
  orientation: string | null;
  condition: string | null;
  energyCert: string | null;
  hasGarage: boolean;
  hasElevator: boolean;
  hasView: boolean;

  isAuction: boolean;
  auctionType: string | null;
  currentBid: number | null;
  marketValue: number | null;
  auctionHouse: string | null;
  vpt: number | null;
  condominiumDebt: number | null;
  renovationEstimate: number | null;
  embargos: number | null;
  hipotecas: number | null;
  cargasTotal: number | null;

  pdmStatus: string | null;
  infrastructure: string | null;
  topography: string | null;
  roadFrontageMeters: number | null;

  landUse: string | null;
  annualIncome: number | null;
  capRate: number | null;
  annualRent: number | null;
  yieldPct: number | null;
  marketCapRate: number | null;
}

/** Resultado de um motor (sem score). */
export interface EngineResult {
  /** Valor estimado em €, null se não for possível avaliar. */
  valuation: number | null;
  engine: EngineName;
  confidence: ConfidenceLevel;
  breakdown: Record<string, unknown>;
  /** Problemas que o utilizador/UI devem ver. */
  warnings: string[];
  /** Pressupostos assumidos por falta de dados. */
  assumptions: string[];
}

/** Resultado final de evaluateProperty. */
export interface ValuationResult extends EngineResult {
  /** 0-100, ou null quando não há avaliação (a UI mostra "Sem avaliação"). */
  score: number | null;
  assetClass: AssetClass;
  listingType: ListingType;
}

export interface ScoreContext {
  assetClass: AssetClass;
  listingType: ListingType;
}

export interface ScoreResult {
  score: number | null;
  breakdown: Record<string, number | null>;
  maxScore: number;
  badges: string[];
  capped: boolean;
  /** Soma dos pesos das dimensões que tinham dados (0-1). */
  coverage: number;
}
