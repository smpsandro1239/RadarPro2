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
});
