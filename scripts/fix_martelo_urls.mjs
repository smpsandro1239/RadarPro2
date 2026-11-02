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

const urlUpdates = [
  { id: "mart-lis-1", url: "https://martelo.pt/leilao/NP1212732026.html" },
  { id: "mart-por-1", url: "https://martelo.pt/leilao/LO1449022026.html" },
  { id: "mart-bra-1", url: "https://martelo.pt/leilao/NP1225562026.html" },
];

async function main() {
  for (const update of urlUpdates) {
    await c.execute({
      sql: "UPDATE properties SET url = ? WHERE id = ?",
      args: [update.url, update.id],
    });
  }
  console.log("Updated", urlUpdates.length, "Martelo.pt URLs");

  // Verify
  const sample = await c.execute("SELECT id, title, url FROM properties WHERE source_name = 'Martelo.pt'");
  for (const row of sample.rows) {
    console.log(row[0], "|", row[1], "|", row[2]);
  }
}

main().catch(console.error);
