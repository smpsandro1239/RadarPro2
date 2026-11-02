import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/market-data", () => import("./fixtures/market-data"));
vi.mock("@/lib/auction-calculator", () => import("./fixtures/auction-calculator"));

import { evaluateApartment, FACTOR_MAX } from "../apartment";
import { evaluateCommercial } from "../commercial";
import { evaluateGarage } from "../garage";
import { evaluateRuralLand } from "../land-rural";
import { evaluateUrbanLand } from "../land-urban";
import { normalizeProperty } from "../normalize";

const P = (o: Record<string, unknown>) => normalizeProperty(o);
beforeEach(() => vi.restoreAllMocks());

describe("apartment (hedónico)", () => {
  const base = { district: "Lisboa", municipality: "Lisboa", parish: "Santa Maria Maior", sqm: 50, type: "T2", floor: 2, total_floors: 5 };
  it("calcula valor, confiança alta ao nível da freguesia e faixa ±10%", () => {
    const r = evaluateApartment(P(base));
    expect(r.valuation).toBe(Math.round(6000 * 1.02 * 50)); // andar 2 -> 1.02
    expect(r.confidence).toBe("high");
    expect(r.breakdown.rangeLow).toBe(Math.round((r.valuation as number) * 0.9));
    expect(r.engine).toBe("hedonic");
  });
  it("sem área NÃO inventa 70 m²", () => {
    const r = evaluateApartment(P({ ...base, sqm: null }));
    expect(r.valuation).toBeNull();
    expect(r.warnings.join()).toMatch(/Área em falta/);
  });
  it("sem distrito NÃO assume Lisboa", () => {
    expect(evaluateApartment(P({ ...base, district: null })).valuation).toBeNull();
  });
  it("sem dados de mercado -> null", () => {
    expect(evaluateApartment(P({ ...base, district: "Beja", municipality: "Beja", parish: null })).valuation).toBeNull();
  });
  it("limita o produto dos ajustamentos", () => {
    const r = evaluateApartment(P({ ...base, type: "V5", condition: "novo", energy_cert: "A+", has_view: true, has_garage: true, has_elevator: true }));
    expect(r.breakdown.adjustmentFactor).toBe(FACTOR_MAX);
    expect(r.warnings.join()).toMatch(/limitados/);
  });
  it("dados de mercado antigos baixam a confiança", () => {
    const r = evaluateApartment(P({ district: "Faro", sqm: 80, type: "T2" }));
    expect(r.confidence).toBe("very_low"); // distrito (low) -> desatualizado -> very_low
    expect(r.warnings.join()).toMatch(/desatualizados/);
  });
  it("estado/certificado com acentos, maiúsculas e valores desconhecidos", () => {
    const ok = evaluateApartment(P({ ...base, condition: "A recuperar" }));
    expect(ok.breakdown.adjustments).toMatchObject({ condition: 0.75 });
    const bad = evaluateApartment(P({ ...base, condition: "xpto" }));
    expect(bad.assumptions.join()).toMatch(/Estado "xpto" não reconhecido/);
  });
  it("tipologia lida do título quando type não a tem", () => {
    const r = evaluateApartment(P({ ...base, type: "Apartamento", title: "Apartamento T0 Alfama" }));
    expect(r.breakdown.adjustments).toMatchObject({ typology: 0.85 });
  });
});

describe("terreno urbano", () => {
  const base = { district: "Braga", municipality: "Braga", sqm: 1000, pdm_status: "buildable", infrastructure: "full", topography: "flat", road_frontage_meters: 20 };
  it("avalia com fatores", () => {
    const r = evaluateUrbanLand(P(base));
    expect(r.valuation).toBe(126000); // 120 * 1.05 * 1000
    expect(r.confidence).toBe("medium");
  });
  it("REGRESSÃO: pdm null devolve null, não 0", () => {
    const r = evaluateUrbanLand(P({ ...base, pdm_status: null }));
    expect(r.valuation).toBeNull();
    expect(r.confidence).toBe("very_low");
  });
  it("restricted aplica 0.6 e limita confiança", () => {
    const r = evaluateUrbanLand(P({ ...base, pdm_status: "restricted" }));
    expect(r.valuation).toBe(75600);
  });
  it("REGRESSÃO: fator de área usa a área real do lote", () => {
    const r = evaluateUrbanLand(P({ ...base, sqm: 300 }));
    expect(r.breakdown.adjustedPerSqm as number).toBeCloseTo(120 * 1.05 * 0.9, 6);
  });
  it("sem área -> null", () => {
    expect(evaluateUrbanLand(P({ ...base, sqm: null })).valuation).toBeNull();
  });
});

describe("terreno rústico", () => {
  const base = { sqm: 20000, land_use: "Olival" };
  it("rendimento estimado -> confiança baixa", () => {
    const r = evaluateRuralLand(P(base));
    expect(r.valuation).toBe(22500); // 450*2ha / 0.04
    expect(r.confidence).toBe("low");
    expect(r.assumptions.length).toBeGreaterThan(0);
  });
  it("rendimento informado -> confiança média", () => {
    const r = evaluateRuralLand(P({ ...base, annual_income: 1000 }));
    expect(r.valuation).toBe(25000);
    expect(r.confidence).toBe("medium");
  });
  it("REGRESSÃO: capRate null não dá Infinity; 4 e 0.04 equivalem; inválido usa defeito", () => {
    const withNull = evaluateRuralLand(P({ ...base, annual_income: 1000, cap_rate: null }));
    expect(Number.isFinite(withNull.valuation)).toBe(true);
    expect(evaluateRuralLand(P({ ...base, annual_income: 1000, cap_rate: 4 })).valuation).toBe(25000);
    expect(evaluateRuralLand(P({ ...base, annual_income: 1000, cap_rate: 0.04 })).valuation).toBe(25000);
    const zero = evaluateRuralLand(P({ ...base, annual_income: 1000, cap_rate: 0 }));
    expect(zero.valuation).toBe(25000);
    expect(zero.warnings.join()).toMatch(/inválida/);
  });
  it("sem rendimento nem uso conhecido -> null", () => {
    expect(evaluateRuralLand(P({ sqm: 5000 })).valuation).toBeNull();
    expect(evaluateRuralLand(P({ sqm: 5000, land_use: "desconhecido" })).valuation).toBeNull();
  });
});

describe("comercial", () => {
  it("REGRESSÃO: ignora o yield do próprio anúncio (circularidade)", () => {
    const r = evaluateCommercial(P({ annual_rent: 6000, yield_pct: 6, market_cap_rate: 0.05 }));
    expect(r.valuation).toBe(120000);
    expect(r.confidence).toBe("medium");
    expect(r.engine).toBe("income");
  });
  it("sem taxa de mercado usa 6% com confiança baixa e pressuposto", () => {
    const r = evaluateCommercial(P({ annual_rent: 6000 }));
    expect(r.valuation).toBe(100000);
    expect(r.confidence).toBe("low");
    expect(r.assumptions.length).toBe(1);
  });
  it("avisa quando as duas abordagens divergem", () => {
    const r = evaluateCommercial(P({ district: "Porto", municipality: "Porto", sqm: 100, annual_rent: 6000 }));
    expect(r.warnings.join()).toMatch(/divergentes/);
    expect(r.confidence).toBe("low");
  });
  it("só €/m² quando falta renda; sem área não inventa 60 m²", () => {
    expect(evaluateCommercial(P({ district: "Porto", municipality: "Porto", sqm: 100 })).valuation).toBe(250000);
    expect(evaluateCommercial(P({ district: "Porto", municipality: "Porto" })).valuation).toBeNull();
  });
});

describe("garagem", () => {
  it("usa dados próprios de garagem", () => {
    expect(evaluateGarage(P({ district: "Lisboa", municipality: "Lisboa", sqm: 12 })).valuation).toBe(18000);
  });
  it("REGRESSÃO: sem dados de garagem NÃO usa €/m² de apartamentos", () => {
    expect(evaluateGarage(P({ district: "Porto", municipality: "Porto", sqm: 15 })).valuation).toBeNull();
  });
  it("sem área -> null", () => {
    expect(evaluateGarage(P({ district: "Lisboa", municipality: "Lisboa" })).valuation).toBeNull();
  });
});
