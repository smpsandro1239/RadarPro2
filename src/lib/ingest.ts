import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { normalizeDistrict, resolveGeography } from "@/lib/geography";
import { evaluateProperty } from "@/lib/valuation";

/** Rotulo em portugues para o tipo inferido (o schema guarda texto livre). */
const ASSET_CLASS_LABEL: Record<string, string> = {
  apartment: "Apartamento",
  house: "Moradia",
  urban_land: "Terreno",
  rural_land: "Terreno rústico",
  commercial: "Comercial",
  garage: "Garagem",
};

export interface ScrapedProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  url: string;
  source: string;
  images: string[];
  areaSqm?: number | null;
  isAuction?: boolean;
  auctionEndDate?: number;
  auctionStartDate?: number;
  auctionHouse?: string;
  auctionType?: string;
  currentBid?: number;
  openingBid?: number;
  reservePrice?: number;
  maxBid?: number;
  /** Geografia estruturada (canais oficiais). Tem prioridade sobre `location`. */
  district?: string | null;
  municipality?: string | null;
  parish?: string | null;
  /** Tipo do imovel ("Moradia T4"). Sem tipo, e deduzido do titulo. */
  type?: string | null;
}


/**
 * Infere asset_class a partir de type e title.
 * Regras:
 *  apartamento/T0-T4 -> apartment
 *  moradia/V2-V5 -> house
 *  terreno urbano/lote -> urban_land
 *  terreno rústico -> rural_land
 *  loja/armazém/escritório -> commercial
 *  garagem/box -> garage
 *  ambíguo -> mixed + confidence='low'
 */
export function inferAssetClass(type: string | null, title: string | null): { assetClass: string; confidence: 'high' | 'medium' | 'low' } {
  const t = (type || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const text = t + ' ' + titleLower;

  const garageKw = ['garagem', 'box', 'garage', 'lugar de estacionamento', 'estacionamento'];
  const apartmentKw = ['apartamento', 't0', 't1', 't2', 't3', 't4', 'apt', 'apartament'];
  const houseKw = ['moradia', 'v2', 'v3', 'v4', 'v5', 'vivenda', 'casa '];
  const urbanLandKw = ['terreno urbano', 'lote', 'terreno de construção', 'edificável', 'construção'];
  const ruralLandKw = ['terreno rústico', 'rústico', 'floresta', 'agricola', 'agrícola', 'olival', 'vinha'];
  const commercialKw = ['loja', 'armazem', 'armazém', 'escritório', 'escritorio', 'comercial'];

  if (garageKw.some(k => text.includes(k))) return { assetClass: 'garage', confidence: 'high' };
  if (apartmentKw.some(k => text.includes(k))) return { assetClass: 'apartment', confidence: 'high' };
  if (houseKw.some(k => text.includes(k))) return { assetClass: 'house', confidence: 'high' };
  if (urbanLandKw.some(k => text.includes(k))) return { assetClass: 'urban_land', confidence: 'high' };
  if (ruralLandKw.some(k => text.includes(k))) return { assetClass: 'rural_land', confidence: 'high' };
  if (commercialKw.some(k => text.includes(k))) return { assetClass: 'commercial', confidence: 'medium' };

  return { assetClass: 'mixed', confidence: 'low' };
}

/**
 * A coluna area_sqm so passa a existir depois da migracao aprovada
 * (scripts/sql/0002_add_property_valuation_inputs.sql). ate la, o scraper extrai a
 * area mas a base de dados nao a pode guardar.
 */
const supportsAreaColumn = "areaSqm" in properties;
const supportsOpeningBidColumn = "openingBid" in properties;

/** `parish` so existe na base depois da migracao 0002 (ver scripts/sql/0002). */
const supportsParishColumn = "parish" in properties;

export async function ingestProperty(prop: ScrapedProperty): Promise<{
  action: "inserted" | "updated" | "skipped";
  id: string;
}> {
  // Normalize
  // Desativar leilões fechados imediatamente
  let isActive = true;
  if (prop.isAuction && prop.auctionEndDate) {
    const endDate = typeof prop.auctionEndDate === "number"
      ? new Date(prop.auctionEndDate)
      : new Date(prop.auctionEndDate);
    if (endDate < new Date()) {
      isActive = false;
    }
  }

  const geography = resolveGeography({
    district: prop.district,
    municipality: prop.municipality,
    parish: prop.parish,
    location: prop.location,
  });

  // Sem distrito nao ha imovel para o RadarPro (a base exige o campo e o site
  // agrupa por distrito): nao se inventa "Lisboa" como antes.
  if (geography.district === null) {
    console.warn(`[ingest] ${prop.id} ignorado: sem distrito reconhecivel ("${prop.location}")`);
    return { action: "skipped", id: prop.id };
  }

  const inferred = inferAssetClass(prop.type ?? null, prop.title);

  const normalized = {
    id: prop.id,
    source: prop.source.toLowerCase().replace(/\s+/g, "-"),
    sourceName: prop.source,
    url: prop.url,
    title: prop.title,
    district: normalizeDistrict(geography.district) ?? geography.district,
    municipality: geography.municipality ?? geography.district,
    ...(supportsParishColumn ? { parish: geography.parish } : {}),
    type: prop.type ?? ASSET_CLASS_LABEL[inferred.assetClass] ?? "",
    price: prop.price,
    marketValue: null,
    discountPct: null,
    score: null,
    rentability: null,
    images: JSON.stringify(prop.images),
    isActive,
    checkStatus: "pending" as "ok" | "not_found" | "error" | "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    auctionHouse: prop.auctionHouse ?? null,
    auctionType: prop.auctionType ?? null,
    // Convencao unica: em leilao, `price` e o lance atual; `current_bid` espelha-o.
    currentBid: prop.currentBid ?? (prop.isAuction ? prop.price : null),
    ...(supportsOpeningBidColumn ? { openingBid: prop.openingBid ?? (prop.isAuction && !prop.currentBid ? prop.price : null) } : {}),
    reservePrice: prop.reservePrice ?? null,
    ...(supportsAreaColumn ? { areaSqm: prop.areaSqm ?? null } : {}),
    maxBid: prop.maxBid ?? null,
  };

  // Avaliacao com o motor v2 (unifica o caminho de escrita com o dry-run).
  const valuation = evaluateProperty({
    ...normalized,
    assetClass: inferred.assetClass as any,
    areaSqm: prop.areaSqm ?? null,
    isAuction: prop.isAuction ?? false,
    auctionType: prop.auctionType ?? null,
    currentBid: prop.currentBid ?? (prop.isAuction ? prop.price : null),
    marketValue: null,
  });
  (normalized as any).marketValue = valuation.valuation;
  (normalized as any).score = valuation.score;
  if (valuation.valuation && prop.price) {
    (normalized as any).discountPct = Math.round(((valuation.valuation - prop.price) / valuation.valuation) * 100);
  }

  // Check if property already exists (by source_url)
  const existing = await db
    .select()
    .from(properties)
    .where(eq(properties.url, normalized.url))
    .limit(1);

  if (existing.length > 0) {
    const existingProp = existing[0];
    const updatedFields: Record<string, any> = {
      title: normalized.title,
      district: normalized.district,
      municipality: normalized.municipality,
      ...(supportsParishColumn ? { parish: normalized.parish } : {}),
      type: normalized.type,
      price: normalized.price,
      marketValue: normalized.marketValue,
      discountPct: normalized.discountPct,
      score: normalized.score,
      rentability: normalized.rentability,
      images: normalized.images,
      isActive: normalized.isActive,
      checkStatus: "ok",
      updatedAt: new Date(),
      auctionHouse: normalized.auctionHouse,
      auctionType: normalized.auctionType,
      currentBid: normalized.currentBid,
      ...(supportsOpeningBidColumn ? { openingBid: normalized.openingBid } : {}),
      reservePrice: normalized.reservePrice,
      ...(supportsAreaColumn ? { areaSqm: normalized.areaSqm ?? null } : {}),
      maxBid: normalized.maxBid,
    };

    await db.update(properties).set(updatedFields).where(eq(properties.id, existing[0].id));

    return { action: "updated", id: existing[0].id };
  }

  // Inferir asset_class a partir de type e title
  const { assetClass, confidence } = inferred;
  (normalized as any).assetClass = assetClass;
  (normalized as any).valuationConfidence = confidence;

  // Se confiança baixa → pending_review, não calcular score final
  if (confidence === 'low') {
    normalized.checkStatus = 'pending';
  }

  await db.insert(properties).values(normalized as any);
  return { action: "inserted", id: normalized.id };
}

export async function processScrapeResults(results: ScrapedProperty[]) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const prop of results) {
    try {
      const result = await ingestProperty(prop);
      if (result.action === "inserted") inserted++;
      else if (result.action === "updated") updated++;
      else skipped++;
    } catch (err) {
      console.error("Error ingesting property:", prop.id, err);
      skipped++;
    }
  }

  return { inserted, updated, skipped };
}
