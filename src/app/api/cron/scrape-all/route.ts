import { NextResponse } from "next/server";
import {
  scrapeCasaSapo,
  scrapeImovirtual,
  scrapeIdealista,
  scrapeOLX,
  scrapeCustoJusto,
  scrapeLeiloes,
} from "@/lib/scrapers";
import { processScrapeResults } from "@/lib/ingest";

export async function POST(request: Request) {
  try {
    const { sources } = await request.json();

    const sourcesMap: Record<string, (district: string) => Promise<any[]>> = {
      casasapo: scrapeCasaSapo,
      imovirtual: scrapeImovirtual,
      idealista: scrapeIdealista,
      olx: scrapeOLX,
      custojusto: scrapeCustoJusto,
      leiloes: scrapeLeiloes,
    };

    const allResults: any[] = [];

    const districts = ["Lisboa", "Porto", "Braga", "Faro", "Setúbal", "Aveiro", "Coimbra"];

    for (const source of sources || ["casasa", "imovirtual", "idealista", "olx", "custojusto"]) {
      const scraper = sourcesMap[source];
      if (!scraper) continue;

      for (const district of districts) {
        try {
          const results = await scraper(district);
          const processed = await processScrapeResults(results);
          allResults.push({ district, source, scraped: results.length, ...processed });
        } catch (err) {
          console.error(`Error scraping ${source} ${district}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true, results: allResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
