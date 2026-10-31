/**
 * RadarPro Portugal - Testes unitários: terreno urbano (land-urban)
 * Executa com: npx vitest run src/lib/__tests__/valuation/land-urban.test.ts
 */
import { describe, it, expect } from "vitest";
import { evaluateProperty } from "../../valuation/index";

describe("terreno urbano", () => {
  const base = {
    asset_class: "urban_land",
    district: "Aveiro",
    municipality: "Estarreja",
    sqm: 500,
    infrastructure: "full",
    topography: "flat",
    roadFrontageMeters: 20,
    minArea: 1000,
  };

  it("pdmStatus = 'buildable' → score > 40", () => {
    const r = evaluateProperty({
      ...base,
      pdmStatus: "buildable",
      discountPct: 40,
      pricePerSqm: 200,
      marketAvgPerSqm: 500,
      yieldPct: 5,
      valuation_confidence: "high",
    });

    expect(r.engine).toBe("land_urban");
    expect(r.valuation).not.toBeNull();
    expect(r.valuation).toBeGreaterThan(0);
    expect(r.score).toBeGreaterThan(40);
  });

  it("pdmStatus = 'unknown' → score ≤ 40, confidence 'very_low'", () => {
    const r = evaluateProperty({ ...base, pdmStatus: "unknown" });

    expect(r.engine).toBe("land_urban");
    expect(r.valuation).toBeNull();
    expect(r.confidence).toBe("very_low");
    expect(r.score).toBeLessThanOrEqual(40);
    expect(r.breakdown.reason).toContain("PDM");
  });

  it("não usa €/m² de construção para terreno urbano", () => {
    const r = evaluateProperty({ ...base, pdmStatus: "buildable" });

    const keys = Object.keys(r.breakdown).join(" ").toLowerCase();
    expect(keys).not.toContain("construção");
    expect(keys).not.toContain("construcao");
    expect(keys).not.toContain("valor construção");
  });
});
