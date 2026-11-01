import { chromium } from 'playwright';
import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  const withoutImg = rows.filter(r => !r.image_url || r.image_url.length < 10);
  console.log(`Imóveis sem imagem: ${withoutImg.length}`);

  if (withoutImg.length === 0) {
    console.log("Todos os imóveis já têm imagem.");
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  });

  const browserContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'pt-PT',
    viewport: { width: 1366, height: 768 },
  });

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of withoutImg) {
    if (!row.url || !row.url.startsWith('http')) {
      skipped++;
      continue;
    }

    const page = await browserContext.newPage();
    try {
      await page.goto(row.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      // Tentar og:image primeiro
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);
      if (ogImage && ogImage.startsWith('http')) {
        await db.update(properties).set({ image_url: ogImage, updatedAt: new Date() }).where(eq(properties.id, row.id));
        updated++;
        console.log(`✓ ${row.title}: ${ogImage.substring(0, 80)}...`);
        continue;
      }

      // Tentar primeira imagem com src ou data-src
      const imgElements = await page.$$('img');
      let found = false;
      for (const img of imgs) {
        const src = await img.getAttribute('src') || await img.getAttribute('data-src');
        if (src && src.startsWith('http') && !src.includes('placeholder') && !src.includes('svg')) {
          await db
            .update(properties)
            .set({ image_url: src, updatedAt: new Date() })
            .where(eq(properties.id, row.id));
          updated++;
          console.log(`✓ ${row.title}: ${src.substring(0, 80)}...`);
          found = true;
          break;
        }
      }

      if (!found) {
        skipped++;
      }
    } catch (err: any) {
      failed++;
      console.error(`Erro ${row.url}:`, err.message);
    } finally {
      await page.close();
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
  console.error("Erro fatal:", err);
  process.exit(1);
});
