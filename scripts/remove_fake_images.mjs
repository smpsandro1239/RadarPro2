import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

async function main() {
  // Get all properties
  const props = await c.execute("SELECT id, images FROM properties");
  let updated = 0;

  for (const row of props.rows) {
    const id = row[0];
    const images = row[1];
    
    if (!images) continue;
    
    try {
      const parsed = JSON.parse(images);
      if (!Array.isArray(parsed) || parsed.length === 0) continue;
      
      // Check if any image is from Unsplash (fake)
      const hasUnsplash = parsed.some(function(img) { return img.includes("unsplash.com"); });
      
      if (hasUnsplash) {
        // Remove fake images - set to empty array
        await c.execute({
          sql: "UPDATE properties SET images = '[]' WHERE id = ?",
          args: [id],
        });
        updated++;
      }
    } catch (e) {
      // Skip
    }
  }

  console.log(`Updated ${updated} properties (removed fake Unsplash images)`);

  // Count properties with real images vs without
  const withImages = await c.execute("SELECT COUNT(*) FROM properties WHERE images != '[]' AND images IS NOT NULL");
  const withoutImages = await c.execute("SELECT COUNT(*) FROM properties WHERE images = '[]' OR images IS NULL");
  console.log(`Properties with real images: ${withImages.rows[0][0]}`);
  console.log(`Properties without images: ${withoutImages.rows[0][0]}`);
}

main().catch(console.error);
