export type InferredAssetClass = "apartment" | "house" | "urban_land" | "rural_land" | "commercial" | "garage" | "mixed" | "unknown";
export interface AssetClassInference { assetClass: InferredAssetClass; confidence: "high" | "medium" | "low"; }

export function inferAssetClass(type: string | null, title: string | null): AssetClassInference {
  const t = (type ?? "").toLocaleLowerCase("pt-PT");
  const titleText = (title ?? "").toLocaleLowerCase("pt-PT");
  const value = t + " " + titleText;
  const has = (words: string[]) => words.some((word) => value.includes(word));
  if (has(["garagem", "box", "garage", "lugar de estacionamento", "estacionamento"])) return { assetClass: "garage", confidence: "high" };
  if (has(["terreno rústico", "terreno rustico", "rústico", "rustico", "floresta", "agrícola", "agricola", "olival", "vinha"])) return { assetClass: "rural_land", confidence: "high" };
  if (has(["terreno urbano", "lote para construção", "lote de terreno", "terreno para construção", "edificável", "edificavel"])) return { assetClass: "urban_land", confidence: "high" };
  if (has(["armazém", "armazem", "loja", "escritório", "escritorio", "espaço comercial", "comercial"])) return { assetClass: "commercial", confidence: "high" };
  if (has(["moradia", "vivenda", "casa independente", "v2", "v3", "v4", "v5"])) return { assetClass: "house", confidence: "high" };
  if (has(["apartamento", "t0", "t1", "t2", "t3", "t4", "t5"])) return { assetClass: "apartment", confidence: "high" };
  return t.trim() ? { assetClass: "mixed", confidence: "low" } : { assetClass: "unknown", confidence: "low" };
}
