import { describe, it, expect } from "vitest";
import { groupTopByDistrict } from "../melhores";

interface FakeProperty {
  id: string;
  district: string;
  score: number;
}

describe("groupTopByDistrict", () => {
  it("agrupa por distrito e mantém os melhores N por distrito", () => {
    const items: FakeProperty[] = [
      { id: "1", district: "Lisboa", score: 90 },
      { id: "2", district: "Lisboa", score: 80 },
      { id: "3", district: "Lisboa", score: 70 },
      { id: "4", district: "Lisboa", score: 60 },
      { id: "5", district: "Porto", score: 95 },
    ];

    const grouped = groupTopByDistrict(items, 3);

    expect(grouped.get("Lisboa")?.map((p) => p.id)).toEqual(["1", "2", "3"]);
    expect(grouped.get("Porto")?.map((p) => p.id)).toEqual(["5"]);
  });

  it("devolve vazio para lista sem itens", () => {
    expect(groupTopByDistrict([], 3).size).toBe(0);
  });

  it("suporta uma chave de agrupamento customizada", () => {
    const items = [
      { id: "1", district: "Lisboa", score: 90, type: "T1" as const },
      { id: "2", district: "Porto", score: 90, type: "T1" as const },
    ];
    const grouped = groupTopByDistrict(
      items,
      1,
      (item) => `${item.district}-${item.type}`,
    );
    expect(grouped.size).toBe(2);
    expect(grouped.get("Lisboa-T1")).toHaveLength(1);
  });
});
