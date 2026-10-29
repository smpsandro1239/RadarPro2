import { NextResponse } from "next/server";
import { scrapeLeiloes } from "@/lib/scrapers";
import { processScrapeResults } from "@/lib/ingest";

export async function POST(request: Request) {
  try {
    const { districts } = await request.json();

    const districtsList = districts || ["Lisboa", "Porto", "Braga", "Faro", "Setúbal", "Aveiro", "Coimbra"];

    const allResults: Array<{ district: string; scraped: number; inserted: number; updated: number; skipped: number }> = [];

    for (const district of districtsList) {
      try {
        const results = await scrapeLeiloes(district);
        const processed = await processScrapeResults(results);
        allResults.push({ district, scraped: results.length, ...processed });
      } catch (err) {
        console.error(`Error scraping leilões ${district}:`, err);
      }
    }

    return NextResponse.json({ success: true, results: allResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
