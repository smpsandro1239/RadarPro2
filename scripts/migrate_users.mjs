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
  try {
    await c.execute("ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''");
    console.log("Column added");
  } catch (e) {
    console.log("Column may already exist:", e.message);
  }
  const r = await c.execute("PRAGMA table_info(users)");
  console.log(JSON.stringify(r.rows));
})();
