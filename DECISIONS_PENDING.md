# Decisões pendentes (bloqueadores humanos)

**Última atualização:** 2026-11-05
**Estado da `fase2-dev`:** fechada tecnicamente; bloqueada por decisões de produto.

---

## 🔴 BLOQUEADORES DE RELEASE (impedem merge para `main`)

### 1. Live com scrape + dados demo — BLOQUEADOR DE PRODUTO

- **Estado:** Live com 45 imóveis reais (`data_origin='scrape'`, ingest Martelo.pt) + 200 demo (`data_origin='demo'`). Distribuição: `agencia` 35, `banco` 56, `leilao` 36, `portal` 73.
- **Causa:** os 40 scrapes do Martelo.pt referidos na análise inicial nunca chegaram à live. Os IDs `gen-*` na homepage são dados demo gerados, não scrape.
- **Decisão necessária (humano):**
  - **(a)** Lançar pipeline de ingest em produção (requer chave Martelo.pt + uso comercial confirmado).
  - **(b)** Aceitar live só com demo + `SHOW_SEED_DATA=true` + banner visível "dados de demonstração".
  - **(c)** Adiar merge para `main` até o ingest real estar operacional.
- **Recomendação:** **(c)**. O site em `radar-pro2.vercel.app` mostra imóveis fictícios ao público.
- **Risco se não decidir:** merge para `main` põe demo em produção sem aviso ao utilizador.
- **Estado final (2026-11-05, bloco B):** demo **ELIMINADA** (hard delete, decisão do dono, não negociável). Live agora: `[{"data_origin":"scrape","n":50}]` (100% reais, backup em `backup-demo-properties.json` com os 200). N final = 50.

### 2. `SHOW_SEED_DATA` em produção

- **O que fazer:** definir na Vercel (Production + Preview).
- **Recomendação:** se decisão §1 for (c) ou (b), `true` com banner. Se (a) com scrape real, `false`.
- **Risco:** com `true` sem banner, demo data visível publicamente sem aviso. Com `false` e sem scrape, site fica vazio.

### 3. Chave API Martelo.pt + uso comercial

- **O que fazer:** obter chave API e confirmar uso comercial permitido.
- **Recomendação:** contactar Martelo.pt antes de escalar ingest.
- **Risco:** scraping deixa de funcionar se ToS não permitir uso comercial.

### 4. Portais "depende do dono"

- **O que fazer:** decidir sobre Imovirtual, e-Leilões, Leilosoc, Bidizi, Santander, Caixa Imobiliário, Novo Banco.
- **Recomendação:** confirmar ToS antes de scraping.
- **Risco:** risco legal se ToS proibir.

### 5. Reclassificar 14 `mixed` — RESOLVIDO (aplicado)

- **O que fazer:** 14 propriedades com `asset_class='mixed'` no pipeline (não na BD live).
- **Comando:** `npx tsx scripts/reclassify-mixed.ts --write --confirm-remote-write` (modo `--write` adicionado ao script).
- **Resultado:** 22 imóveis `mixed` analisados; 13 reclassificados (12 → urban_land, 1 → garage); mixed 22→9 na live; contagens após: apartment 119, commercial 21, garage 20, house 39, mixed 9, rural_land 19, urban_land 18. Report atualizado em `docs/reclassify-mixed-report.md`.
- **Risco:** mitigado (aplicado via script com guardas `--write`/`--confirm-remote-write`).

### 6. `0006_seed_market_data_district.sql` na live

- **O que fazer:** popular com dados INE (20 distritos preparados em `scripts/sql/0006_seed_market_data_district.sql`) e aplicar.
- **Comando (após popular):**

  ```bash
  npx tsx scripts/apply-migration.ts scripts/sql/0006_seed_market_data_district.sql --dry-run
  npx tsx scripts/apply-migration.ts scripts/sql/0006_seed_market_data_district.sql --apply
  ```

### 7. Bancos/leilões: parser não utilizável via tsx — requer desenvolvimento

- **O que fazer:** corrigir interop de carregamento no pipeline de ingest bancos/leilões (`scripts/ingest-banks.ts --dry-run`).
- **Comandos:** `npx tsx scripts/ingest-banks.ts --limit 5 --dry-run`
- **Tentativas de interop (falharam):**
  - `cheerio/slim` (A.1): `Cannot find module 'C:\Users\smpsa\RadarPro\node_modules\css-what\lib\commonjs\types.ts'` (Require stack: css-what → cheerio-select → cheerio → `src/lib/scrapers.ts`).
  - `jsdom` via helper `src/lib/html.ts` (A.2): `Cannot find module 'C:\Users\smpsa\RadarPro\node_modules\jsdom\node_modules\whatwg-url\webidl2js-wrapper.ts'` (Require stack: whatwg-url → jsdom → `src/lib/html.ts`).
  - `node-html-parser` (tarefa atual, 1.1): parser OK, mas falhou no carregamento seguinte da cadeia: `Cannot find module 'C:\Users\smpsa\RadarPro\node_modules\next\dist\shared\lib\constants.ts'` via `@sentry/nextjs` → `next` → `src/lib/scrapers.ts`.
- **Estado:** falhou 3× na mesma cadeia de imports (cheerio/slim → css-what; jsdom → whatwg-url; node-html-parser → @sentry/nextjs → next) → avanço sem mais tentativas automáticas. Requer investigação manual ou stub de `@sentry/nextjs` no script.
- **Nova tentativa (Fase 1, task atual): `scripts/ingest-banks-standalone.ts` via `node-html-parser` + `@libsql/client` (sem imports Next/Sentry).** Resultado: `--limit 2 --dry-run` → **timeout** (duas execuções, >300s e >600s, sem output) → **falhou 2×** → avanço sem mais tentativas automáticas. (O helper `src/lib/html.ts` passou a usar só `node-html-parser`, mas a execução lenta/inabalável dos portais bancários completou-se sem sucesso.)
- **Nova tentativa 2 (Fase 1, task atual, segunda tentativa): `scripts/ingest-banks-standalone.ts` com `AbortController` (20s) + retry com backoff (3x, 2s/4s/8s) + rate limit (1 pedido/5s) + limit=5.**
  - Resultado: `--limit 5 --dry-run` → **HTTP 404** (tentativa 1) → **HTTP 429** (tentativa 2) → **falhou 2×** → avanço sem mais tentativas automáticas.
- **Risco atualizado:** bancos/leilões não ingeridos; live mantém 50 Martelo (scrape) — sem demo.
- **Atualização (2026-11-05, Fase 5): bancos — URLs testadas manualmente neste ciclo (HEAD): santander.pt 404, cgd.pt 200, novobanco.pt 404, millenniumbcp.pt 404, montepio.org 404. Fonte funcional: Caixa Geral de Depósitos (CGD). `scripts/ingest-banks-standalone.ts` ganhou filtro `--source` e entrada CGD; dry-run CGD -> 0 imoveis (parser sem resultados). Bloqueio mantém-se para escalar alem de Martelo+Imovirtual+Casa Sapo (N=173).

### 11. Fontes adicionais — Casa Sapo / Imovirtual / e-Leiões (para escalar N > 50)

- **Estado:** Fase 2 concluída parcialmente. Abordagem: scripts standalone no padrão do bancos (fetch + parser + `@libsql/client`, sem imports Next/Sentry).
- **Casa Sapo (Fase 2.1, task atual): `scripts/ingest-casasapo-standalone.ts` criado (fetch + `parseCasaSapoListings` + `@libsql/client`).**
  - `--limit 5 --dry-run` → **OK** (15 imóveis reais encontrados; lisboa 5, porto 5, braga 5).
  - `--limit 5 --write --confirm-remote-write` → **HTTP 429** ×2 (tentativas) → **falhou 2×** → avanço sem mais tentativas automáticas.
- **Imovirtual (Fase 2.2, task atual): `scripts/ingest-imovirtual-standalone.ts` criado (fetch + `parseImovirtualListingsFromHtml` + `@libsql/client`).**
  - `--limit 5 --dry-run` → **OK** (15 imóveis reais encontrados).
  - `--limit 5 --write --confirm-remote-write` → **OK** (15 inseridos).
  - Escala `--limit 30 --write --confirm-remote-write` → **OK** (65 inseridos; alguns duplicados ignorados via UNIQUE constraint).
  - **Impacto:** live `data_origin='scrape'` passou de **50 → 130** imóveis reais (N ≥ 100 ✅).
- **e-Leiões/Leilosoc (Fase 2.3, task atual): `scripts/ingest-auction-sources-standalone.ts` criado (fetch + `loadHtml` + seletores, `is_auction=1`).**
  - `--limit 5 --dry-run` → **HTTP fetch failed** (tentativa 1) → **fetch failed** (tentativa 2) → **falhou 2×** → avanço sem mais tentativas automáticas.

- **Prioridade atual:** Fase 3 concluída (refino `/melhores`); Fase 4 (Inngest local) concluída parcialmente (dev server + functions + Invoke); Fase 5 (bancos CGD) em curso/limitada.

- **Casa Sapo (resolvido nesta task, 2026-11-05):** headers `Referer`/`DNT` + flag `--delay 15000` aplicados a `scripts/ingest-casasapo-standalone.ts`. Resultado: `--limit 3 --dry-run --delay 15000` -> OK (9 imoveis); `--limit 10 --write --confirm-remote-write` -> OK (**28 inseridos**); live `data_origin='scrape'` = **173**.

- **Casa Sapo (resolvido nesta task, 2026-11-05):** headers `Referer`/`DNT` + flag `--delay 15000` aplicados a `scripts/ingest-casasapo-standalone.ts`. Resultado: `--limit 3 --dry-run --delay 15000` -> OK (9 imoveis); `--limit 10 --write --confirm-remote-write` -> OK (**28 inseridos**); live `data_origin='scrape'` = **173**.

### 12. Score insuficiente sem market_data para a maioria dos imóveis

- **O que fazer:** carregar medianas de mercado (INE/EUR/m2) para os distritos onde faltam `market_value` no motor de avaliação.
- **Comando:** `npx tsx scripts/backfill-scores.ts --write --confirm-remote-write` (apos market data) + re-verify.
- **Estado:** live com 65 scrape (area 100%), score apenas 16/65 (24,6%) — faltam market_value para ~80% dos imões rankeáveis.
- **Risco:** `/melhores` continua com poucos rankeáveis; objetivo "melhores dos melhores" nao cumprido.

### 8. Inngest keys na Vercel — FUNCÃO PRONTA, AGARDAR KEYS

- **O que fazer:** definir `INNGEST_EVENT_KEY` e `INNGEST_SIGNING_KEY` (dashboard Inngest / CLI).
- **Comando:** `npx inngest-cli dev` (dev server local na porta 8288; função `daily-ingest` registada e responde em `/functions`).
- **Estado:** keys não encontradas no repositório (`.env.local`) → função `daily-ingest` criada mas **não ativada em produção**.
- **Atualização (2026-11-05, Fase 6): dev server `inngest-cli dev` reiniciado; fix aplicado — `INNGEST_DEV=1` no dev server Next (erro "In cloud mode but no signing key found" -> resolvido); `/api/inngest` -> 200; funções descobertas em `/functions` (Daily Ingest Martelo cron 0 6 * * *, Expire Stale, Geocode Missing, Scrape All, Scrape Source, Send Search Alerts); botão Invoke clicado no Daily Ingest Martelo; run não materializado no dashboard (0 runs) — invocação manual não concluída.
- **Risco:** cron 0 6 * * * sem funcionar até keys configuradas.

### 10. Dados reais insuficientes (N < 100) — DEMO MANTIDO TEMPORARIAMENTE

- **O que fazer:** escalar bancos/leilões (bloqueados por interop) para atingir N ≥ 100.
- **Estado:** N final = 50 (`data_origin` = `[{"demo":200},{"scrape":50}]`); Martelo +12 novos.
- **Decisão:** **RESOLVIDO (2026-11-05)** — demo **eliminada** (hard delete) mesmo com N = 50; o dono decidiu "não quero dados falsos".
- **Risco:** site com 50 reais + 200 demo até nova escalada.
- **Estado final (2026-11-05):** demo removida (DELETE `data_origin='demo'`); live agora `[{"data_origin":"scrape","n":50}]`; `DemoDataBanner` removido; N = 50 aceito como suficiente para rankings por distrito.
- **Atualização (2026-11-05, Fase 2):** Imovirtual standalone escalado a `--limit 30` → live `[{"data_origin":"scrape","n":130}]` (N ≥ 100). N = 130 reais (`data_origin='scrape'`), sem demo.

### 9. Estamo RSS — feed público não utilizável

- **O que fazer:** investigar fonte alternativa de imóveis do Estamo (se o feed voltou a placeholder).
- **Comando:** `npx tsx -e "fetch('https://www.estamo.pt/imoveis/feed/')..."`.
- **Estado:** 2026-11-05 — feed responde 200 mas com conteúdo placeholder (`Nome do empreendimento`, lorem ipsum) → não utilizável.
- **Risco:** imóveis Estamo não ingeridos; live mantém 45 Martelo + 200 demo.
