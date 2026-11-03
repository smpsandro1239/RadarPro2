# Backlog — RadarPro (modo continuo)

Branch de trabalho: `fase2-dev` (base: `fase1-integracao`). `main` so com autorizacao do dono.
Estados: `todo | doing | done | blocked(humano) | blocked(técnico)`.

| WP | Item | Tipo | Estado |
|---|---|---|---|
| WP1 | `scripts/check-token-rotated.ts` + `npm run release:check` + `docs/RELEASE_CHECKLIST.md` (Gate final) | auto | done |
| WP2 | Triagem de termos de utilizacao (Casa Sapo, Imovirtual e os outros portais) -> `docs/PORTAIS.md` | auto | done |
| WP3 | `timingSafeEqual` em `authorizeWrite`; `it.fails` legados com TODO + limite no CI; ids duplicados/`gen-*` identificados | auto | done |
| WP4 | Migracao `0003 data_origin` (so na BD local) + prova da origem por prefixo de id + `SHOW_SEED_DATA` + banner "Dados de demonstracao" | auto | done |
| WP5 | Dry-run de scraping real so na BD local (portais que o WP2 permita; limite pequeno; ritmo educado) + medicoes | auto | done |
| WP6 | Fase 2: geografia do `ingest.ts`, `findMarketData` nivel `district`, testes de integracao com `market-data.ts` real, proposta de estrutura/fontes/unidade | auto | done |
| WP7 | Fase 3: v2 como unico motor; legacy como wrapper `@deprecated`; migrar os 5 testes legados; `ValuationCard` consome servidor | auto | todo |
| WP8 | Fase 4: "Sem avaliacao", escala do `SourceReliabilityBadge`, rankings sem `NULL`, leiloes em separador proprio, `rentability` sintetico fora dos rankings | auto | todo |
| WP9 | SEO: `generateMetadata` por rota, slugs de distrito sem perder acentos, meta description coerente com a cobertura real | auto | todo |
| WP10 | Copy: remover "lucro garantido", "apenas oportunidades reais" e afins; avisos legais coerentes | auto | todo |
| WP11 | Fase 5: scripts de backfill (dry-run por defeito, `--write` nunca contra a live), relatorio de distribuicao | auto | todo |
| WP12 | README/docs: mover auditorias para `docs/`, seccao de limitacoes atualizada, comando de recriar a BD local | auto | todo |
| — | Funcionalidades novas a descobrir | proposta | — |

## Fila para o dono

| # | Acao | Onde | Estado |
|---|---|---|---|
| 1 | Rodar o token Turso (fingerprint `1bb0c1abb032`, vazado) | `scripts/check-token-rotated.ts`, `docs/RELEASE_CHECKLIST.md` | pendente |
| 2 | Definir `CRON_SECRET` na Vercel | ambiente Vercel | pendente |
| 3 | Preview da `fase1-integracao` (log ou URL do deploy) | Vercel | pendente |
| 4 | Merge da `fase1-integracao` para `main` | git | pendente |
| 5 | Decidir portais `depende do dono` (Imovirtual, e-Leiloes, Leilosoc, Bidizi, Santander, Caixa Imobiliario, Novo Banco) | `docs/PORTAIS.md` | pendente |
| 6 | Chave da API do Martelo.pt e uso comercial permitido | `docs/PORTAIS.md` | pendente |
| 7 | Aplicar migracoes 0002/0003 na live ou autorizar `src/db/schema.ts` em conjunto | `scripts/sql/0003_add_data_origin.sql` | pendente |
| 8 | Decidir `SHOW_SEED_DATA` em producao (hoje: dados de demonstracao fora das listagens) | `src/lib/data-origin.ts` | pendente |
| 9 | Confirmar valores de mercado/unidades reais (decisoes com default seguro) | `src/lib/market-data.ts` | pendente |
| 10 | Migrar `auction_end_date` para milissegundos na live (scripts legados gravam segundos) e fixar a unidade canonica | `scripts/migrate_auction.mjs`, `src/db/schema.ts` | pendente |
| 11 | Ampliar a tabela de dados de mercado (hoje ~25 municipios de 308) e confirmar fontes e data de referencia | `src/lib/market-data.ts` | pendente |

## Notas de operacao

- Base local: ficheiro libsql local (`file:...`). A live (`libsql://...turso.io`) fica intocada.
- Sem dependencias novas. Sem commits com verify a vermelho.
- Relatorio por iteracao em `docs/PROGRESS.md` (mais recente no topo).
