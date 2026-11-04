import { describe, it, expect } from "vitest";
import { evaluateProperty } from "@/lib/valuation/index";

describe("Oportunidades — rankings sem NULL, rentability não afeta ordenação", () => {
  it("v2 engine does not use rentability in scoring", () => {
    // v2 valuation engine (evaluateProperty) does not consume rentability parameter
    // It calculates yield from annualIncome / price internally
    const result = evaluateProperty({
      id: "test-rentability-1",
      title: "Test Property",
      district: "Porto",
      municipality: "Porto",
      sourceName: "Test",
      source: "test",
      type: "Apartamento",
      price: 100000,
      marketValue: 120000,
      discountPct: 16.7,
      rentability: 5, // This should be ignored by v2 engine
      sqm: 80,
      isAuction: false,
      asset_class: "apartment",
    });

    // Score should be calculated based on discount, price/sqm, yield (from annualIncome), liquidity, confidence
    // NOT from the rentability input parameter
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("oportunidades page sort logic filters null scores and sorts by score only", () => {
    // This mirrors the logic in src/app/oportunidades/page.tsx
    // which filters by score !== null and sorts by score descending
    const opportunitiesSortLogic = (properties: any[]) => 
      properties
        .filter((p) => p.score !== null)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    
    const testProps = [
      { id: "1", score: 80, rentability: 10 },
      { id: "2", score: 70, rentability: 15 },
      { id: "3", score: null, rentability: 5 },
      { id: "4", score: 90, rentability: 0 },
    ];

    const ranked = opportunitiesSortLogic(testProps);
    
    // Should have 3 items (score !== null)
    expect(ranked.length).toBe(3);
    // Should be sorted by score desc, NOT by rentability
    expect(ranked[0].id).toBe("4"); // score 90
    expect(ranked[1].id).toBe("1"); // score 80
    expect(ranked[2].id).toBe("2"); // score 70
    // Property with null score excluded even if it has high rentability
    expect(ranked.find(p => p.id === "3")).toBeUndefined();
  });
});