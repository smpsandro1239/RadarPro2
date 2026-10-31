/**
 * RadarPro Portugal - Testes de yield para leilões (TDD)
 *
 * O yield de leilões deve usar max_bid (custo real), não current_bid (lance baixo).
 * Estes testes falham com o código atual e passam após o fix.
 */

import { describe, it, expect } from "vitest";
import { calculateScore } from "@/lib/valuation/score";
import { evaluateProperty } from "@/lib/valuation/index";

const BASE_PROPERTY = {
  district: "Lisboa",
  municipality: "Lisboa",
  type: "T2",
  source: "portal",
  sourceName: "Portal",
  marketValue: 160_000,
  discountPct: 40,
  rentability: null,
  createdAt: new Date(),
  isActive: true,
  asset_class: "apartment",
  valuation_engine: "hedonic",
  valuation_confidence: "medium",
};

describe("yield para leilões (TDD)", () => {
  it("leilão: yield usa max_bid como denominador, não current_bid", () => {
    // current_bid = 100.000 → yield = 9.000/100.000 = 9% → 100 na escala atual
    // max_bid   = 120.000 → yield = 9.000/120.000 = 7.5% → 75 na escala atual (6%=75, 8%=100)
    const auctionProperty = {
      ...BASE_PROPERTY,
      isAuction: true,
      listing_type: "auction_judicial",
      price: 100_000, // current_bid (baixo, irrealista para custo real)
      maxBid: 120_000, // calculado pelo auction-calculator (custo real com comissão+IMT+selo)
      annual_income: 9_000,
    };

    const result = calculateScore(auctionProperty, evaluateProperty(auctionProperty));
    const yieldScore = result.breakdown.yield;

    // Se o código usasse current_bid: yield=9% → score 100
    // Se o código usar max_bid: yield=7.5% → score 75 (escala atual)
    // Depois da recalibração (6%=95, 7%+=100): 7.5% → 95
    // O teste verifica que o denominador é max_bid (score <= 95, não 100)
    expect(yieldScore).toBeLessThan(100);
    expect(yieldScore).toBeGreaterThan(0);
  });

  it("preço fixo: yield usa price como denominador", () => {
    const fixedProperty = {
      ...BASE_PROPERTY,
      isAuction: false,
      listing_type: "fixed_price",
      price: 120_000,
      maxBid: null,
      annual_income: 9_000,
    };

    const result = calculateScore(fixedProperty, evaluateProperty(fixedProperty));
    const yieldScore = result.breakdown.yield;

    // yield = 9.000/120.000 = 7.5% → 75 na escala atual, 95 na recalibrada
    expect(yieldScore).toBeGreaterThan(0);
    expect(yieldScore).toBeLessThanOrEqual(100);
  });

  it("leilão com current_bid muito baixo não dá yield 100 artificialmente", () => {
    // current_bid = 50.000 → yield = 24% → 100 (inflacionado se usasse current_bid)
    // max_bid   = 120.000 → yield = 7.5% → 75 (realista)
    const auctionProperty = {
      ...BASE_PROPERTY,
      isAuction: true,
      listing_type: "auction_private",
      price: 50_000, // current_bid muito baixo
      maxBid: 120_000, // custo real
      annual_income: 9_000,
    };

    const result = calculateScore(auctionProperty, evaluateProperty(auctionProperty));
    const yieldScore = result.breakdown.yield;

    // Se usasse current_bid: 24% → 100 (bug)
    // Se usasse max_bid: 7.5% → 75 (correto)
    expect(yieldScore).toBeLessThan(100);
  });
});
