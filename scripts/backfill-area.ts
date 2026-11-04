import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";
import { typeSizeEstimates } from "../src/lib/scoring";

async function main() {
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  const withoutArea = rows.filter((r) => r.areaSqm == null);
  console.log(`Imóveis sem área: ${withoutArea.length}`);

  let updated = 0;
  for (const row of withoutArea) {
    const est = typeSizeEstimates[row.type ?? ""] ?? typeSizeEstimates[row.type?.split(" ")[0] ?? ""] ?? null;
    if (est == null) {
      console.log(`  skip ${row.id} (sem estimativa para tipo "${row.type}")`);
      continue;
    }
    await db.update(properties).set({ areaSqm: est, updatedAt: new Date() }).where(eq(properties.id, row.id));
    updated++;
  }
  console.log(`Atualizados: ${updated}`);
}

main().catch((e) => { console.error(e); process.exit(1); });