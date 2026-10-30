import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { indexProperties, ensureTypesenseSchema } from "@/lib/typesense";
import { isTypesenseConfigured } from "@/lib/search-config";

async function main() {
  if (!isTypesenseConfigured()) {
    console.info(
      "Typesense não configurado — nada a indexar. " +
        "A busca continuará a usar a BD (Turso) como fonte primária. " +
        "Para ativar Typesense, defina TYPESENSE_HOST e TYPESENSE_API_KEY no .env.local."
    );
    process.exit(0);
  }

  await ensureTypesenseSchema();

  const activeProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.isActive, true));

  const documents = activeProperties.map((prop) => ({
    id: prop.id,
    source: prop.source,
    source_name: prop.sourceName,
    url: prop.url,
    title: prop.title,
    district: prop.district,
    municipality: prop.municipality,
    type: prop.type,
    price: Math.round(prop.price),
    market_value: prop.marketValue ? Math.round(prop.marketValue) : null,
    discount_pct: prop.discountPct ? Math.round(prop.discountPct) : null,
    score: prop.score ?? 0,
    rentability: prop.rentability,
    is_auction: Boolean(prop.isAuction),
    is_active: Boolean(prop.isActive),
    created_at: Math.floor(new Date(prop.createdAt ?? new Date()).getTime() / 1000),
    updated_at: Math.floor(new Date(prop.updatedAt ?? new Date()).getTime() / 1000),
  }));

  const result = await indexProperties(documents);

  if (result.error) {
    console.error("Erro ao indexar propriedades no Typesense:", result.error);
    process.exit(1);
  }

  console.log(`Indexadas ${result.indexed} propriedades no Typesense`);
}

main().catch((err) => {
  console.error("Erro inesperado na indexação Typesense:", err);
  process.exit(1);
});
