import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  const withImg = rows.filter(r => r.image_url && r.image_url.length > 10);
  const withImagesArray = rows.filter(r => r.images && r.images.length > 10);
  const withoutImg = rows.filter(r => !r.image_url || r.image_url.length < 10);
  console.log(`Total ativos: ${rows.length}`);
  console.log(`Com image_url: ${withImg.length}`);
  console.log(`Com images array: ${withImagesArray.length}`);
  console.log(`Sem imagem: ${withoutImg.length}`);
  
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
    console.log(`  ${s.padEnd(20)}: ${stats.withImg}/${stats.total} (${pct}%)`);
  }
  
  // Imóveis com images array MAS sem image_url
  const noUrlButHasImages = rows.filter(r => (!r.image_url || r.image_url.length < 10) && r.images && r.images.length > 10);
  console.log(`\nCom images array MAS sem image_url: ${noImageUrlButHasImages.length}`);
  noImageUrlButHasImages.slice(0, 5).forEach(r => console.log(`  ${r.title} | images: ${r.images.substring(0, 80)}`));
  
  console.log("\nAmostra com imagem:");
  withImg.slice(0, 3).forEach(r => console.log(`  ${r.title} | ${r.sourceName} | ${r.image_url.substring(0, 80)}`));
  
  console.log("\nAmostra sem imagem:");
  withoutImg.slice(0, 5).forEach(r => console.log(`  ${r.title} | ${r.sourceName} | ${r.url.substring(0, 80)}`));
}

main().catch((err) => console.error("Erro:", err));
