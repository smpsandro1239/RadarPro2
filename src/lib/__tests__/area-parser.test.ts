import { describe, expect, it } from "vitest";
import { parseAreaDetails } from "../area-parser";

describe("parseAreaDetails", () => {
  it("separa área útil, bruta e terreno", () => {
    expect(parseAreaDetails("Área útil: 85 m² Área bruta privativa: 100 m² Área do terreno: 1.250 m²")).toEqual({
      usableAreaSqm: 85,
      grossAreaSqm: 100,
      landAreaSqm: 1250,
    });
  });

  it("aceita casas decimais portuguesas e ponto decimal", () => {
    expect(parseAreaDetails("Área útil: 125,5 m2")).toEqual({ usableAreaSqm: 125.5 });
    expect(parseAreaDetails("Área bruta: 125.5 m2")).toEqual({ grossAreaSqm: 125.5 });
  });

  it("rejeita formatos numéricos malformados", () => {
    expect(parseAreaDetails("Área útil: 12.34.5 m²")).toEqual({});
  });

  it("não interpreta números sem rótulo de área como área", () => {
    expect(parseAreaDetails("T2 · 85 m² · 250.000 €")).toEqual({});
  });
});
