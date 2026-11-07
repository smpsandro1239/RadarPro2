import { db } from "../src/db/index";
import { properties } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { evaluateProperty } from "../src/lib/valuation/index";

/* Dry-run por omissão. Escrita requer --apply, ALLOW_DATABASE_BACKFILL=1 e BD local file:. */
async function main() {
 const apply=process.argv.includes("--apply"), url=process.env.TURSO_DATABASE_URL??"";
 if(apply&&process.env.ALLOW_DATABASE_BACKFILL!=="1")throw new Error("Define ALLOW_DATABASE_BACKFILL=1.");
 if(apply&&!url.startsWith("file:"))throw new Error("Backfill bloqueado: apenas BD local file:.");
 const rows=await db.select().from(properties).where(eq(properties.isActive,true));
 let eligible=0,skipped=0;
 for(const row of rows){
  const result=evaluateProperty({...row,assetClass:row.assetClass??"unknown",valuationConfidence:row.valuationConfidence??"low",isAuction:row.isAuction===true,currentBid:row.currentBid??0,marketValue:row.marketValue,price:row.price});
  if(result.confidence==="very_low"||result.valuation===null){skipped++;continue;}
  eligible++;
  if(apply)await db.update(properties).set({score:result.score,marketValue:row.isAuction?row.marketValue:result.valuation,maxBid:row.isAuction?Number(result.breakdown.maxBid??0)||null:row.maxBid,valuationEngine:result.engine,valuationConfidence:result.confidence,updatedAt:new Date()}).where(eq(properties.id,row.id));
 }
 console.log(JSON.stringify({mode:apply?"APPLY_LOCAL":"DRY_RUN",total:rows.length,eligible,skipped},null,2));
}
main().catch(e=>{console.error("Backfill interrompido:",e);process.exitCode=1;});
