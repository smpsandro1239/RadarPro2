import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq, isNull, or } from "drizzle-orm";
import { chromium } from "playwright";

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  const withoutImg = rows.filter(r => !r.image_url || r.image_url.length < 10);
  console.log(`Imóveis sem imagem: ${withoutImg.length}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  const browser = await chromium.launch({ headless: true });

  for (const row of withoutImg) {
    if (!row.url || !row.url.startsWith("http")) {
      skipped++;
      continue;
    }

    try {
      const page = await browser.newPage();
      const result = await page.goto(row.url, { waitUntil: "domcontentloaded", timeout: 15000 });
      if (!result || !result.ok()) {
        await page.close();
        skipped++;
        continue;
      }

      await page.waitForTimeout(2000);

      let imageUrl: string | null = null;
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
      if (ogImage) imageUrl = ogImage.startsWith("http") ? ogImage : new URL(ogImage, row.url).href;

      if (!imageUrl) {
        const images = await page.$$eval("img", imgs => imgs.map(i => i.src || i.getAttribute("data-src")).filter(Boolean) as string[]);
        const validImg = images.find(s => s.startsWith("http") && !s.includes("placeholder") && !s.includes("svg"));
        if (validImg) imageUrl = validImg.startsWith("http") ? validImg : new URL(validImg, row.url).href;
      }

      if (imageUrl) {
        await db.update(properties).set({ image_url: imageUrl, updatedAt: new Date() }).where(eq(properties.id, row.id));
        updated++;
        console.log(`✓ ${row.title}: ${imageUrl.substring(0, 80)}...`);
      } else {
        skipped++;
      }
      await page.close();
    } catch (err: any) {
      failed++;
      console.error(`Erro ${row.url}:`, err.message);
    }
  }

  await browser.close();

  console.log(`\nResultado:`);
  console.log(`  Total sem imagem: ${withoutImg.length}`);
  console.log(`  Atualizados: ${updated}`);
  console.log(`  Sem imagem encontrada: ${skipped}`);
  console.log(`  Erros: ${failed}`);
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
