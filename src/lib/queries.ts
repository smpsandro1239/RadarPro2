import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/db/schema";
import { priceHistory } from "@/db/schema";
import { desc, eq, and, sql, inArray } from "drizzle-orm";
import { showSeedData } from "@/lib/data-origin";
import { demoDataCondition } from "@/lib/data-origin-sql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

/**
 * Condicoes das consultas publicas. Por omissao os dados de demonstracao
 * ficam de fora (SHOW_SEED_DATA=true mostra-os, com o banner de aviso).
 */
function publicConditions() {
  const conditions = [eq(properties.isActive, true)];
  if (!showSeedData()) conditions.push(demoDataCondition());
  return conditions;
}

export interface PriceChangeInfo {
  type: "price_down" | "price_up";
  price: number;
  previousPrice: number;
  changePct: number;
}

/**
 * Anexa a cada imóvel a ultima alteração de preço observada em price_history
 * (comparando a entrada mais recente com a anterior). Permite badges sem N+1.
 */
async function attachLastChange<T extends { id: string; price: number }>(
  rows: T[],
): Promise<Array<T & { lastChange: PriceChangeInfo | null }>> {
  if (rows.length === 0) return [];
  const history = await db
    .select({
      propertyId: priceHistory.propertyId,
      price: priceHistory.price,
      recordedAt: priceHistory.recordedAt,
    })
    .from(priceHistory)
    .where(inArray(priceHistory.propertyId, rows.map((r) => r.id)))
    .orderBy(desc(priceHistory.recordedAt));

  const byProperty = new Map<string, Array<{ price: number; recordedAt: unknown }>>();
  for (const h of history) {
    const pid = String(h.propertyId);
    const arr = byProperty.get(pid) ?? [];
    arr.push({ price: Number(h.price), recordedAt: h.recordedAt });
    byProperty.set(pid, arr);
  }

  return rows.map((r) => {
    const entries = (byProperty.get(r.id) ?? []).slice().sort(
      (a, b) => new Date(b.recordedAt as any).getTime() - new Date(a.recordedAt as any).getTime(),
    );
    const last = entries[0];
    const prev = entries[1];
    let lastChange: PriceChangeInfo | null = null;
    if (last && prev && last.price < prev.price) {
      lastChange = { type: "price_down", price: last.price, previousPrice: prev.price, changePct: Math.round(((last.price - prev.price) / prev.price) * 100) };
    } else if (last && prev && last.price > prev.price) {
      lastChange = { type: "price_up", price: last.price, previousPrice: prev.price, changePct: Math.round(((last.price - prev.price) / prev.price) * 100) };
    }
    return { ...r, lastChange };
  });
}

export async function getLatestProperties() {
  const result = await db
    .select()
    .from(properties)
    .where(and(...publicConditions()))
    .orderBy(desc(properties.score))
    .limit(50);
  return await attachLastChange(result);
}

export async function getPropertiesByDistrict(district: string) {
  return await db
    .select()
    .from(properties)
    .where(and(...publicConditions(), eq(properties.district, district)));
}

export async function getAllActiveProperties(listingType?: string, isAuction?: string) {
  const conditions = publicConditions();

  if (isAuction === "true") {
    conditions.push(eq(properties.isAuction, true));
  } else if (isAuction === "false") {
    conditions.push(eq(properties.isAuction, false));
  }

  if (listingType === "fixed_price") {
    conditions.push(eq(properties.isAuction, false));
  } else if (listingType && listingType.startsWith("auction_")) {
    conditions.push(eq(properties.isAuction, true));
    if (listingType !== "auction_\*") {
      conditions.push(eq(properties.auctionType, listingType.replace("auction_", "") as any));
    }
  }

  const result = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.score));
  return await attachLastChange(result);
}

export async function getTotalActiveProperties() {
  const result = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(properties)
    .where(and(...publicConditions()));

  return Number(result[0]?.count || 0);
}

export async function getDistinctSourceCount() {
  const result = await db
    .select({ sourceName: properties.sourceName })
    .from(properties)
    .where(and(...publicConditions()))
    .groupBy(properties.sourceName);

  return result.length;
}
