import { describe, expect, it } from "vitest";
import { findDistrictMarketData } from "@/lib/market-data";

describe("dados de mercado (distrito)", () => {
  it("devolve mediana por distrito para Lisboa (apartamento)", () => {
    const market = findDistrictMarketData("Lisboa", "apartment");
    expect(market).not.toBeNull();
    expect(market?.pricePerSqm).toBeGreaterThan(0);
    expect(market?.source).toBe("INE");
  });

  it("devolve mediana por distrito para Porto (moradia)", () => {
    const market = findDistrictMarketData("Porto", "house");
    expect(market).not.toBeNull();
    expect(market?.pricePerSqm).toBeGreaterThan(0);
  });

  it("devolve mediana por distrito para Bragança (apartamento, sem acento)", () => {
    const market = findDistrictMarketData("Braganca", "apartment");
    expect(market).not.toBeNull();
    expect(market?.pricePerSqm).toBeGreaterThan(0);
  });
});
