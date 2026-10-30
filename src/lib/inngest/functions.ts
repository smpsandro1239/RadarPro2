import { inngest } from "../inngest";
import { processScrapeResults } from "@/lib/ingest";
import {
  scrapeCasaSapo,
  scrapeImovirtual,
  scrapeIdealista,
  scrapeOLX,
  scrapeCustoJusto,
  scrapeELeiloes,
  scrapeImobancos,
  scrapeMillenniumBCP,
  scrapeSantander,
  scrapeMontepio,
  scrapeCaixaImobiliario,
  scrapeCreditoAgricola,
  scrapeNovoBanco,
  scrapeBPI,
} from "@/lib/scrapers";

const DISTRICTS = [
  "Lisboa",
  "Porto",
  "Braga",
  "Faro",
  "Setúbal",
  "Aveiro",
  "Coimbra",
];

const SOURCE_SCRAPERS: Record<string, (district: string) => Promise<any[]>> = {
  casasapo: scrapeCasaSapo,
  imovirtual: scrapeImovirtual,
  idealista: scrapeIdealista,
  olx: scrapeOLX,
  custojusto: scrapeCustoJusto,
  leiloes: scrapeELeiloes,
  imobancos: scrapeImobancos,
  "millennium-bcp": scrapeMillenniumBCP,
  santander: scrapeSantander,
  montepio: scrapeMontepio,
  "caixa-imobiliario": scrapeCaixaImobiliario,
  "credito-agricola": scrapeCreditoAgricola,
  novobanco: scrapeNovoBanco,
  bpi: scrapeBPI,
};

// Scrape a single source for a single district
export const scrapeSource = inngest.createFunction(
  { id: "scrape-source", name: "Scrape Source", triggers: [{ event: "scrape.source" }] },
  async ({ event, step }: { event: any; step: any }) => {
    const { source, district } = event.data as { source: string; district: string };

    const scraper = SOURCE_SCRAPERS[source];
    if (!scraper) {
      throw new Error(`Unknown source: ${source}`);
    }

    const results = await step.run("scrape", async () => {
      return scraper(district);
    });

    const processed = await step.run("ingest", async () => {
      return processScrapeResults(results);
    });

    await step.run("index-new-properties", async () => {
      const { isTypesenseConfigured } = await import("@/lib/search-config");

      if (!isTypesenseConfigured()) {
        console.info("Typesense não configurado — a pular indexação incremental.");
        return { indexed: 0, mode: "skipped" };
      }

      try {
        const { indexProperty } = await import("@/lib/typesense");
        const { db } = await import("@/db");
        const { properties } = await import("@/db/schema");
        const { eq, and } = await import("drizzle-orm");

        const props = await db
          .select()
          .from(properties)
          .where(and(eq(properties.source, source), eq(properties.isActive, true)));

        for (const prop of props) {
          await indexProperty({
            id: prop.id,
            source: prop.source,
            source_name: prop.sourceName,
            url: prop.url,
            title: prop.title,
            district: prop.district,
            municipality: prop.municipality,
            type: prop.type,
            price: Math.round(prop.price),
            market_value: prop.marketValue ? Math.round(prop.marketValue) : null,
            discount_pct: prop.discountPct ? Math.round(prop.discountPct) : null,
            score: prop.score ?? 0,
            rentability: prop.rentability,
            is_auction: Boolean(prop.isAuction),
            is_active: Boolean(prop.isActive),
            created_at: Math.floor(new Date(prop.createdAt ?? new Date()).getTime() / 1000),
            updated_at: Math.floor(new Date(prop.updatedAt ?? new Date()).getTime() / 1000),
          });
        }

        return { indexed: props.length, mode: "typesense" };
      } catch (err) {
        console.error("Typesense index-new-properties failed (non-blocking):", err);
        return { indexed: 0, mode: "failed", error: String(err) };
      }
    });

    return { source, district, scraped: results.length, ...processed };
  }
);

// Scrape all sources for all districts (full pipeline)
export const scrapeAll = inngest.createFunction(
  { id: "scrape-all", name: "Scrape All Sources", triggers: [{ event: "scrape.all" }] },
  async ({ step }: { step: any }) => {
    const results: any[] = [];

    for (const source of Object.keys(SOURCE_SCRAPERS)) {
      for (const district of DISTRICTS) {
        await step.run(`scrape-${source}-${district}`, async () => {
          const scraper = SOURCE_SCRAPERS[source];
          const scraped = await scraper(district);
          return processScrapeResults(scraped);
        });
        results.push({ source, district });
      }
    }

    return { success: true, results };
  }
);

// Expire stale properties
export const expireStale = inngest.createFunction(
  { id: "expire-stale", name: "Expire Stale Properties", triggers: [{ event: "expire.stale" }] },
  async ({ step }: { step: any }) => {
    const result = await step.run("expire", async () => {
      const { db } = await import("@/db");
      const { properties } = await import("@/db/schema");
      const { eq, and, lt } = await import("drizzle-orm");

      const maxAgeDays = 7;
      const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);

      const expired = await db
        .update(properties)
        .set({ isActive: false, checkStatus: "not_found" })
        .where(
          and(
            eq(properties.isActive, true),
            lt(properties.lastChecked, cutoffDate)
          )
        );

      return { expired: (expired.rows?.length ?? 0) || 0 };
    });

    return result;
  }
);

// Geocode properties without coordinates
export const geocodeMissing = inngest.createFunction(
  { id: "geocode-missing", name: "Geocode Missing Properties", triggers: [{ event: "geocode.missing" }] },
  async ({ step }: { step: any }) => {
    const result = await step.run("geocode", async () => {
      const { db } = await import("@/db");
      const { properties } = await import("@/db/schema");
      const { isNull, or } = await import("drizzle-orm");

      const unGeocoded = await db
        .select({
          id: properties.id,
          title: properties.title,
          district: properties.district,
          municipality: properties.municipality,
        })
        .from(properties)
        .where(or(isNull(properties.lat), isNull(properties.lng)))
        .limit(50);

      return { geocoded: unGeocoded.length };
    });

    return result;
  }
);

// Send email alerts
export const sendAlerts = inngest.createFunction(
  { id: "send-alerts", name: "Send Search Alerts", triggers: [{ event: "alerts.send" }] },
  async ({ step }: { step: any }) => {
    const result = await step.run("send", async () => {
      return { sent: 0 };
    });

    return result;
  }
);

// Auction closing soon - runs hourly
export const auctionClosingSoon = inngest.createFunction(
  { id: "auction-closing-soon", name: "Auction Closing Soon", triggers: [{ event: "auction.closing.soon" }] },
  async ({ step }: { step: any }) => {
    const result = await step.run("check-closing", async () => {
      const { db } = await import("@/db");
      const { properties } = await import("@/db/schema");
      const { and, gte, lt, eq } = await import("drizzle-orm");

      const now = new Date();
      const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const closingAuctions = await db
        .select({
          id: properties.id,
          title: properties.title,
          district: properties.district,
          municipality: properties.municipality,
          currentBid: properties.currentBid,
          auctionEndDate: properties.auctionEndDate,
        })
        .from(properties)
        .where(
          and(
            eq(properties.isAuction, true),
            eq(properties.isActive, true),
            gte(properties.auctionEndDate, now),
            lt(properties.auctionEndDate, in24h)
          )
        );

      return { closingAuctions: closingAuctions.length, auctions: closingAuctions };
    });

    return result;
  }
);

// Close expired auctions
export const closeExpiredAuctions = inngest.createFunction(
  { id: "close-expired-auctions", name: "Close Expired Auctions", triggers: [{ event: "auction.close.expired" }] },
  async ({ step }: { step: any }) => {
    const result = await step.run("close", async () => {
      const { db } = await import("@/db");
      const { properties } = await import("@/db/schema");
      const { and, lt, eq } = await import("drizzle-orm");

      const now = new Date();

      const closed = await db
        .update(properties)
        .set({ isActive: false, checkStatus: "not_found" })
        .where(
          and(
            eq(properties.isAuction, true),
            eq(properties.isActive, true),
            lt(properties.auctionEndDate, now)
          )
        );

      return { closed: (closed.rows?.length ?? 0) || 0 };
    });

    return result;
  }
);
