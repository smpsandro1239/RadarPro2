import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  const envFile = existsSync(".env.local") ? ".env.local" : ".env";
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error(
    "Faltam TURSO_DATABASE_URL e/ou TURSO_AUTH_TOKEN. Define-os no ambiente (ou em .env.local na raiz do repo) e volta a correr.",
  );
  process.exit(1);
}


const c = createClient({ url, authToken });

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
