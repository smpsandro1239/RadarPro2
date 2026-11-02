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

(async () => {
  const columns = [
    "ALTER TABLE properties ADD COLUMN image_url TEXT",
    "ALTER TABLE properties ADD COLUMN image_source TEXT",
    "ALTER TABLE properties ADD COLUMN image_status TEXT DEFAULT 'missing'",
  ];

  for (const sql of columns) {
    try {
      await c.execute(sql);
      console.log("OK:", sql);
    } catch (e) {
      console.log("Skip (may already exist):", e.message);
    }
  }

  const r = await c.execute("SELECT id, image_url, image_status FROM properties LIMIT 3");
  console.log("Sample:", JSON.stringify(r.rows));
})();
