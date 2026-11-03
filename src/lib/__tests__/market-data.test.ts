import { describe, expect, it } from "vitest";
import {
  findDistrictMarketData,
  findMarketData,
  MARKET_DATA_DISTRICT,
  type DistrictMarketEntry,
} from "@/lib/market-data";
import { evaluateProperty } from "@/lib/valuation/index";

describe("dados de mercado (tabela real)", () => {
  it("prefere a freguesia", () => {
    const market = findMarketData({
      district: "Lisboa",
      municipality: "Lisboa",
      parish: "Santa Maria Maior",
      propertyType: "apartment",
    });
    expect(market).toEqual({ pricePerSqm: 5200, source: "INE", asOf: "2026-05", level: "parish" });
  });

  it("usa o concelho quando a freguesia nao existe", () => {
    const market = findMarketData({
      district: "Lisboa",
      municipality: "Lisboa",
      parish: "Algés",
      propertyType: "apartment",
    });
    expect(market?.level).toBe("municipality");
    expect(market?.pricePerSqm).toBe(5200);
  });

  it("usa o concelho certo quando o distrito tem varios municipios", () => {
    const market = findMarketData({
      district: "Porto",
      municipality: "Vila Nova de Gaia",
      propertyType: "apartment",
    });
    expect(market).toEqual({ pricePerSqm: 3610, source: "INE", asOf: "2026-05", level: "municipality" });
  });

  it("nao devolve nada para um municipio sem mediana", () => {
    expect(
      findMarketData({
        district: "Porto",
        municipality: "Póvoa de Varzim",
        propertyType: "apartment",
      }),
    ).toBeNull();
  });

  it("tem tabelas separadas para apartamento, terreno urbano e rustico", () => {
    expect(
      findMarketData({ district: "Lisboa", municipality: "Lisboa", propertyType: "urban_land" })?.pricePerSqm,
    ).toBe(1200);
    expect(
      findMarketData({ district: "Viseu", municipality: "Viseu", propertyType: "rural_land" })?.pricePerSqm,
    ).toBe(3.2);
    expect(
      findMarketData({ district: "Lisboa", municipality: "Lisboa", propertyType: "commercial" }),
    ).toBeNull();
  });

  it("a tabela de distrito esta vazia: sem fonte oficial carregada", () => {
    expect(MARKET_DATA_DISTRICT).toEqual([]);
    expect(findDistrictMarketData("Porto", "apartment")).toBeNull();
  });

  it("usa a linha de distrito quando existe (tabela de teste)", () => {
    const table: DistrictMarketEntry[] = [
      { district: "Porto", pricePerSqm: 3000, source: "INE", asOf: "2026-05", propertyType: "apartment" },
    ];
    expect(findDistrictMarketData("Porto", "apartment", table)?.pricePerSqm).toBe(3000);
    expect(findDistrictMarketData("Porto", "urban_land", table)).toBeNull();
    expect(findDistrictMarketData("", "apartment", table)).toBeNull();
  });
});

describe("motor de avaliacao com a tabela real de mercado", () => {
  it("avalia um apartamento com mediana de freguesia", () => {
    const result = evaluateProperty({
      id: "test-1",
      title: "Apartamento T3",
      type: "Apartamento",
      district: "Lisboa",
      municipality: "Lisboa",
      parish: "Santa Maria Maior",
      sqm: 100,
      price: 500000,
    });
    // 5200 EUR/m2 x 100 m2 x 1,10 (ajustamento de tipologia T3)
    expect(result.valuation).toBe(572000);
    expect(result.breakdown["adjustmentFactor"]).toBe(1.1);
    expect(result.engine).toBe("hedonic");
    expect(result.confidence).toBe("high");
    expect(result.breakdown["level"]).toBe("parish");
    expect(result.breakdown["basePerSqm"]).toBe(5200);
  });

  it("avalia com o nivel de concelho e baixa a confianca", () => {
    const result = evaluateProperty({
      id: "test-2",
      title: "Apartamento",
      type: "Apartamento",
      district: "Porto",
      municipality: "Vila Nova de Gaia",
      sqm: 100,
      price: 300000,
    });
    expect(result.valuation).toBe(361000);
    expect(result.confidence).toBe("medium");
    expect(result.breakdown["level"]).toBe("municipality");
  });

  it("nao avalia sem dados de mercado para a zona", () => {
    const result = evaluateProperty({
      id: "test-3",
      title: "Apartamento",
      type: "Apartamento",
      district: "Porto",
      municipality: "Póvoa de Varzim",
      sqm: 100,
      price: 200000,
    });
    expect(result.valuation).toBeNull();
    expect(result.score).toBeNull();
    expect(result.warnings).toContain("Sem dados de mercado para a zona");
  });

  it("nao avalia sem area", () => {
    const result = evaluateProperty({
      id: "test-4",
      title: "Apartamento",
      type: "Apartamento",
      district: "Lisboa",
      municipality: "Lisboa",
      parish: "Santa Maria Maior",
      sqm: null,
      price: 500000,
    });
    expect(result.valuation).toBeNull();
    expect(result.warnings).toContain("Área em falta");
  });
});
