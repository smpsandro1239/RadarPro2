import { db } from "../src/db/index";
import { properties } from "../src/db/schema";

async function main() {
  const rows = await db.select().from(properties);
  const withImg = rows.filter(r => r.image_url && r.image_url.length > 10);
  const withoutImg = rows.filter(r => !r.image_url || r.image_url.length < 10);
  console.log(`Total: ${rows.length}`);
  console.log(`Com imagem: ${withImg.length}`);
  console.log(`Sem imagem: ${withoutImg.length}`);
  
  const bySource: Record<string, { total: number, withImg: number }> = {};
  for (const r of rows) {
    const s = r.sourceName || "unknown";
    if (!bySource[s]) bySource[s] = { total: 0, withImg: 0 };
    bySource[s].total++;
    if (r.image_url && r.image_url.length > 10) bySource[s].withImg++;
  }
  console.log("\nPor fonte:");
  for (const [source, stats] of Object.entries(bySource).sort((a, b) => b[1].total - a[1].total)) {
    const pct = Math.round(stats.withImg/stats.total*100);
    console.log(`  ${s.padEnd(20)}: ${stats.withImg}/${stats.total} (${pct}%)`);
  }
}

main().catch((err) => console.error("Erro:", err));
