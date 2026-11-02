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
  { id: "el-lis-1", url: "https://www.e-leiloes.pt/leilao/NP1181932026/" },
  { id: "el-por-1", url: "https://www.e-leiloes.pt/leilao/NP1184922026/" },
  { id: "el-bra-1", url: "https://www.e-leiloes.pt/leilao/NP1193772026/" },
];

async function main() {
  for (const update of urlUpdates) {
    await c.execute({
      sql: "UPDATE properties SET url = ? WHERE id = ?",
      args: [update.url, update.id],
    });
  }
  console.log("Updated", urlUpdates.length, "e-leiloes URLs");

  // Verify all auction properties have specific URLs
  const auctionProps = await c.execute("SELECT id, title, url FROM properties WHERE source = 'leilao'");
  console.log("\nAll auction properties:");
  for (const row of auctionProps.rows) {
    console.log(row[0], "|", row[1], "|", row[2]);
  }
}

main().catch(console.error);
