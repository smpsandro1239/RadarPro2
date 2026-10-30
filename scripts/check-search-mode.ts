import { isTypesenseConfigured, getSearchModeLabel } from "@/lib/search-config";

async function main() {
  const configured = isTypesenseConfigured();

  console.log("=== Modo de busca RadarPro ===");
  console.log(`Typesense configurado: ${configured ? "sim" : "não"}`);
  console.log(`Modo ativo: ${getSearchModeLabel(configured ? "typesense" : "db-primary")}`);
  console.log(
    `Env vars presentes: TYPESENSE_HOST=${!!process.env.TYPESENSE_HOST}, TYPESENSE_API_KEY=${!!process.env.TYPESENSE_API_KEY}`
  );

  if (configured) {
    console.log("\nPara indexar: npx tsx --env-file=.env.local scripts/index-typesense.ts");
  } else {
    console.log("\nA busca está a usar a BD (Turso) como fonte primária. Funciona sem Typesense.");
  }
}

main().catch((err) => {
  console.error("Erro ao verificar modo de busca:", err);
  process.exit(1);
});
