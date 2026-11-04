import { createClient } from "@libsql/client";

const db = createClient({ url: "file:./local.db" });

async function main() {
  const imgs = await db.execute(`
    SELECT source,
      COUNT(*) FILTER (WHERE images IS NULL OR images = '[]') AS sem,
      COUNT(*) FILTER (WHERE images IS NOT NULL AND images != '[]') AS com
    FROM properties
    GROUP BY source
  `);
  console.log("=== H.1 IMAGENS POR FONTE (local.db proxy) ===");
  for (const r of imgs.rows) console.log(JSON.stringify(r));

  const scrapes = await db.execute(`
    SELECT id, asset_class, area_sqm, price, opening_bid, market_value
    FROM properties
    WHERE score IS NULL AND data_origin = 'scrape'
  `);
  console.log("=== H.2 SCORES EM FALTA (scrape) ===");
  console.log("Total scrape sem score:", scrapes.rows.length);
  for (const r of scrapes.rows) console.log(JSON.stringify(r));

  const mixed = await db.execute(`SELECT COUNT(*) AS cnt FROM properties WHERE asset_class = 'mixed'`);
  console.log("=== H.3 MIXED COUNT ===");
  console.log(JSON.stringify(mixed.rows[0]));

  const font = await db.execute(`SELECT source, COUNT(*) AS total FROM properties GROUP BY source`);
  console.log("=== FONTE DISTRIBUTION ===");
  for (const r of font.rows) console.log(JSON.stringify(r));
}

main().catch((e) => { console.error(e); process.exit(1); });
