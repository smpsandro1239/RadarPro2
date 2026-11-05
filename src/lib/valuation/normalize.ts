import type { AssetClass, PropertyInput } from "./types";
import { toBool, toNum, toStr } from "./utils";

const ASSET_CLASSES: ReadonlySet<string> = new Set([
  "apartment", "house", "urban_land", "rural_land", "commercial", "garage", "mixed",
]);

/**
 * Converte uma linha da BD (snake_case) ou um objeto camelCase num PropertyInput.
 * Aceita as duas grafias, trata null/""/NaN/strings numéricas. É idempotente.
 */
export function normalizeProperty(input: unknown): PropertyInput {
  const raw: Record<string, unknown> =
    input !== null && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const g = (camel: string, snake: string): unknown => {
    const a = raw[camel];
    if (a !== undefined && a !== null) return a;
    const b = raw[snake];
    return b !== undefined && b !== null ? b : null;
  };

  const ac = toStr(g("assetClass", "asset_class"));
  const id = g("id", "id");

  return {
    id: id === null ? null : String(id),
    title: toStr(g("title", "title")),
    type: toStr(g("type", "type")),
    assetClass: ac !== null && ASSET_CLASSES.has(ac) ? (ac as AssetClass) : null,

    district: toStr(g("district", "district")),
    municipality: toStr(g("municipality", "municipality")),
    parish: toStr(g("parish", "parish")),

    price: toNum(g("price", "price")),
    sqm: toNum(g("sqm", "area_sqm")) ?? toNum(g("areaSqm", "area")),

    floor: toNum(g("floor", "floor")),
    totalFloors: toNum(g("totalFloors", "total_floors")),
    orientation: toStr(g("orientation", "orientation")),
    condition: toStr(g("condition", "condition")),
    energyCert: toStr(g("energyCert", "energy_cert")),
    hasGarage: toBool(g("hasGarage", "has_garage")),
    hasElevator: toBool(g("hasElevator", "has_elevator")),
    hasView: toBool(g("hasView", "has_view")),

    isAuction: toBool(g("isAuction", "is_auction")),
    auctionType: toStr(g("auctionType", "auction_type")),
    currentBid: toNum(g("currentBid", "current_bid")),
    marketValue: toNum(g("marketValue", "market_value")),
    auctionHouse: toStr(g("auctionHouse", "auction_house")),
    vpt: toNum(g("vpt", "vpt")),
    condominiumDebt: toNum(g("condominiumDebt", "condominium_debt")),
    renovationEstimate: toNum(g("renovationEstimate", "renovation_estimate")),
    embargos: toNum(g("embargos", "embargos")),
    hipotecas: toNum(g("hipotecas", "hipotecas")),
    cargasTotal: toNum(g("cargasTotal", "cargas_total")),

    pdmStatus: toStr(g("pdmStatus", "pdm_status")),
    infrastructure: toStr(g("infrastructure", "infrastructure")),
    topography: toStr(g("topography", "topography")),
    roadFrontageMeters: toNum(g("roadFrontageMeters", "road_frontage_meters")),

    landUse: toStr(g("landUse", "land_use")),
    annualIncome: toNum(g("annualIncome", "annual_income")),
    capRate: toNum(g("capRate", "cap_rate")),
    annualRent: toNum(g("annualRent", "annual_rent")),
    yieldPct: toNum(g("yieldPct", "yield_pct")),
    marketCapRate: toNum(g("marketCapRate", "market_cap_rate")),
  };
}
