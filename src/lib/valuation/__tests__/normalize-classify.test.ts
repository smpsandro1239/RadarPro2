import { describe, expect, it } from "vitest";
import { deriveAssetClass, deriveListingType } from "../classify";
import { normalizeProperty } from "../normalize";

describe("normalizeProperty", () => {
  it("aceita snake_case e camelCase e converte null/''/NaN/strings", () => {
    const p = normalizeProperty({
      id: 7, asset_class: "urban_land", pdm_status: "buildable", total_floors: "5",
      price: "80000", sqm: "", is_auction: 1, current_bid: NaN, district: " Braga ",
    });
    expect(p.id).toBe("7");
    expect(p.assetClass).toBe("urban_land");
    expect(p.pdmStatus).toBe("buildable");
    expect(p.totalFloors).toBe(5);
    expect(p.price).toBe(80000);
    expect(p.sqm).toBeNull();
    expect(p.isAuction).toBe(true);
    expect(p.currentBid).toBeNull();
    expect(p.district).toBe("Braga");
  });
  it("rejeita asset_class inválido e é idempotente", () => {
    expect(normalizeProperty({ asset_class: "bogus" }).assetClass).toBeNull();
    const once = normalizeProperty({ asset_class: "garage", pdm_status: "x", price: "10" });
    expect(normalizeProperty(once)).toEqual(once);
  });
  it("não rebenta com lixo", () => {
    expect(() => normalizeProperty(null)).not.toThrow();
    expect(() => normalizeProperty("abc")).not.toThrow();
    expect(normalizeProperty(undefined).price).toBeNull();
  });
});

describe("deriveAssetClass / deriveListingType", () => {
  const c = (o: Record<string, unknown>) => deriveAssetClass(normalizeProperty(o));
  it("respeita a classe guardada, incluindo mixed", () => {
    expect(c({ asset_class: "mixed", title: "Apartamento T2" })).toMatchObject({ assetClass: "mixed", inferred: false });
  });
  it("deduz a classe do texto", () => {
    expect(c({ title: "Terreno Rústico Valdreu, Vila Verde" }).assetClass).toBe("rural_land");
    expect(c({ title: "Terreno Braga (Martelo)" }).assetClass).toBe("urban_land");
    expect(c({ title: "Loja em Serpa" }).assetClass).toBe("commercial");
    expect(c({ title: "Armazém Maia" }).assetClass).toBe("commercial");
    expect(c({ title: "Garagem Porto" }).assetClass).toBe("garage");
    expect(c({ title: "Arrecadação Vila Nova de Famalicão" }).assetClass).toBe("garage");
    expect(c({ title: "Prédio em Lisboa" }).assetClass).toBe("mixed");
    expect(c({ title: "Moradia V3 Braga" }).assetClass).toBe("house");
    expect(c({ title: "Apartamento T1 Parque das Nações" }).assetClass).toBe("apartment");
  });
  it("por omissão assume apartamento mas marca como deduzido", () => {
    expect(c({ title: "Imóvel Porto (Execução Fiscal AT)" })).toMatchObject({ assetClass: "apartment", inferred: true });
  });
  it("tipo de leilão", () => {
    const l = (o: Record<string, unknown>) => deriveListingType(normalizeProperty(o));
    expect(l({})).toEqual({ listingType: "fixed_price", assumed: false });
    expect(l({ is_auction: true, auction_type: "Fiscal" }).listingType).toBe("auction_fiscal");
    expect(l({ is_auction: true, auction_type: "judicial" }).listingType).toBe("auction_judicial");
    expect(l({ is_auction: true })).toEqual({ listingType: "auction_private", assumed: true });
  });
});
