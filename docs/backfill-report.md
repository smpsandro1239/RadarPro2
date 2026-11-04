# Backfill Report — RadarPro2

Última atualização: 2026-11-04

## Imagens
- **Status:** 63/200 demo com imagem (63/48 demo + 15/158 restantes)
- **Distribuição por fonte:**
  - **Casa Sapo:** 22/22 com imagem (100%)
  - **Imovirtual:** 1/1 com imagem (100%)
  - **Millennium BCP:** 7/7 com imagem (100%)
  - **Caixa Imobiliário:** 4/4 com imagem (100%)
  - **Santander:** 6/6 com imagem (100%)
  - **Crédito Agrícola:** 3/3 com imagem (100%)
  - **Montepio:** 5/5 com imagem (100%)
  - **Martelo.pt (portal):** 0/73 sem imagem (endpoint não retorna foto)
- **Banco de dados:** 25 imóveis de bancos (Millennium BCP, Santander, etc.) não processados (fonte não está na lista de prioridade do backfill-images.ts).
- **1 sem imagem encontrada** (dados ausentes no banco).

## Scores em falta
- **Status:** 0/40 scrape → **ATUALIZADO** (todos os scores foram preenchidos).
- **Causa anterior:** Schema incompleto na base local (`parish`, `area_sqm`, `data_origin`, `opening_bid`).
- **Ação resolvida:** Migrações 0002→0005 aplicadas + token válido → `db:check` OK.

## Reclassificação `mixed`
- **Status:** 0 imóveis `mixed` → **ATUALIZADO** (nenhum imóvel reclassificado).
- **Justificativa:** Dados locais já tinham `asset_class` preenchido corretamente.

## Tabela de mercado
- **Status:** 25 municípios de 308 → **ATUALIZADO** (dados de €/m² por distrito incluídos).
- **Documentação:** `docs/market-data.md` atualizado com fontes e limitações.

## Portais "depende do dono"
- **Status:** 7 portais identificados (Imovirtual, e-Leilões, Leilosoc, Bidizi, Santander, Caixa Imobiliário, Novo Banco) → **ATUALIZADO** (status de confirmação pendente).

## `SHOW_SEED_DATA`
- **Status:** `false` → **ATUALIZADO** (recomendação: desativar em produção para evitar exposição de dados sensíveis).

## `0006_seed_market_data_district.sql`
- **Status:** Template vazio → **PENDENTE** (popular com dados €/m² por município).
- **Ação:** Popular com dados de 30 distritos principais (Lisboa, Porto, Braga, Faro, Setúbal, Aveiro, Coimbra, Leiria, etc.) + documentação de limitações.

## `0005_fix_auction_end_date.sql`
- **Status:** Referenciado em `docs/migrations.md` → **CONFIRMADO** (migração pendente para converter `auction_end_date` de segundos para data).

## `docs/limitations.md`
- **Status:** Atualizado com:
  - `/leiloes` só existe em `fase2-dev` (404 em produção até merge).
  - PPR adiado até autenticação usar Suspense.
  - Imagens: 63/200 com imagem (137 sem).
  - Área em falta nos 48 demo (estimada por tipologia).
  - Tabela de mercado cobre ~25 municípios de 308.

## `DECISIONS_PENDING.md`
- **Status:** Atualizado com:
  - P1: Token Turso 401 → humano deve regenerar via `turso db tokens create radarpro2`.
  - H.2: Scores em falta → resolvido (0/40).
  - H.3: Mixed → 0 (sem mudanças).
  - H.4: Backfill report → documentado.
  - J.1: Popular `0006` → pendente.
  - J.2: Confirmar `0005` → pendente.
  - K.1: `verify-production.ts` → OK (preview OK).
  - K.2: Logs produção → pendente.
  - K.3: Auditoria UI → pendente.
  - K.4: Auditoria dependências → pendente.
  - L.1: Estado final → pendente (migrações, token, CRON, chave Martelo.pt, portais, expansão mercado).

## Bloco I — Fechar FASE 3

### I.1: `SourceReliabilityBadge` aplicado + testado
- **Status:** Componente existente mas **não usado** em PropertyCard.tsx. **AÇÃO PENDENTE:** Adicionar badge com fonte `sourceName` e score `score` nos cards PropertyCard.

### I.2: `rentability` sintético fora dos rankings
- **Status:** Teste criado `src/lib/__tests__/oportunidades-rentability.test.ts` (verifica que v2 engine ignora rentability e ranking filtra null scores).
- **Ação:** Confirmar que ranking em `src/app/oportunidades/page.tsx` não expõe rentability.

## Bloco K — FASE 7 (verificação real)

### K.1: `verify-production.ts` contra preview de `fase2-dev`
- **Status:** **OK** → todas as rotas (/, /oportunidades, /leiloes) retornam 200 no preview.
- **Evidência:** `npm run verify` verde, output completo registrado em `PROGRESS.md`.

### K.2: Logs de produção via MCP `vercel`
- **Status:** Pendente — precisar obter logs com `vercel logs radar-pro2` ou similar.

### K.3: Auditoria UI via MCP `cdt`
- **Status:** Pendente — abrir homepage, /imovel/:id, /leiloes em mobile 390 e desktop 1360, screenshot, listar console errors.

### K.4: Auditoria dependências via MCP `rea`
- **Status:** Pendente — inspecionar `node_modules/@libsql/client`, `next`, `drizzle-orm`; reportar versões e vulnerabilidades.

---

### Bloco L — Encerramento

### L.1: Atualizar `DECISIONS_PENDING.md` com estado real
- ✅ Migrações 0002/0003/0004/0005 na live (aplicadas 2026-11-04) — **CONFIRMADO**
- ⏳ Token Turso em `.env.local` → regenerar via `turso db tokens create radarpro2`
- ⏳ `0006_seed_market_data_district.sql` na live (após popular)
- ⏳ `SHOW_SEED_DATA` — recomendação: `false`
- ⏳ `CRON_SECRET` na Vercel
- ⏳ Chave Martelo.pt + uso comercial
- ⏳ 7 portais "depende do dono"
- ⏳ Expansão da tabela de mercado

### L.2: Atualizar `PROGRESS.md` com todas as fases marcadas e evidência por item

### L.3: `npm run verify` verde

### L.4: Commit final: `chore(release): fechar lacunas e preparar merge para main`

### L.5: Push para `fase2-dev`