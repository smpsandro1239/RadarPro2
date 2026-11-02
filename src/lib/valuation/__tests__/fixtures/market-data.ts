/** Fixture de TESTE. Imita a forma de findMarketData; não são valores reais. */
export interface MarketData {
  pricePerSqm: number;
  level: "parish" | "municipality" | "district";
  source: string;
  asOf: string;
}
interface Query {
  district: string;
  municipality?: string;
  parish?: string;
  propertyType: string;
}

const monthsAgo = (m: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - m);
  return d.toISOString().slice(0, 10);
};
const FRESH = monthsAgo(3);
const STALE = monthsAgo(48);

const parish: Record<string, [number, string]> = {
  "apartment|Lisboa|Lisboa|Santa Maria Maior": [6000, FRESH],
};
const municipality: Record<string, [number, string]> = {
  "apartment|Lisboa|Lisboa": [5200, FRESH],
  "apartment|Porto|Porto": [3800, FRESH],
  "urban_land|Braga|Braga": [120, FRESH],
  "commercial|Porto|Porto": [2500, FRESH],
  "garage|Lisboa|Lisboa": [1500, FRESH],
};
const district: Record<string, [number, string]> = {
  "apartment|Braga": [2200, FRESH],
  "apartment|Faro": [3500, STALE],
};

export function findMarketData(q: Query): MarketData | null {
  const t = q.propertyType;
  const pk = `${t}|${q.district}|${q.municipality ?? q.district}|${q.parish ?? ""}`;
  if (parish[pk]) return { pricePerSqm: parish[pk][0], level: "parish", source: "fixture", asOf: parish[pk][1] };
  const mk = `${t}|${q.district}|${q.municipality ?? q.district}`;
  if (municipality[mk]) return { pricePerSqm: municipality[mk][0], level: "municipality", source: "fixture", asOf: municipality[mk][1] };
  const dk = `${t}|${q.district}`;
  if (district[dk]) return { pricePerSqm: district[dk][0], level: "district", source: "fixture", asOf: district[dk][1] };
  return null;
}
