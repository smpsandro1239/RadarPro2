import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  const withImg = rows.filter(r => r.image_url && r.image_url.length > 10);
  const withoutImg = rows.filter(r => !r.image_url || r.image_url.length < 10);
  console.log(`Total ativos: ${rows.length}`);
  console.log(`Com imagem: ${withImg.length} (${Math.round(withImg.length/rows.length*100)}%)`);
  console.log(`Sem imagem: ${withoutImg.length} (${Math.round(withoutImg.length/rows.length*100)}%)`);
  
  const bySource: Record<string, { total: number, withImg: number }> = {};
  for (const r of rows) {
    const s = r.sourceName || "unknown";
    if (!bySource[s]) bySource[s] = { total: 0, withImg: 0 };
    bySource[s].total++;
    if (r.image_url && r.image_url.length > 10) bySource[s].withImg++;
  }
  
  console.log("\nPor fonte:");
  for (const [source, stats] of Object.entries(bySource).sort((a, b) => b[1].total - b[1].total)) {
    const pct = Math.round(stats.withImg/stats.total*100);
    console.log(`  ${source.padEnd(20)}: ${stats.withImg}/${stats.total} (${pct}%)`);
  }
  
  console.log("\nExemplos com imagem:");
  withImg.slice(0, 5).forEach(r => console.log(`  ${r.title} | ${r.sourceName} | ${r.image_url.substring(0, 80)}`));
  
  console.log("\nExemplos sem imagem:");
  withoutImg.slice(0, 5).forEach(r => console.log(`  ${r.title} | ${r.sourceName} | ${r.url.substring(0, 80)}`));
}

main().catch((err) => console.error("Erro:", err));
