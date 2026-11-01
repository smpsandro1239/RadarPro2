import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";

const exec = promisify(require("child_process").exec);

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  const withoutImg = rows.filter(r => !r.image_url || r.image_url.length < 10);
  console.log(`Imóveis sem imagem: ${withoutImg.length}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  // Grupos de fontes para processar em ordem de prioridade
  const prioritySources = ["Casa Sapo", "Imovirtual", "Bidizi", "Idealista", "OLX", "Martelo.pt", "RE/MAX", "Century 21", "KW Portugal", "e-Leilões", "SuperCasa", "BPI Expresso"];

  for (const source of prioritySources) {
    const rowsOfSource = withoutImg.filter((r: any) => r.sourceName === source);
    if (rowsOfSource.length === 0) continue;

    console.log(`\nProcessando ${rowsOfSource.length} imóveis de ${source}...`);

    for (const row of rowsOfSource) {
      if (!row.url || !row.url.startsWith("http")) {
        skipped++;
        continue;
      }

      try {
        // Usar curl com headers de navegador para burlar proteções anti-bot
        const { stdout, stderr } = await exec(
          `curl -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" -H "Accept-Language: pt-PT,pt;q=0.9" -H "Referer: https://www.google.com/" -o /tmp/curl_image.html "${row.url}"`,
          { timeout: 15000 }
        );

        if (stderr.includes("403") || stderr.includes("429") || stderr.includes("401")) {
          skipped++;
          continue;
        }

        // Procurar og:image no HTML
        const html = stdout.toString();
        const ogImageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"'\s>]+)/i);
        if (ogImage) {
          const imageUrl = ogImage[1];
          await db
            .update(properties)
            .set({ image_url: image_url, updatedAt: new Date() })
            .where(eq(properties.id, row.id));
          updated++;
          console.log(`✓ ${row.title}: ${image_url.substring(0, 80)}...`);
          continue;
        }

        // Se não tiver og:image, tentar primeira imagem com src
        const imgMatch = html.match(/<img[^>]+src=["\']([^"'\s>]+)/i);
        if (imgMatch && imgMatch[1] && imgMatch[1].startsWith("http")) {
          const image_url = imgMatch[1].startsWith("http") ? imgMatch[1] : new URL(imgMatch[1], row.url).href;
          await db
            .update(properties)
            .set({ image_url, updatedAt: new Date() })
            .where(eq(properties.id, row.id));
          updated++;
          console.log(`✓ ${row.title}: ${image_url.substring(0, 80)}...`);
        } else {
          skipped++;
        }
      } catch (err: any) {
        failed++;
        console.error(`Erro ${row.url}:`, err.message);
      }
    }
  }

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
