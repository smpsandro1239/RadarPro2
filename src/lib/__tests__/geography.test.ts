import { describe, expect, it } from "vitest";
import {
  canonicalDistrict,
  isDistrict,
  isSameDistrict,
  normalizeDistrict,
  parseLocation,
  resolveGeography,
} from "@/lib/geography";

describe("geografia de Portugal", () => {
  it("reconhece os distritos", () => {
    expect(isDistrict("Lisboa")).toBe(true);
    expect(isDistrict("Porto")).toBe(true);
    expect(isDistrict("Bragança")).toBe(true);
    expect(isDistrict("Braganca")).toBe(true);
    expect(isDistrict("Lisboa District")).toBe(false);
    expect(isDistrict("Póvoa de Varzim")).toBe(false);
    expect(isDistrict(null)).toBe(false);
  });

  it("devolve o nome canonico do distrito", () => {
    expect(canonicalDistrict("lisboa")).toBe("Lisboa");
    expect(canonicalDistrict("braganca")).toBe("Bragança");
    expect(canonicalDistrict("setubal")).toBe("Setúbal");
    expect(canonicalDistrict("Peniche")).toBeNull();
    expect(normalizeDistrict(" lisboa ")).toBe("Lisboa");
    expect(normalizeDistrict("Peniche")).toBe("Peniche");
    expect(normalizeDistrict("")).toBeNull();
  });

  it("compara distritos ignorando acentos e caixa", () => {
    expect(isSameDistrict("Bragança", "Braganca")).toBe(true);
    expect(isSameDistrict("Lisboa", "lisboa")).toBe(true);
    expect(isSameDistrict("Lisboa", "Porto")).toBe(false);
    expect(isSameDistrict(null, "Lisboa")).toBe(false);
  });

  it("le freguesia, concelho e distrito de um texto com tres partes", () => {
    expect(parseLocation("Santa Maria Maior, Lisboa, Lisboa")).toEqual({
      district: "Lisboa",
      municipality: "Lisboa",
      parish: "Santa Maria Maior",
    });
    expect(parseLocation("Cadima, Cantanhede, Coimbra")).toEqual({
      district: "Coimbra",
      municipality: "Cantanhede",
      parish: "Cadima",
    });
  });

  it("com duas partes assume que a primeira e o concelho", () => {
    expect(parseLocation("Póvoa de Varzim, Porto")).toEqual({
      district: "Porto",
      municipality: "Póvoa de Varzim",
      parish: null,
    });
  });

  it("com uma parte so aceita um distrito", () => {
    expect(parseLocation("Lisboa")).toEqual({ district: "Lisboa", municipality: null, parish: null });
    expect(parseLocation("Peniche")).toEqual({ district: null, municipality: null, parish: null });
  });

  it("nao inventa geografia quando o texto nao aponta para um distrito", () => {
    expect(parseLocation("Rua Principal, Peniche")).toEqual({
      district: null,
      municipality: null,
      parish: null,
    });
    expect(parseLocation("Moradia em Peniche")).toEqual({
      district: null,
      municipality: null,
      parish: null,
    });
    expect(parseLocation("")).toEqual({ district: null, municipality: null, parish: null });
    expect(parseLocation(null)).toEqual({ district: null, municipality: null, parish: null });
  });

  it("prefere a geografia estruturada", () => {
    expect(
      resolveGeography({ district: "Coimbra", municipality: "Cantanhede", parish: "Cadima", location: "ignored" }),
    ).toEqual({ district: "Coimbra", municipality: "Cantanhede", parish: "Cadima" });
  });

  it("completa com o texto so quando o texto aponta para o mesmo distrito", () => {
    expect(resolveGeography({ district: "Porto", location: "Póvoa de Varzim, Porto" })).toEqual({
      district: "Porto",
      municipality: "Póvoa de Varzim",
      parish: null,
    });
    expect(resolveGeography({ district: "Porto", location: "Algés, Lisboa" })).toEqual({
      district: "Porto",
      municipality: null,
      parish: null,
    });
  });

  it("usa o texto quando nao ha distrito estruturado", () => {
    expect(resolveGeography({ location: "Cadima, Cantanhede, Coimbra" })).toEqual({
      district: "Coimbra",
      municipality: "Cantanhede",
      parish: "Cadima",
    });
  });
});
