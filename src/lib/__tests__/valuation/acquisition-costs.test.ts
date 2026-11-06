import { describe, it, expect } from "vitest";
import { calculateIMT, calculateAcquisitionCosts } from "../../valuation/acquisition-costs";

describe("simulador de custos de aquisicao", () => {
  it("preco zero -> custos zero", () => {
    const r = calculateAcquisitionCosts({ price: 0 });
    expect(r.imt).toBe(0);
    expect(r.selo).toBe(0);
    expect(r.escritura).toBe(0);
    expect(r.registro).toBe(0);
    expect(r.comissao).toBe(0);
    expect(r.total).toBe(0);
  });

  it("preco 100.000: IMT isento, selo 0,8%, escritura+registro", () => {
    const r = calculateAcquisitionCosts({ price: 100000 });
    expect(r.imt).toBe(0);
    expect(r.selo).toBe(800);
    expect(r.escritura).toBe(1500);
    expect(r.registro).toBe(500);
    expect(r.comissao).toBe(0);
    expect(r.total).toBe(2800);
  });

  it("preco 250.000: IMT escala (100k-150k a 1,5% + 150k-250k a 4,5%)", () => {
    const r = calculateAcquisitionCosts({ price: 250000 });
    expect(r.imt).toBe(5250);
    expect(r.selo).toBe(2000);
    expect(r.escritura).toBe(3750);
    expect(r.registro).toBe(1250);
    expect(r.total).toBe(12250);
  });

  it("comissao de intermediacao soma ao total", () => {
    const r = calculateAcquisitionCosts({ price: 100000, comissaoPct: 5 });
    expect(r.comissao).toBe(5000);
    expect(r.total).toBe(r.imt + r.selo + r.escritura + r.registro + r.comissao);
  });

  it("calculateIMT: isenção ate 100k, 1,5% entre 100k e 150k", () => {
    expect(calculateIMT(100000)).toBe(0);
    expect(calculateIMT(150000)).toBe(750);
    expect(calculateIMT(250000)).toBe(5250);
  });
});
