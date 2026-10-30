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
    score: Math.round(Math.random() * 20) + 70, // Temporary scoring
    rentability: Math.round((5 + Math.random() * 5) * 10) / 10,
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
