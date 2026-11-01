import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { createClient } from "@libsql/client";

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  console.log(`Total de imóveis ativos: ${rows.length}`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    if (!row.url || !row.url.startsWith("http")) {
      skipped++;
      continue;
    }

    try {
      const res = await fetch(row.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-PT,pt;q=0.9",
        },
      });

      if (!res.ok) {
        console.warn(`Falhou ${row.url}: ${res.status}`);
        errors++;
        continue;
      }

      const html = await res.text();
      const cheerio = (await import("cheerio")).load;
      const $ = cheerio(html);

      let image_url: string | null = null;

      // Tentar og:image primeiro
      const ogImage = $('meta[property="og:image"]').attr("content");
      if (ogImage) {
        image_url = ogImage.startsWith("http") ? ogImage : new URL(ogImage, row.url).href;
      }

      // Se não tiver og:image, tentar primeira imagem com src
      if (!image_url) {
        $("img").each((_, img) => {
          if (!image_url) {
            const src = $(img).attr("src") || $(img).attr("data-src");
            if (src && src.startsWith("http") && !src.includes("placeholder") && !src.includes("svg")) {
              image_url = src.startsWith("http") ? src : new URL(src, row.url).href;
            }
          }
        });
      }

      if (image_url) {
        await db
          .update(properties)
          .set({ image_url, image_status: "real", updatedAt: new Date() })
          .where(eq(properties.id, row.id));
        updated++;
        console.log(`✓ ${row.title}: ${image_url.substring(0, 80)}...`);
      } else {
        skipped++;
      }
    } catch (err: unknown) {
      console.error(`Erro ${row.url}:`, (err as Error).message);
      errors++;
    }
  }

  console.log(`\nResultado:`);
  console.log(`  Total: ${rows.length}`);
  console.log(`  Atualizados: ${updated}`);
  console.log(`  Sem imagem encontrada: ${skipped}`);
  console.log(`  Erros: ${errors}`);
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
