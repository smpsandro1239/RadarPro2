/**
 * RadarPro Portugal - Motor de scoring (v2)
 *
 * Mudanças face à v1:
 * - O desconto é CALCULADO a partir do resultado do motor (preço vs valuation); já não depende
 *   de campos pré-calculados (discountPct, maxBid, marketAvgPerSqm).
 * - Os cortes usam o resultado do motor (confidence, currentBidExceedsMax), não colunas da BD.
 * - Dimensões sem dados são retiradas e os pesos renormalizados (em vez de valerem 0 ou 50);
 *   com cobertura < 70 % o score é limitado a 70.
 * - Descontos >= 50 % ou yields >= 12 % são tratados como anomalias (score <= 50, "a verificar").
 * - Sem avaliação (valuation null) -> score null.
 * - Curvas contínuas (interpolação) em vez de degraus.
 *
 * Pesos (soma 1.00): ver SCORE_WEIGHTS. House/commercial/garage/mixed usam os pesos de apartment.
 */
import type { AssetClass, EngineResult, PropertyInput, ScoreContext, ScoreResult } from "./types";
import { normalizeKey, toNum } from "./utils";

type Key = "discount" | "pricePerSqm" | "yield" | "liquidity" | "confidence";
type WeightSet = Record<Key, number>;

export const SCORE_WEIGHTS: Record<"apartment" | "urban_land" | "rural_land" | "auction", WeightSet> = {
  apartment: { discount: 0.3, pricePerSqm: 0.25, yield: 0.2, liquidity: 0.15, confidence: 0.1 },
  urban_land: { discount: 0.25, pricePerSqm: 0.3, yield: 0.1, liquidity: 0.2, confidence: 0.15 },
  rural_land: { discount: 0.2, pricePerSqm: 0.35, yield: 0.25, liquidity: 0.1, confidence: 0.1 },
  auction: { discount: 0.3, pricePerSqm: 0.2, yield: 0.2, liquidity: 0.15, confidence: 0.15 },
};

export const ANOMALY_DISCOUNT_PCT = 50;
export const ANOMALY_YIELD_PCT = 12;
export const ANOMALY_MAX_SCORE = 50;
export const MIN_COVERAGE = 0.7;
export const INCOMPLETE_MAX_SCORE = 70;

type Curve = ReadonlyArray<readonly [number, number]>;

const DISCOUNT_CURVE: Curve = [[0, 0], [10, 40], [20, 60], [30, 80], [40, 100]];
/** x = (preço/m²) ÷ mediana da zona; mais baixo = melhor. */
const PRICE_RATIO_CURVE: Curve = [[0.6, 100], [0.75, 80], [0.85, 60], [0.95, 40], [1.05, 20], [1.2, 0]];
const YIELD_CURVE: Curve = [[1, 0], [2, 20], [3, 40], [4, 60], [5, 80], [6, 95], [8, 100]];

export function interpolate(x: number, curve: Curve): number {
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i];
    if (x <= x1) {
      const [x0, y0] = curve[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return last[1];
}

const LIQUIDITY: Record<string, number> = {
  LISBOA: 100, PORTO: 80, BRAGA: 55, FARO: 70, SETUBAL: 65, AVEIRO: 60, COIMBRA: 55,
  LEIRIA: 55, SANTAREM: 50, VISEU: 50, VIANA_DO_CASTELO: 55, BRAGANCA: 40, GUARDA: 40,
  CASTELO_BRANCO: 40, PORTALEGRE: 40, EVORA: 50, BEJA: 40, VILA_REAL: 50, ACORES: 35, MADEIRA: 50,
};
const DEFAULT_LIQUIDITY = 55;

const CONFIDENCE_SCORE = { high: 100, medium: 70, low: 40, very_low: 10 } as const;

function weightsFor(assetClass: AssetClass, isAuction: boolean): WeightSet {
  if (isAuction) return SCORE_WEIGHTS.auction;
  if (assetClass === "urban_land") return SCORE_WEIGHTS.urban_land;
  if (assetClass === "rural_land") return SCORE_WEIGHTS.rural_land;
  return SCORE_WEIGHTS.apartment;
}

const clamp100 = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

export function calculateScore(p: PropertyInput, result: EngineResult, ctx: ScoreContext): ScoreResult {
  const { assetClass, listingType } = ctx;
  const isAuction = listingType !== "fixed_price";

  if (result.valuation === null) {
    return {
      score: null,
      breakdown: { discount: null, pricePerSqm: null, yield: null, liquidity: null, confidence: null },
      maxScore: 100,
      badges: ["Sem avaliação"],
      capped: false,
      coverage: 0,
    };
  }

  const bd = result.breakdown;
  const num = (k: string): number | null => toNum(bd[k]);

  // --- bases de cálculo ---------------------------------------------------
  let discountBasisPct: number | null = null; // alimenta a dimensão "desconto"
  let referenceDiscountPct: number | null = null; // usado só para detetar anomalias
  let priceForSqm: number | null = null;
  let yieldDenominator: number | null = null;

  if (isAuction) {
    const maxBid = num("maxBid");
    const bid = num("currentBid");
    const marketValue = num("marketValue");
    if (maxBid !== null && bid !== null) discountBasisPct = maxBid > 0 ? ((maxBid - bid) / maxBid) * 100 : 0;
    if (marketValue !== null && marketValue > 0 && bid !== null) referenceDiscountPct = (1 - bid / marketValue) * 100;
    priceForSqm = bid;
    yieldDenominator = maxBid !== null && maxBid > 0 ? maxBid : null;
  } else {
    if (p.price !== null && p.price > 0 && result.valuation > 0) {
      discountBasisPct = referenceDiscountPct = (1 - p.price / result.valuation) * 100;
    }
    priceForSqm = p.price;
    yieldDenominator = p.price !== null && p.price > 0 ? p.price : null;
  }

  const sDiscount = discountBasisPct === null ? null : interpolate(discountBasisPct, DISCOUNT_CURVE);

  const basePerSqm = num("basePerSqm");
  const sPriceM2 =
    priceForSqm !== null && priceForSqm > 0 && p.sqm !== null && p.sqm > 0 && basePerSqm !== null && basePerSqm > 0
      ? interpolate(priceForSqm / p.sqm / basePerSqm, PRICE_RATIO_CURVE)
      : null;

  let yieldPct = p.yieldPct;
  if (yieldPct === null) {
    const income = p.annualIncome ?? p.annualRent;
    if (income !== null && income > 0 && yieldDenominator !== null) yieldPct = (income / yieldDenominator) * 100;
  }
  const sYield = yieldPct !== null && yieldPct > 0 ? interpolate(yieldPct, YIELD_CURVE) : null;

  const sLiquidity = LIQUIDITY[normalizeKey(p.district)] ?? DEFAULT_LIQUIDITY;
  const sConfidence = CONFIDENCE_SCORE[result.confidence];

  const components: Record<Key, number | null> = {
    discount: sDiscount,
    pricePerSqm: sPriceM2,
    yield: sYield,
    liquidity: sLiquidity,
    confidence: sConfidence,
  };

  // --- soma ponderada com renormalização ---------------------------------
  const weights = weightsFor(assetClass, isAuction);
  let used = 0;
  let acc = 0;
  const missing: string[] = [];
  (Object.keys(weights) as Key[]).forEach((k) => {
    const v = components[k];
    if (v === null) {
      missing.push(k);
      return;
    }
    used += weights[k];
    acc += v * weights[k];
  });
  const coverage = Math.round(used * 100) / 100;
  let score = used > 0 ? acc / used : 0;

  // --- cortes -------------------------------------------------------------
  const caps: { max: number; badge: string }[] = [];
  if (result.confidence === "very_low") caps.push({ max: 40, badge: "Confiança muito baixa" });
  if (assetClass === "urban_land") {
    const pdm = (p.pdmStatus ?? "").toLowerCase();
    if (pdm !== "buildable" && pdm !== "restricted") caps.push({ max: 40, badge: "PDM não edificável ou desconhecido" });
  }
  if (assetClass === "rural_land" && !(p.annualIncome !== null && p.annualIncome > 0)) {
    caps.push({ max: 30, badge: "Sem rendimento demonstrável" });
  }
  if (isAuction && bd["currentBidExceedsMax"] === true) {
    caps.push({ max: 30, badge: "Lance atual >= lance máximo" });
  }
  if (referenceDiscountPct !== null && referenceDiscountPct >= ANOMALY_DISCOUNT_PCT) {
    caps.push({ max: ANOMALY_MAX_SCORE, badge: `Desconto anómalo (${Math.round(referenceDiscountPct)}%) - verificar dados` });
  }
  if (yieldPct !== null && yieldPct >= ANOMALY_YIELD_PCT) {
    caps.push({ max: ANOMALY_MAX_SCORE, badge: `Rentabilidade anómala (${Math.round(yieldPct)}%) - verificar dados` });
  }
  if (coverage < MIN_COVERAGE) {
    caps.push({ max: INCOMPLETE_MAX_SCORE, badge: "Dados insuficientes para um score completo" });
  }

  const maxScore = caps.reduce((m, c) => Math.min(m, c.max), 100);
  score = Math.min(score, maxScore);

  const badges = caps.map((c) => c.badge);
  if (missing.length > 0) badges.push(`Dados em falta: ${missing.join(", ")}`);

  return {
    score: clamp100(score),
    breakdown: {
      discount: sDiscount === null ? null : Math.round(sDiscount),
      pricePerSqm: sPriceM2 === null ? null : Math.round(sPriceM2),
      yield: sYield === null ? null : Math.round(sYield),
      liquidity: sLiquidity,
      confidence: sConfidence,
    },
    maxScore,
    badges,
    capped: maxScore < 100,
    coverage,
  };
}
