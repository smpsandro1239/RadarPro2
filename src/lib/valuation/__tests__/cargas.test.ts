import { describe, expect, it } from "vitest";
import { calculateCargas } from "../cargas";

describe("calculateCargas", () => {
  it("cargas zero -> total 0, sem alerta", () => {
    const r = calculateCargas({
      cargasTotal: 0,
      condominiumDebt: 0,
      renovationEstimate: 0,
      embargos: 0,
      hipotecas: 0,
      marketValue: 300_000,
    });
    expect(r.total).toBe(0);
    expect(r.loadPct).toBe(0);
    expect(r.exceedsAlertThreshold).toBe(false);
  });

  it("cargas inferiores a 20% do valor -> sem alerta", () => {
    const r = calculateCargas({
      cargasTotal: null,
      condominiumDebt: 5_000,
      renovationEstimate: 2_000,
      embargos: 1_000,
      hipotecas: 3_000,
      marketValue: 300_000,
    });
    expect(r.total).toBe(11_000);
    expect(r.loadPct).toBeCloseTo(3.7, 1);
    expect(r.exceedsAlertThreshold).toBe(false);
  });

  it("cargas superiores a 20% do valor -> alerta", () => {
    const r = calculateCargas({
      cargasTotal: null,
      condominiumDebt: 40_000,
      renovationEstimate: 10_000,
      embargos: 20_000,
      hipotecas: 30_000,
      marketValue: 300_000,
    });
    expect(r.total).toBe(100_000);
    expect(r.loadPct).toBeGreaterThan(20);
    expect(r.exceedsAlertThreshold).toBe(true);
  });

  it("cargas desconhecidas (componente null) -> total null, sem alerta", () => {
    const r = calculateCargas({
      cargasTotal: null,
      condominiumDebt: null,
      renovationEstimate: 0,
      embargos: 0,
      hipotecas: 0,
      marketValue: 300_000,
    });
    expect(r.total).toBeNull();
    expect(r.loadPct).toBeNull();
    expect(r.exceedsAlertThreshold).toBe(false);
  });

  it("usa cargasTotal explicito quando fornecido", () => {
    const r = calculateCargas({
      cargasTotal: 150_000,
      condominiumDebt: 0,
      renovationEstimate: 0,
      embargos: 0,
      hipotecas: 0,
      marketValue: 300_000,
    });
    expect(r.total).toBe(150_000);
    expect(r.exceedsAlertThreshold).toBe(true);
  });
});
