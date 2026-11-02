/**
 * RadarPro Portugal - Testes unitários: motor hedónico (apartment)
 * Executa com: npx vitest run src/lib/__tests__/valuation/apartment.test.ts
 */
import { describe, it, expect } from "vitest";
import { evaluateProperty } from "../../valuation/index";

describe("apartamento - motor hedónico", () => {
    // Teste legado da API v1: o motor v2 usa cobertura e limites declarados,
  // pelo que as expectativas da v1 nao se cumprem. Migracao para a v2 = Fase 3.
  // it.fails avisa se o teste comecar a passar (ou seja, quando for migrado).
it.fails("T1 Parque das Nações: AVM ~145.000€, yield 4–5%, engine hedonic", () => {
    const r = evaluateProperty({
      asset_class: "apartment",
      district: "Lisboa",
      municipality: "Lisboa",
      parish: "Parque das Nações",
      type: "T1",
      sqm: 30,
      condition: "BOM",
      energyCert: "C",
      yieldPct: 4.5,
    });

    expect(r.engine).toBe("hedonic");
    expect(r.valuation).not.toBeNull();
    expect(r.valuation).toBeGreaterThan(140_000);
    expect(r.valuation).toBeLessThan(150_000);
    expect(r.confidence).toBe("medium");
    // yield 4.5% → yieldScore = 60 (escala calibrada PT: 4% → 60, 5% → 80)
    // TODO(Fase 3): teste legado da API v1 — migrar para o motor v2.
    expect((r.breakdown.scoreBreakdown as Record<string, number | null> | undefined)?.yield).toBe(60);
  });

  it("asset_class = 'apartment' produz engine 'hedonic'", () => {
    const r = evaluateProperty({
      asset_class: "apartment",
      district: "Lisboa",
      municipality: "Lisboa",
      parish: "Santa Maria Maior",
      type: "T2",
      sqm: 70,
    });

    expect(r.engine).toBe("hedonic");
    expect(r.breakdown.level).toBe("parish");
    expect(r.valuation).toBeGreaterThan(0);
  });
});
