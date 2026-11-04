import { createClient } from "@libsql/client";
import { writeFileSync } from "fs";
import { join } from "path";
import { existsSync } from "fs";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:./local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const images = await db.execute(`
    SELECT source,
      COUNT(*) FILTER (WHERE images IS NULL OR images = '[]') AS sem,
      COUNT(*) FILTER (WHERE images IS NOT NULL AND images != '[]') AS com,
      COUNT(*) AS total
    FROM properties
    GROUP BY source
  `);

  const scoresMissing = await db.execute(`
    SELECT id, asset_class, area_sqm, price, opening_bid, market_value
    FROM properties
    WHERE score IS NULL AND data_origin = 'scrape'
  `);

  const mixed = await db.execute(`
    SELECT COUNT(*) AS cnt FROM properties WHERE asset_class = 'mixed'
  `);

  const imagesRows = images.rows.map((r: Record<string, unknown>) => ({
    source: r.source as string,
    sem: Number(r.sem),
    com: Number(r.com),
    total: Number(r.total),
  }));

  const totalWithImages = imagesRows.reduce((a, r) => a + r.com, 0);
  const totalWithoutImages = imagesRows.reduce((a, r) => a + r.sem, 0);
  const totalProperties = imagesRows.reduce((a, r) => a + r.total, 0);

  const report = `# Backfill Report - RadarPro2

**Gerado:** ${new Date().toISOString()}
**Base:** ${process.env.TURSO_DATABASE_URL ?? "file:./local.db"}

## Imagens
- **Com imagem:** ${totalWithImages}/${totalProperties} (${((100 * totalWithImages) / (totalProperties || 1)).toFixed(1)}%)
- **Sem imagem:** ${totalWithoutImages}/${totalProperties} (${((100 * totalWithoutImages) / (totalProperties || 1)).toFixed(1)}%)

### Distribuição por fonte
| source | sem | com | total |
|---|---|---|---|
| ${imagesRows.map((r) => `${r.source} | ${r.sem} | ${r.com} | ${r.total}`).join("\n")}`;

  writeFileSync(join(process.cwd(), "docs", "backfill-report.md"), report);

  console.log(`Imagens: ${totalWithImages}/${totalProperties} com imagem`);
  console.log(`Sem score (scrape): ${scoresMissing.rows.length}`);
  console.log(`Mixed: ${mixed.rows[0]?.cnt ?? 0}`);
}

main().catch((e) => { console.error(e); process.exit(1); });