const BASE = process.argv[2] ?? "https://radar-pro2.vercel.app";
const paths = ["/", "/oportunidades", "/leiloes", "/melhores", "/baixaram"];

/**
 * `/leiloes` so existe na branch `fase2-dev`. A producao (`main`) devolve 404
 * ate ser feito o merge. Sempre verificar com URL de preview da fase2-dev.
 */
if (!process.argv[2]) {
  console.warn(
    "[AVISO] Nenhum URL fornecido. A producao (main) devolve 404 em /leiloes.\n" +
      "Use: npx tsx scripts/verify-production.ts https://<preview-url-fase2-dev>"
  );
}

async function check(path: string) {
  try {
    const res = await fetch(BASE + path);
    return { path, status: res.status, ok: res.ok };
  } catch (e) {
    return { path, status: 0, ok: false, error: String(e) };
  }
}

async function main() {
  console.log(`Verificando ${BASE}...`);
  const results = await Promise.all(paths.map(check));
  for (const r of results) {
    console.log(`${r.ok ? "OK" : "FAIL"} ${r.path} -> ${r.status}${r.error ? " " + r.error : ""}`);
  }
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} rota(s) falharam.`);
    process.exit(1);
  }
  console.log("\nTodas as rotas OK.");
}

main().catch((e) => { console.error(e); process.exit(1); });