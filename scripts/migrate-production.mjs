import { createClient } from "@libsql/client";

const isVercelProduction =
  process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

if (!isVercelProduction) {
  console.log("[db:migrate] Ignorada: só é executada em deployments Vercel de produção.");
  process.exit(0);
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    "[db:migrate] TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórias no ambiente Production da Vercel."
  );
}

const client = createClient({ url, authToken });

const requiredColumns = [
  ["usable_area_sqm", "REAL"],
  ["gross_area_sqm", "REAL"],
  ["land_area_sqm", "REAL"],
];

try {
  const tableInfo = await client.execute("PRAGMA table_info(properties)");
  const existingColumns = new Set(
    tableInfo.rows.map((row) => String(row.name))
  );

  if (existingColumns.size === 0) {
    throw new Error(
      "[db:migrate] A tabela 'properties' não existe ou não tem colunas. Não foi feita qualquer alteração."
    );
  }

  for (const [columnName, columnType] of requiredColumns) {
    if (existingColumns.has(columnName)) {
      console.log(`[db:migrate] OK: ${columnName} já existe.`);
      continue;
    }

    await client.execute(
      `ALTER TABLE properties ADD COLUMN ${columnName} ${columnType}`
    );
    console.log(`[db:migrate] Criada a coluna ${columnName}.`);
  }

  console.log("[db:migrate] Migração concluída.");
} finally {
  client.close();
}
