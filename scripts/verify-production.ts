const BASE = process.argv[2] ?? "https://radar-pro2.vercel.app";
const paths = ["/", "/oportunidades", "/leiloes"];

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