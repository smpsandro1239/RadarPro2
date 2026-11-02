import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { evaluateProperty } from "../src/lib/valuation/index";

function toIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db.select().from(properties).where(eq(properties.isActive, true));
  console.log(`Total de imóveis ativos: ${rows.length}`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const property: any = {
        id: row.id,
        title: row.title,
        district: row.district,
        municipality: row.municipality,
        sourceName: row.sourceName,
        source: row.source,
        type: row.type,
        price: row.price,
        marketValue: row.marketValue,
        discountPct: row.discountPct,
        rentability: row.rentability,
        sqm: null, // campo de área não existe no schema
        isAuction: row.isAuction === true,
        auctionType: row.auctionType,
        auctionHouse: row.auctionHouse,
        currentBid: row.currentBid ?? (row.isAuction ? row.price : null),
        maxBid: row.maxBid ?? null,
        vpt: row.vpt,
        condominiumDebt: row.condominiumDebt ?? 0,
        renovationEstimate: row.renovationEstimate ?? 0,
        asset_class: row.assetClass,
        valuation_engine: row.valuationEngine,
        valuation_confidence: row.valuationConfidence,
        pdm_status: row.pdmStatus,
        infrastructure: row.infrastructure,
        annualIncome: row.annualIncome,
        createdAt: toIso(row.createdAt),
        isActive: row.isActive,
        checkStatus: row.checkStatus,
      };

      try {
        const result = evaluateProperty(property);

        // Sem avaliacao nao ha score para gravar: nao inventar nem reescrever o valor atual.
        if (result.score === null) {
          skipped++;
          continue;
        }

        await db
          .update(properties)
          .set({ marketValue: result.valuation, score: result.score, updatedAt: new Date() })
          .where(eq(properties.id, row.id));
        updated++;
      } catch (err: any) {
        console.error(`Erro ${row.id}:`, err.message);
        errors++;
      }
    } catch (err: any) {
      console.error(`Erro geral ${row.id}:`, err.message);
      errors++;
    }
  }

  console.log(`\nResultado:`);
  console.log(`  Total: ${rows.length}`);
  console.log(`  Atualizados: ${updated}`);
  console.log(`  Sem avaliação (score null): ${skipped}`);
  console.log(`  Erros: ${errors}`);
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
