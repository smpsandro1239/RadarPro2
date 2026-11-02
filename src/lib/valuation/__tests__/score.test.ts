import { describe, expect, it } from "vitest";
import { normalizeProperty } from "../normalize";
import { ANOMALY_MAX_SCORE, calculateScore, INCOMPLETE_MAX_SCORE, SCORE_WEIGHTS } from "../score";
import type { AssetClass, EngineResult, ListingType } from "../types";

const prop = (o: Record<string, unknown>) => normalizeProperty({ district: "Lisboa", ...o });
const res = (o: Partial<EngineResult> = {}): EngineResult => ({
  valuation: 100000, engine: "hedonic", confidence: "medium", breakdown: {}, warnings: [], assumptions: [], ...o,
});
const ctx = (assetClass: AssetClass = "apartment", listingType: ListingType = "fixed_price") => ({ assetClass, listingType });

describe("pesos", () => {
  it("somam 1.00 em cada classe", () => {
    for (const w of Object.values(SCORE_WEIGHTS)) {
      expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    }
  });
});

describe("desconto calculado a partir da avaliação", () => {
  it("30% abaixo da avaliação -> componente 80", () => {
    const s = calculateScore(prop({ price: 70000 }), res(), ctx());
    expect(s.breakdown.discount).toBe(80);
  });
  it("preço acima da avaliação -> componente 0", () => {
    expect(calculateScore(prop({ price: 120000 }), res(), ctx()).breakdown.discount).toBe(0);
  });
  it("é contínuo e monótono: preço mais baixo nunca baixa o score (até 45% de desconto)", () => {
    const r = res({ breakdown: { basePerSqm: 2000 } });
    let prev = -1;
    for (let price = 100000; price >= 55000; price -= 1000) {
      const s = calculateScore(prop({ price, sqm: 50 }), r, ctx()).score as number;
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
    }
  });
});

describe("anomalias e cortes", () => {
  it("REGRESSÃO (caso do site): -98% é anomalia, score <= 50 e badge", () => {
    const s = calculateScore(prop({ price: 2901, sqm: 75, district: "Porto" }), res({ valuation: 263340, breakdown: { basePerSqm: 3800 } }), ctx());
    expect(s.score as number).toBeLessThanOrEqual(ANOMALY_MAX_SCORE);
    expect(s.badges.join()).toMatch(/Desconto anómalo/);
    expect(s.capped).toBe(true);
  });
  it("REGRESSÃO: confiança very_low vem do resultado do motor e corta a 40", () => {
    const s = calculateScore(prop({ price: 60000 }), res({ confidence: "very_low" }), ctx());
    expect(s.score as number).toBeLessThanOrEqual(40);
    expect(s.badges).toContain("Confiança muito baixa");
  });
  it("REGRESSÃO: leilão com lance >= máximo corta a 30 (via resultado do motor)", () => {
    const r = res({ engine: "auction", valuation: 100000, breakdown: { maxBid: 100000, currentBid: 120000, marketValue: 200000, currentBidExceedsMax: true } });
    const s = calculateScore(prop({ price: 120000 }), r, ctx("apartment", "auction_fiscal"));
    expect(s.score as number).toBeLessThanOrEqual(30);
    expect(s.badges.join()).toMatch(/Lance atual/);
  });
  it("rústico sem rendimento informado corta a 30", () => {
    const s = calculateScore(prop({ price: 10000, sqm: 20000 }), res({ valuation: 22500, engine: "land_rural", confidence: "low" }), ctx("rural_land"));
    expect(s.score as number).toBeLessThanOrEqual(30);
  });
  it("yield anómalo (>=12%) é sinalizado", () => {
    const s = calculateScore(prop({ price: 50000, annual_income: 8000 }), res(), ctx());
    expect(s.badges.join()).toMatch(/Rentabilidade anómala/);
    expect(s.score as number).toBeLessThanOrEqual(ANOMALY_MAX_SCORE);
  });
});

describe("sem avaliação / dados em falta", () => {
  it("valuation null -> score null (não 0, não neutro)", () => {
    const s = calculateScore(prop({ price: 50000 }), res({ valuation: null }), ctx());
    expect(s.score).toBeNull();
    expect(s.badges).toContain("Sem avaliação");
  });
  it("dimensões em falta saem do cálculo; cobertura < 70% limita a 70", () => {
    const s = calculateScore(prop({ price: 50000 }), res({ confidence: "high" }), ctx());
    expect(s.coverage).toBeCloseTo(0.55, 5); // desconto + liquidez + confiança
    expect(s.score as number).toBeLessThanOrEqual(INCOMPLETE_MAX_SCORE);
    expect(s.badges.join()).toMatch(/Dados em falta/);
  });
});

describe("liquidez", () => {
  it("REGRESSÃO: distritos com acento batem na tabela", () => {
    expect(calculateScore(prop({ price: 70000, district: "Évora" }), res(), ctx()).breakdown.liquidity).toBe(50);
    expect(calculateScore(prop({ price: 70000, district: "Açores" }), res(), ctx()).breakdown.liquidity).toBe(35);
    expect(calculateScore(prop({ price: 70000, district: "Viana do Castelo" }), res(), ctx()).breakdown.liquidity).toBe(55);
  });
});
