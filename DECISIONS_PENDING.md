# Decisões pendentes (bloqueadores humanos)

**Última atualização:** 2026-11-05
**Estado da `fase2-dev`:** fechada tecnicamente; bloqueada por decisões de produto.

---

## 🔴 BLOQUEADORES DE RELEASE (impedem merge para `main`)

### 1. Live apenas com dados demo — BLOQUEADOR DE PRODUTO

- **Estado:** 200/200 propriedades com `data_origin='demo'`. Distribuição: `agencia` 35, `banco` 56, `leilao` 36, `portal` 73.
- **Causa:** os 40 scrapes do Martelo.pt referidos na análise inicial nunca chegaram à live. Os IDs `gen-*` na homepage são dados demo gerados, não scrape.
- **Decisão necessária (humano):**
  - **(a)** Lançar pipeline de ingest em produção (requer chave Martelo.pt + uso comercial confirmado).
  - **(b)** Aceitar live só com demo + `SHOW_SEED_DATA=true` + banner visível "dados de demonstração".
  - **(c)** Adiar merge para `main` até o ingest real estar operacional.
- **Recomendação:** **(c)**. O site em `radar-pro2.vercel.app` mostra imóveis fictícios ao público.
- **Risco se não decidir:** merge para `main` põe demo em produção sem aviso ao utilizador.

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

### 5. Reclassificar 14 `mixed`

- **O que fazer:** 14 propriedades com `asset_class='mixed'` no pipeline (não na BD live).
- **Comando:** correr worker de classificação com `classify.ts` melhorado.
- **Risco:** 14/200 = 7% do feed sem avaliação por design.

### 6. `0006_seed_market_data_district.sql` na live

- **O que fazer:** popular com dados INE (20 distritos preparados em `scripts/sql/0006_seed_market_data_district.sql`) e aplicar.
- **Comando (após popular):**
  ```bash
  npx tsx scripts/apply-migration.ts scripts/sql/0006_seed_market_data_district.sql --dry-run
  npx tsx scripts/apply-migration.ts scripts/sql/0006_seed_market_data_district.sql --apply
