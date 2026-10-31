/**
 * RadarPro Portugal - Testes unitários: terreno rural (land-rural)
 * Executa com: npx vitest run src/lib/__tests__/valuation/land-rural.test.ts
 */
import { describe, it, expect } from "vitest";
import { evaluateProperty } from "../../valuation/index";

describe("terreno rural", () => {
  const base = {
    asset_class: "rural_land",
    district: "Bragança",
    municipality: "Bragança",
    sqm: 10_000, // 1 ha
  };

  it("rendimento demonstrável → score baseado em rendimento, engine land_rural", () => {
    const r = evaluateProperty({
      ...base,
      landUse: "olival",
      annualIncome: 450,
      capRate: 0.04,
      yieldPct: 6,
      discountPct: 40,
      pricePerSqm: 1,
      marketAvgPerSqm: 5,
      valuation_confidence: "high",
    });

    expect(r.engine).toBe("land_rural");
    expect(r.valuation).not.toBeNull();
    expect(r.valuation).toBeGreaterThan(0);
    // Valor = rendimento anual ÷ taxa de capitalização = 450 / 0.04 = 11.250
    expect(r.valuation).toBe(11_250);
    expect(r.breakdown.method).toBe("rendimento_agro_florestal");
    expect(r.score).toBeGreaterThan(40);
  });

  it("sem rendimento → score ≤ 30, confidence 'low'", () => {
    const r = evaluateProperty({
      ...base,
      landUse: "unknown",
      // sem annualIncome e sem landUse estimável
    });

    expect(r.engine).toBe("land_rural");
    expect(r.valuation).toBeNull();
    expect(r.confidence).toBe("low");
    expect(r.score).toBeLessThanOrEqual(30);
    expect(r.breakdown.reason).toContain("rendimento");
  });

  it("proibido usar €/m² de construção para terreno rural", () => {
    const r = evaluateProperty({ ...base, landUse: "floresta", annualIncome: 120 });

    const keys = Object.keys(r.breakdown).join(" ").toLowerCase();
    expect(keys).not.toContain("construção");
    expect(keys).not.toContain("construcao");
    expect(r.breakdown.note).toContain("Proibido");
  });
});
