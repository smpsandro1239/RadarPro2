import { NextResponse } from "next/server";
import { scrapeCasaSapo, scrapeImovirtual } from "@/lib/scraper";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * A coluna area_sqm so existe depois da migracao aprovada
 * (scripts/sql/0002_add_property_valuation_inputs.sql).
 */
const supportsAreaColumn = "areaSqm" in properties;

export async function POST(request: Request) {
  try {
    const { district, sources } = await request.json();
    const selectedSources = sources || ["casasapo", "imovirtual"];

    let allScraped: Awaited<ReturnType<typeof scrapeCasaSapo>> = [];

    if (selectedSources.includes("casasapo")) {
      const results = await scrapeCasaSapo(district);
      allScraped = allScraped.concat(results);
    }

    if (selectedSources.includes("imovirtual")) {
      const results = await scrapeImovirtual(district);
      allScraped = allScraped.concat(results);
    }

    // Save to database with deduplication
    let saved = 0;
    let skipped = 0;
    for (const prop of allScraped.slice(0, 20)) {
      // Generate dedup hash
      const dedupHash = [prop.title, district, prop.location, "Apartamento", prop.price].join("|").toLowerCase().replace(/\s+/g, "");

      // Check if already exists
      const existing = await db.select().from(properties).where(eq(properties.dedupHash, dedupHash)).limit(1);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      try {
        await db.insert(properties).values({
          id: crypto.randomUUID(),
          source: "portal",
          sourceName: prop.source,
          url: prop.url,
          title: prop.title,
          district: district,
          municipality: prop.location,
          type: "Apartamento",
          price: prop.price,
          // marketValue / discountPct / score / rentability sao calculados pelo motor de
          // avaliacao. Sem motor ligado ficam a null: nada de price*1.2, 15% ou 70 fixos.
          marketValue: null,
          discountPct: null,
          score: null,
          rentability: null,
          ...(supportsAreaColumn ? { areaSqm: prop.areaSqm ?? null } : {}),
          images: prop.imageUrl ? JSON.stringify([prop.imageUrl]) : "[]",
          dedupHash,
          isActive: true,
          checkStatus: "pending",
          createdAt: new Date(),
        });
        saved++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      scraped: allScraped.length,
      saved,
      district,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro no scraping" }, { status: 500 });
  }
}
