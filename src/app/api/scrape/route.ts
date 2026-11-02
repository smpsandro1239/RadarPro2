import { NextResponse } from "next/server";
import { scrapeCasaSapo, scrapeImovirtual } from "@/lib/scraper";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authorizeWrite } from "@/lib/api-auth";

/**
 * A coluna area_sqm so existe depois da migracao aprovada
 * (scripts/sql/0002_add_property_valuation_inputs.sql).
 */
const supportsAreaColumn = "areaSqm" in properties;

export async function POST(request: Request) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;

  try {
    // O formulario do /admin envia form-urlencoded; chamadas API enviam JSON.
    const body = await readBody(request);
    const district = body.district || "Lisboa";
    const sources = body.sources || ["casasapo", "imovirtual"];

    let allScraped: Awaited<ReturnType<typeof scrapeCasaSapo>> = [];

    if (sources.includes("casasapo")) {
      const results = await scrapeCasaSapo(district);
      allScraped = allScraped.concat(results);
    }

    if (sources.includes("imovirtual")) {
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

async function readBody(request: Request): Promise<Record<string, any>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await request.json().catch(() => ({}));
  }
  const form = await request.formData().catch(() => null);
  if (!form) return {};
  const sources = form.get("sources");
  return {
    district: form.get("district"),
    sources: typeof sources === "string" && sources ? sources.split(",") : undefined,
  };
}
