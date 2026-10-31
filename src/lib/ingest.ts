import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface ScrapedProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  url: string;
  source: string;
  images: string[];
  isAuction?: boolean;
  auctionEndDate?: number;
  auctionStartDate?: number;
  auctionHouse?: string;
  auctionType?: string;
  currentBid?: number;
  reservePrice?: number;
  maxBid?: number;
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

export async function ingestProperty(prop: ScrapedProperty): Promise<{
  action: "inserted" | "updated" | "skipped";
  id: string;
}> {
  // Normalize
  // Desativar leilões fechados imediatamente
  let isActive = true;
  if (prop.isAuction && prop.auctionEndDate) {
    const endDate = typeof prop.auctionEndDate === "number"
      ? new Date(prop.auctionEndDate * 1000)
      : new Date(prop.auctionEndDate);
    if (endDate < new Date()) {
      isActive = false;
    }
  }

  const normalized = {
    id: prop.id,
    source: prop.source.toLowerCase().replace(/\s+/g, "-"),
    sourceName: prop.source,
    url: prop.url,
    title: prop.title,
    district: prop.location.split(",").pop()?.trim() || "Lisboa",
    municipality: prop.location,
    type: "Apartamento", // Will be refined by parser
    price: prop.price,
    marketValue: Math.round(prop.price * 1.2), // Estimate market value
    discountPct: Math.round(((Math.round(prop.price * 1.2) || prop.price * 1.2) - prop.price) / Math.round(prop.price * 1.2) * 100) || 0,
    score: undefined,
    rentability: undefined,
    images: JSON.stringify(prop.images),
    isActive,
    checkStatus: "pending" as "ok" | "not_found" | "error" | "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    auctionHouse: prop.auctionHouse ?? null,
    auctionType: prop.auctionType ?? null,
    currentBid: prop.currentBid ?? null,
    reservePrice: prop.reservePrice ?? null,
    maxBid: prop.maxBid ?? null,
  };

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
      reservePrice: normalized.reservePrice,
      maxBid: normalized.maxBid,
    };

    await db.update(properties).set(updatedFields).where(eq(properties.id, existing[0].id));

    return { action: "updated", id: existing[0].id };
  }

  // Inferir asset_class a partir de type e title
  const { assetClass, confidence } = inferAssetClass(normalized.type, normalized.title);
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
