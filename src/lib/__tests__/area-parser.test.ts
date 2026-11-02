import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  extractImovirtualListings,
  extractJsonLdListings,
  matchByTitle,
  parseAreaSqm,
  parseNumber,
} from "@/lib/area-parser";

const fixture = (name: string) =>
  readFileSync(resolve(process.cwd(), "src/lib/__tests__/fixtures", name), "utf8");

describe("parseAreaSqm", () => {
  it("extrai a area quando o texto a identifica como area do imovel", () => {
    expect(parseAreaSqm("Apartamento T2, com 72 m² de área bruta, 2 quartos")).toBe(72);
    expect(parseAreaSqm("T4 a estrear com 216,09 m² de área bruta privativa")).toBe(216.09);
    expect(parseAreaSqm("Área: 85 m2")).toBe(85);
    expect(parseAreaSqm("T3 com 118 m² de área")).toBe(118);
  });

  it("aceita separador de milhar com ponto", () => {
    expect(parseAreaSqm("Terreno com 1.234 m²")).toBe(1234);
  });

  it("devolve null quando ha varias areas sem rotulo (ambiguidade)", () => {
    expect(parseAreaSqm("Sala e cozinha em open space com 21m², Varanda com 5m²")).toBeNull();
  });

  it("devolve null para intervalos", () => {
    expect(parseAreaSqm("Terreno com 85-120 m²")).toBeNull();
  });

  it("devolve null quando nao ha area", () => {
    expect(parseAreaSqm("Moradia V3 com quintal")).toBeNull();
    expect(parseAreaSqm("")).toBeNull();
    expect(parseAreaSqm(null)).toBeNull();
  });
});

describe("parseNumber", () => {
  it("normaliza formato pt-PT e EN", () => {
    expect(parseNumber("216,09")).toBe(216.09);
    expect(parseNumber("1.234")).toBe(1234);
    expect(parseNumber("72")).toBe(72);
  });
});

describe("extractJsonLdListings (Casa Sapo)", () => {
  const listings = extractJsonLdListings(fixture("casasapo-search.html"));

  it("encontra os anuncios do JSON-LD", () => {
    expect(listings).toHaveLength(2);
    expect(listings[0].title).toBe("Apartamento T2 São Vicente, Lisboa");
    expect(listings[0].price).toBe(399000);
  });

  it("extrai a area da descricao", () => {
    expect(listings[0].areaSqm).toBe(72);
  });

  it("usa floorSize quando existe", () => {
    expect(listings[1].areaSqm).toBe(216.09);
  });
});

describe("extractImovirtualListings (Imovirtual)", () => {
  const listings = extractImovirtualListings(fixture("imovirtual-search.html"));

  it("encontra os anuncios do __NEXT_DATA__", () => {
    expect(listings).toHaveLength(3);
    expect(listings[0].title).toBe("Apartamento T3 na Estrela");
    expect(listings[0].price).toBe(285000);
  });

  it("extrai a area estruturada", () => {
    expect(listings.map((l) => l.areaSqm)).toEqual([119, 69, null]);
  });

  it("extrai a geografia (distrito/concelho/freguesia)", () => {
    expect(listings[0].district).toBe("Lisboa");
    expect(listings[0].municipality).toBe("Lisboa");
    expect(listings[0].parish).toBe("São Vicente");
    expect(listings[2].parish).toBeNull();
  });
});

describe("matchByTitle", () => {
  const listings = extractJsonLdListings(fixture("casasapo-search.html"));

  it("casa por titulo exato", () => {
    expect(matchByTitle(listings, "Apartamento T2 São Vicente, Lisboa")?.areaSqm).toBe(72);
  });

  it("casa por prefixo (titulo do cartao e mais curto)", () => {
    expect(matchByTitle(listings, "Apartamento T2 São Vicente")?.areaSqm).toBe(72);
  });

  it("nao casa titulos diferentes", () => {
    expect(matchByTitle(listings, "Moradia V3 com quintal")).toBeNull();
  });
});
