/**
 * RadarPro Portugal - Tipos do motor de avaliação
 * Tipos compartilhados entre dispatcher, motores e score.
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

export interface ValuationResult {
  valuation: number | null; // valor estimado em €, null se não aplicável
  score: number; // 0-100 (já com cortes aplicados pelo score.ts)
  engine: string; // "hedonic" | "land_urban" | "land_rural" | "income" | "auction"
  confidence: ConfidenceLevel;
  breakdown: Record<string, any>;
}

export interface ScoreResult {
  score: number;
  breakdown: Record<string, number>;
  maxScore: number;
  badges: string[];
  capped: boolean;
}
