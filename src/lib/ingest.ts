import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { inferAssetClass } from "@/lib/asset-classification";
export { inferAssetClass } from "@/lib/asset-classification";

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
  type?: string;
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
    type: prop.type?.trim() || "Por classificar",
    price: prop.price,
    marketValue: null,
    discountPct: null,
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
    const inferred = inferAssetClass(prop.type ?? null, normalized.title);
    const updatedFields: Record<string, any> = {
      title: normalized.title,
      district: normalized.district,
      municipality: normalized.municipality,
      type: normalized.type,
      price: normalized.price,
      marketValue: existingProp.marketValue ?? null,
      discountPct: existingProp.marketValue && existingProp.marketValue > 0 ? Math.round(((existingProp.marketValue - normalized.price) / existingProp.marketValue) * 100) : null,
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
      assetClass: inferred.assetClass,
      valuationConfidence: inferred.confidence,
    };

    await db.update(properties).set(updatedFields).where(eq(properties.id, existing[0].id));

    return { action: "updated", id: existing[0].id };
  }

  // Inferir asset_class a partir de type e title
  const { assetClass, confidence } = inferAssetClass(prop.type ?? null, normalized.title);
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
