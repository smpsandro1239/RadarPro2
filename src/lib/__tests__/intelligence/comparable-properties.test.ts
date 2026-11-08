import { describe, expect, it } from "vitest";
import { compareProperties, type ComparableProperty } from "../../intelligence/comparable-properties";

const subject: ComparableProperty = {
  id: "subject",
  price: 180_000,
  sqm: 90,
  district: "Braga",
  municipality: "Braga",
  type: "T2",
  assetClass: "apartment",
};

describe("compareProperties", () => {
  it("calcula a mediana €/m² apenas com imóveis semelhantes", () => {
    const candidates: ComparableProperty[] = [
      { ...subject, id: "a", price: 160_000, sqm: 80 },
      { ...subject, id: "b", price: 180_000, sqm: 90 },
      { ...subject, id: "c", price: 200_000, sqm: 100 },
      { ...subject, id: "other-type", type: "T3" },
      { ...subject, id: "other-city", municipality: "Guimarães" },
      { ...subject, id: "auction", isAuction: true },
    ];

    const result = compareProperties(subject, candidates);

    expect(result.status).toBe("ok");
    expect(result.sampleSize).toBe(3);
    expect(result.medianPricePerSqm).toBe(2_000);
    expect(result.subjectPricePerSqm).toBe(2_000);
    expect(result.differencePct).toBe(0);
    expect(result.confidence).toBe("medium");
  });

  it("não apresenta comparação fiável quando a amostra é insuficiente", () => {
    const result = compareProperties(subject, [
      { ...subject, id: "one", price: 150_000 },
    ]);

    expect(result.status).toBe("insufficient_data");
    expect(result.confidence).toBe("low");
    expect(result.sampleSize).toBe(1);
    expect(result.medianPricePerSqm).toBe(1_666.67);
  });

  it("recusa calcular €/m² quando falta a área do imóvel analisado", () => {
    const result = compareProperties({ ...subject, sqm: null }, []);

    expect(result.status).toBe("insufficient_data");
    expect(result.confidence).toBe("very_low");
    expect(result.subjectPricePerSqm).toBeNull();
    expect(result.reasons).toContain("Área do imóvel em análise desconhecida.");
  });
  it("exclui anúncios ainda não validados", () => {
    const result = compareProperties(subject, [
      { ...subject, id: "verified-a", price: 160_000, sqm: 80, checkStatus: "ok" },
      { ...subject, id: "verified-b", price: 180_000, sqm: 90, checkStatus: "ok" },
      { ...subject, id: "verified-c", price: 200_000, sqm: 100, checkStatus: "ok" },
      { ...subject, id: "pending", price: 150_000, sqm: 90, checkStatus: "pending" },
    ]);

    expect(result.status).toBe("ok");
    expect(result.sampleSize).toBe(3);
    expect(result.comparables.map((item) => item.id)).not.toContain("pending");
  });

  it("não avalia um anúncio-alvo ainda não validado", () => {
    const result = compareProperties(
      { ...subject, checkStatus: "pending" },
      [
        { ...subject, id: "a", checkStatus: "ok" },
        { ...subject, id: "b", checkStatus: "ok" },
        { ...subject, id: "c", checkStatus: "ok" },
      ],
    );

    expect(result.status).toBe("insufficient_data");
    expect(result.confidence).toBe("very_low");
    expect(result.reasons).toContain("O anúncio em análise ainda não foi validado.");
  });


  it("compara preços quando falta a área, sem calcular €/m²", () => {
    const result = compareProperties(
      { ...subject, sqm: null, usableAreaSqm: null },
      [
        { ...subject, id: "price-a", price: 160_000, sqm: 80 },
        { ...subject, id: "price-b", price: 180_000, sqm: 90 },
        { ...subject, id: "price-c", price: 200_000, sqm: 100 },
        { ...subject, id: "price-auction", price: 100_000, isAuction: true },
        { ...subject, id: "price-pending", price: 120_000, checkStatus: "pending" },
      ],
    );
    expect(result.comparisonMode).toBe("price_only");
    expect(result.status).toBe("ok");
    expect(result.sampleSize).toBe(3);
    expect(result.medianPrice).toBe(180_000);
    expect(result.priceDifferencePct).toBe(0);
    expect(result.subjectPricePerSqm).toBeNull();
    expect(result.medianPricePerSqm).toBeNull();
    expect(result.comparables).toHaveLength(0);
  });

  it("indica dados insuficientes quando não há área nem comparáveis", () => {
    const result = compareProperties({ ...subject, sqm: null }, []);
    expect(result.comparisonMode).toBe("price_only");
    expect(result.status).toBe("insufficient_data");
    expect(result.confidence).toBe("very_low");
    expect(result.priceDifferencePct).toBeNull();
  });


  it("não mistura área útil com área bruta nos comparáveis", () => {
    const result = compareProperties(
      { ...subject, sqm: null, usableAreaSqm: 90 },
      [
        { ...subject, id: "gross-only", sqm: null, usableAreaSqm: null, grossAreaSqm: 90, price: 150_000 },
        { ...subject, id: "usable-a", sqm: null, usableAreaSqm: 88, price: 160_000 },
        { ...subject, id: "usable-b", sqm: null, usableAreaSqm: 90, price: 180_000 },
        { ...subject, id: "usable-c", sqm: null, usableAreaSqm: 92, price: 200_000 },
      ],
    );
    expect(result.sampleSize).toBe(3);
    expect(result.comparables.map((item) => item.id)).not.toContain("gross-only");
  });

});
