import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  console.log(`Total de imóveis ativos: ${rows.length}`);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    // Se já tem image_url, pular
    if (row.image_url && row.image_url.length > 10) continue;

    // Se tem images array, usar a primeira imagem
    if (row.images && typeof row.images === "string") {
      try {
        const images = JSON.parse(row.images);
        if (images && images.length > 0 && images[0].startsWith("http")) {
          await db
            .update(properties)
            .set({ image_url: images[0], updatedAt: new Date() })
            .where(eq(properties.id, row.id));
          updated++;
          continue;
        }
      } catch (e) {
        // ignorar erros de parse
      }
    }

    skipped++;
  }

  console.log(`\nResultado:`);
  console.log(`  Total ativos: ${rows.length}`);
  console.log(`  Atualizados com image_url: ${updated}`);
  console.log(`  Sem imagem (sem array ou sem URL válida): ${skipped}`);
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
