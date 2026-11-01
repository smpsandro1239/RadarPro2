import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { Curl } from "curl-cffi-node";
import { load } from "cheerio";

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  const withoutImg = rows.filter(r => !r.image_url || r.image_url.length < 10);
  console.log(`Imóveis sem imagem: ${withoutImg.length}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  // Grupos de fontes para processar em ordem de prioridade (quem tem mais imóveis sem imagem primeiro)
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
        // Usar curl-cffi-node com impersonate do Chrome para burlar proteções anti-bot
        const curl = new Curl();
        const response = await new Promise<any>((resolve, reject) => {
          curl.setOpt(Curl.URL, row.url);
          curl.setOpt(CurlOpt.HTTPHEADER, [
            "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language: pt-PT,pt;q=0.9",
            "Referer: https://www.google.com/",
          ]);
          curl.setOpt(CurlOpt.FOLLOWLOCATION, true);
          curl.setOpt(CurlOpt.TIMEOUT, 15000);
          curl.on("end", () => {
            try {
              resolve({
                ok: curl.getInfo(CurlInfo.HTTP_CODE) === 200,
                data: Buffer.from(curl.getBody()),
                status: curl.getInfo(CurlInfo.HTTP_CODE),
              });
            } catch (e) {
              reject(e);
            }
          });
          curl.on("error", (err: any) => {
            reject(err);
          });
          curl.perform();
        });

        if (!res.ok || !res.data) {
          skipped++;
          continue;
        }

        const html = res.data.toString("utf-8");
        const $ = load(html);

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
              if (src && src.startsWith("http") && !src.includes("placeholder")) {
                image_url = src.startsWith("http") ? src : new URL(src, row.url).href;
              }
            }
          });
        }

        if (image_url) {
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
