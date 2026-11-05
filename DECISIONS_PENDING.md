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
- **Estado final (2026-11-05, bloco A):** live com 45 imóveis reais + 200 demo; N final = 45 (`data_origin` = `[{"demo":200},{"scrape":45}]`).

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
- **Estado:** falhou 2× → avanço para o bloco B sem mais tentativas. Requer investigação manual ou versão pinned (`cheerio@1.0.0-rc.12`).
- **Risco:** bancos/leilões não ingeridos; live mantém 45 Martelo + 200 demo.

### 8. Inngest keys na Vercel — FUNCÃO PRONTA, AGARDAR KEYS

- **O que fazer:** definir `INNGEST_EVENT_KEY` e `INNGEST_SIGNING_KEY` (dashboard Inngest / CLI).
- **Comando:** `npx inngest-cli dev` (dev server local na porta 8288; função `daily-ingest` registada e responde em `/functions`).
- **Estado:** keys não encontradas no repositório (`.env.local`) → função `daily-ingest` criada mas **não ativada em produção**.
- **Risco:** cron 0 6 * * * sem funcionar até keys configuradas.

### 9. Estamo RSS — feed público não utilizável

- **O que fazer:** investigar fonte alternativa de imóveis do Estamo (se o feed voltou a placeholder).
- **Comando:** `npx tsx -e "fetch('https://www.estamo.pt/imoveis/feed/')..."`.
- **Estado:** 2026-11-05 — feed responde 200 mas com conteúdo placeholder (`Nome do empreendimento`, lorem ipsum) → não utilizável.
- **Risco:** imóveis Estamo não ingeridos; live mantém 45 Martelo + 200 demo.
