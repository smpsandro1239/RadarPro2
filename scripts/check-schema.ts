import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN ?? "";
const client = createClient({ url, authToken });

const expected = ["parish", "area_sqm", "data_origin", "opening_bid", "auction_end_date"];

async function main() {
  const res = await client.execute("PRAGMA table_info(properties)");
  const cols = res.rows.map((r) => String(r.name));
  const missing = expected.filter((c) => !cols.includes(c));
  if (missing.length > 0) {
    console.error("Schema desalinhado. Colunas em falta:", missing.join(", "));
    console.error("Aplica as migracoes (ver docs/migrations.md).");
    process.exit(1);
  }
  console.log("Schema OK: todas as colunas esperadas existem.");
}

main().catch((e) => { console.error(e); process.exit(1); });