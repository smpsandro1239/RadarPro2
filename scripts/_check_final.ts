import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  console.log(`Total ativos: ${rows.length}`);
  const withImage = rows.filter(r => r.imageUrl && r.imageUrl.length > 10);
  console.log(`Com imageUrl: ${withImage.length}`);
  console.log(`Sem imageUrl: ${rows.length - withImage.length}`);
  
  const sources = new Set(rows.map(r => r.sourceName).filter(Boolean));
  console.log(`Fontes distintas: ${sources.length}`);
  console.log(`Fontes:`, JSON.stringify([...sources].sort()));
}

main().catch((err) => console.error("Erro:", err));