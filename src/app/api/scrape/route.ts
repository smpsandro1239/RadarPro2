import { NextResponse } from "next/server";
import { scrapeCasaSapo, scrapeImovirtual } from "@/lib/scraper";
import { db } from "@/db";
import { properties } from "@/db/schema";

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

    // Save to database (basic - would need deduplication in production)
    let saved = 0;
    for (const prop of allScraped.slice(0, 20)) {
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
          marketValue: prop.price * 1.2, // Estimate
          discountPct: 15,
          score: 70,
          rentability: 5.0,
          images: prop.imageUrl ? JSON.stringify([prop.imageUrl]) : "[]",
          createdAt: new Date(),
        });
        saved++;
      } catch {
        // Skip duplicates
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
