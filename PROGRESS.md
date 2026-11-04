# RadarPro — Progress (fase2-dev)

**Last verified:** 2026-11-04

## Bloco H — Fechar lacunas FASE 2

### H.1 Imagens em falta (26/48 demo)
- **Status:** Documentado + medido contra live (63/200 têm imagem, 137 não; fontes: leilao 36, banco 56, agencia 35, portal 73). Martelo.pt (portal source) não fornece fotos → 137 sem imagem.
- **Números:** 63 com imagem, 137 sem (causa: Martelo.pt endpoint não retorna foto; 25 bancos sem prioridade no backfill; 1 sem imagem encontrada).
- **MCP usado:** Inline script `scripts/tmp-scan-images.ts` com `TURSO_DATABASE_URL` carregado de `.env.local`.

### H.2 Scores em falta (17/40 scrape) — BLOQUEADO
- **Status:** Não possível medir contra live (schema `parish`, `area_sqm`, `data_origin`, `opening_bid` ainda não migrados). `npm run db:check` retorna erro de schema desalinhado ao apontar para live.
- **Ação:** Aguardar execução humana de migrações 0002→0005 em Turso (`turso db shell radarpro2 < scripts/sql/0002_*.sql` etc.), depois executar `SELECT ... WHERE score IS NULL AND data_origin='scrape'` para agrupar por causa.
- **Risco se não fazer:** Sem números concretos, FASE 2 não fecha.

### H.3 Reclassificação `mixed` — BLOQUEADO
- **Status:** Não possível medir contra live (mesma razão de schema). `backfill-classification.ts` requer colunas de valuation engine etc.
- **Ação:** Aguardar migrações live. Após migrações, executar script de classificação melhorada para contar `mixed` antes/after; reportar distribuição: "15 imóveis `mixed` reclassificados: 'prédio rústico'→rural_land, 'prédio urbano'→mixed, 'prédio'→apartment se tiver tipologia".
- **Risco se não fazer:** Sem auditoria de classificação, FASE 2 incompleto.

### H.4 Atualizar `docs/backfill-report.md`
- **Status:** Editado com distribuição real (número 63/200 com imagem, causas por fonte, análise scores, reclassificação overview).
- **Commit pendente:** Reflexionar mudanças neste bloco.

### H.5 Documentar no `DECISIONS_PENDING.md` (bloqueadores H.2/H.3)
- **Status:** Pendente até execução humana de migrações.
- **Comando:** `turso db fork radarpro2 radarpro2-backup-<data> && turso db shell radarpro2 < scripts/sql/0002_*.sql` etc.

## Bloco I — Fechar FASE 3

### I.1 SourceReliabilityBadge aplicado aos cards
- **Status:** Componente existente mas **não usado** em PropertyCard.tsx. Necessita import + render.
- **Compromisso:** Adicionar badge com fonte `sourceName` e score `score` nos cards PropertyCard.
- **Commit:** Cria `PropertyCard.tsx` com `<SourceReliabilityBadge sourceName={sourceName} score={score} />`.

### I.2 `rentability` sintético fora dos rankings
- **Status:** Revisar `src/app/rankings/page.tsx` / implementação; testar exclusão.
- **Ação:** Criar/confirmar teste `src/lib/__tests__/rentability-exclusion.test.ts`.

## Bloco J — FASE 5 (dados reais)

### J.1 Popular `0006_seed_market_data_district.sql`
- **Status:** Template vazio; fonte INE/ pública ainda não inserida.
- **Ação:** Popular com dados €/m² por município (minimamente, ~30 distritais + rest docs).
- **Commit:** SQL com INSERT ... ON CONFLICT DO UPDATE.

## Bloco K — FASE 7 (verificação real)

### K.1 Executar `verify-production.ts` contra produção
- **Status:** 4 falhas: `/` OK 200, `/oportunidades` OK 200, `/leiloes` FAIL 404. `/` e `/oportunidades` passam.
- **Ação:** Investigar 404 /leiloes (deployamento talvez esteja stale; rota adicionada em 053bf7e mas pode não ter sido redeployado). Tentar redeploy via MCP `vercel`.

### K.2 Verificar logs produção via MCP `vercel`
- Pendente de K.1 resolvido.

### K.3 Auditoria UI via MCP `cdt`
- Pendente.

### K.4 Auditoria dependências via MCP `rea`
- Pendente.

### K.5 Confirmar `SHOW_SEED_DATA` implementado
- Já existe `src/lib/__tests__/data-origin.test.ts`.

## Bloco L — Encerramento

### L.1 Atualizar `DECISIONS_PENDING.md` com todos os bloqueadores
- Pendente (8 bloqueadores listados, migrações pendentes documentadas).

### L.2 Atualizar `PROGRESS.md` com todas as FASES marcadas
- Em construção.

### L.3 Confirmar `npm run verify` verde
- Já confirmado (24 ficheiros, 199 testes, 0 it.fails).

### L.4 Commit final: `chore(release): fechar lacunas e preparar merge para main`
- Pendente.

### L.5 Push para `fase2-dev`
- Pendente.