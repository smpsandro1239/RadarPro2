import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/market-data", () => import("./fixtures/market-data"));
vi.mock("@/lib/auction-calculator", () => import("./fixtures/auction-calculator"));

import { evaluateProperty } from "../index";

function assertFinite(v: unknown, path = "root"): void {
  if (typeof v === "number") expect(Number.isFinite(v), `${path} = ${v}`).toBe(true);
  else if (Array.isArray(v)) v.forEach((x, i) => assertFinite(x, `${path}[${i}]`));
  else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => assertFinite(x, `${path}.${k}`));
}

describe("evaluateProperty - casos reais do site", () => {
  it("terreno da BD com tudo null: sem crash, sem avaliação, score null", () => {
    const r = evaluateProperty({
      id: "mart-bra-1", title: "Terreno Braga (Martelo)", type: "Terreno", asset_class: null,
      district: "Braga", municipality: "Braga", price: 28000, sqm: 2000, pdm_status: null, infrastructure: null,
      is_auction: false, valuation_engine: null, valuation_confidence: null,
    });
    expect(r.assetClass).toBe("urban_land");
    expect(r.valuation).toBeNull();
    expect(r.score).toBeNull();
    expect(r.assumptions.join()).toMatch(/terreno/i);
  });

  it("T0 Alfama a 78 260 €: avaliado e sinalizado como desconto anómalo", () => {
    const r = evaluateProperty({
      title: "Apartamento T0 Alfama", type: "T0", district: "Lisboa", municipality: "Lisboa",
      parish: "Santa Maria Maior", sqm: 35, price: 78260,
    });
    expect(r.valuation).toBe(Math.round(6000 * 0.85 * 35)); // 178 500
    expect(r.score as number).toBeLessThanOrEqual(50);
    expect(r.breakdown.scoreBadges as string[]).toEqual(expect.arrayContaining([expect.stringMatching(/Desconto anómalo/)]));
  });

  it("leilão fiscal a 2 901 €: sem 'excelente oportunidade' implícita", () => {
    const r = evaluateProperty({
      title: "Apartamento Ramalde (Execução Fiscal AT)", type: "T2", district: "Porto", municipality: "Porto",
      sqm: 75, price: 2901, is_auction: true, auction_type: "fiscal",
    });
    expect(r.listingType).toBe("auction_fiscal");
    expect(r.engine).toBe("auction");
    expect(r.breakdown.marketValueSource).toBe("engine:hedonic");
    expect(r.breakdown.marketValue).toBe(Math.round(3800 * 75)); // não é price*1.2
    expect(r.score as number).toBeLessThanOrEqual(50);
    expect(r.warnings.join()).toMatch(/Custos desconhecidos/);
  });

  it("leilão sem valor de mercado possível -> null, não usa price*1.2", () => {
    const r = evaluateProperty({ title: "Terreno Famalicão", district: "Braga", municipality: "Braga", sqm: 900, price: 8000, is_auction: true });
    expect(r.valuation).toBeNull();
    expect(r.score).toBeNull();
    expect(r.assumptions.join()).toMatch(/leilão privado/);
  });

  it("leilão com lance acima do máximo: score <= 30", () => {
    const r = evaluateProperty({
      title: "Apartamento T2", type: "T2", district: "Porto", municipality: "Porto", sqm: 75,
      is_auction: true, auction_type: "judicial", current_bid: 400000, price: 400000,
    });
    expect(r.breakdown.currentBidExceedsMax).toBe(true);
    expect(r.score as number).toBeLessThanOrEqual(30);
  });

  it("garagem sem dados de garagem e prédio misto: sem avaliação", () => {
    expect(evaluateProperty({ title: "Garagem Porto", district: "Porto", municipality: "Porto", sqm: 15, price: 9000 }).valuation).toBeNull();
    const m = evaluateProperty({ title: "Prédio Lisboa", district: "Lisboa", municipality: "Lisboa", sqm: 300, price: 400000 });
    expect(m.assetClass).toBe("mixed");
    expect(m.valuation).toBeNull();
    expect(m.score).toBeNull();
  });
});

describe("evaluateProperty - robustez (fuzz)", () => {
  function rng(seed: number) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  it("3000 entradas aleatórias: nunca lança, nunca produz NaN/Infinity, score coerente", () => {
    const r = rng(20261101);
    const pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)];
    const nums = [null, undefined, 0, -5, 1, 35, 75, 500, 2000, 78260, 1e12, NaN, Infinity, "abc", "80000", ""];
    const districts = [null, "", "Lisboa", "Porto", "Braga", "Faro", "Évora", "Açores", "Marte"];
    const strs = [null, undefined, "", "x", "T0", "T2", "V5", "Terreno", "Loja", "Garagem", "Prédio", "buildable", "unknown", "full", "olival", "fiscal"];
    const classes = [null, undefined, "bogus", "apartment", "house", "urban_land", "rural_land", "commercial", "garage", "mixed"];
    for (let i = 0; i < 3000; i++) {
      const raw = {
        district: pick(districts), municipality: pick(districts), parish: pick(strs),
        price: pick(nums), sqm: pick(nums), type: pick(strs), title: pick(strs), asset_class: pick(classes),
        floor: pick(nums), total_floors: pick(nums), condition: pick(strs), energy_cert: pick(strs),
        is_auction: pick([true, false, null, "true", 1]), auction_type: pick(strs), current_bid: pick(nums),
        market_value: pick(nums), condominium_debt: pick(nums), renovation_estimate: pick(nums),
        pdm_status: pick(strs), infrastructure: pick(strs), topography: pick(strs), road_frontage_meters: pick(nums),
        land_use: pick(strs), annual_income: pick(nums), cap_rate: pick(nums), annual_rent: pick(nums),
        yield_pct: pick(nums), market_cap_rate: pick(nums),
      };
      const out = evaluateProperty(raw);
      if (out.valuation !== null) {
        expect(Number.isFinite(out.valuation)).toBe(true);
        expect(out.valuation).toBeGreaterThanOrEqual(0);
      } else {
        expect(out.score).toBeNull();
      }
      if (out.score !== null) {
        expect(Number.isInteger(out.score)).toBe(true);
        expect(out.score).toBeGreaterThanOrEqual(0);
        expect(out.score).toBeLessThanOrEqual(100);
        expect(out.valuation).not.toBeNull();
      }
      assertFinite(out.breakdown);
      expect(out.warnings.length).toBe(new Set(out.warnings).size);
    }
  });
});
