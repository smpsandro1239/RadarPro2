import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { calculateMaxBid } from "../src/lib/auction-calculator";
import { evaluateProperty } from "../src/lib/valuation/index";

async function main() {
  console.log("A ler imóveis ativos da BD...");
  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.isActive, true));

  console.log(`Total de imóveis ativos: ${rows.length}\n`);

  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      let newScore: number | null = null;
      let newMarketValue: number | null = null;

      if (row.isAuction === true) {
        // Leilão: usar calculateMaxBid
        const result = calculateMaxBid({
          marketValue: row.marketValue ?? 0,
          currentBid: row.currentBid ?? 0,
          auctionHouse: row.auctionHouse ?? undefined,
          vpt: row.vpt ?? undefined,
          condominiumDebt: row.condominiumDebt ?? 0,
          renovationEstimate: row.renovationEstimate ?? 0,
          targetMargin: 15,
        });
        newScore = result.maxBid > 0 ? result.maxBid : null;
        newMarketValue = result.marketValue;
      } else {
        // Preço fixo: usar evaluateProperty (AVM hedónico)
        const result = evaluateProperty({
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
          rentability: row.rentability ?? 0,
          sqm: null,
          isAuction: Boolean(row.isAuction),
          auctionType: row.auctionType ?? undefined,
          auctionHouse: row.auctionHouse ?? undefined,
          currentBid: row.currentBid ?? 0,
          maxBid: row.maxBid ?? null,
          vpt: row.vpt ?? undefined,
          condominiumDebt: row.condominiumDebt ?? 0,
          renovationEstimate: row.renovationEstimate ?? 0,
          asset_class: row.assetClass ?? undefined,
          valuation_engine: row.valuationEngine ?? undefined,
          valuation_confidence: row.valuationConfidence ?? undefined,
          pdm_status: row.pdmStatus ?? undefined,
          infrastructure: row.infrastructure ?? undefined,
          annualIncome: row.annualIncome ?? undefined,
          is_auction: Boolean(row.isAuction),
        });
        newScore = result.score;
        newMarketValue = result.valuation;
      }

      // Só atualizar se mudou
      if (newScore !== null && (newScore !== row.score || newMarketValue !== row.marketValue)) {
        await db
          .update(properties)
          .set({ score: newScore, marketValue: newMarketValue, updatedAt: new Date() })
          .where(eq(properties.id, row.id));
        updated++;
      } else {
        unchanged++;
      }
    } catch (err) {
      console.error(`Erro a processar ${row.id} (${row.title}):`, err);
      skipped++;
    }
  }

  console.log(`\nResultado do backfill:`);
  console.log(`  Total imóveis: ${rows.length}`);
  console.log(`  Scores atualizados: ${updated}`);
  console.log(`  Inalterados: ${unchanged}`);
  console.log(`  Erros: ${skipped}`);
}

main().catch((err) => {
  console.error("Erro no backfill:", err);
  process.exit(1);
});
