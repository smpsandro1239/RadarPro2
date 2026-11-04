# TODO RadarPro (fase2-dev → release)

Modo contínuo: terminar um item, passar ao seguinte. Um commit por item, testes a acompanhar. `npm run verify` verde antes de cada commit.

## Regras do agente
- Se um item depender de ação humana, registar em `docs/BLOQUEADORES.md` e avançar para o próximo item independente.
- Nunca commitar segredos. Nunca escrever em base remota sem flag explícita.
- Não copiar textos/imagens/testemunhos do radarpro.ai. Só funcionalidades e padrões.
- No fim de cada fase, atualizar o README e escrever resumo curto.

## FASE 1 — Consistência de dados (prioridade técnica)
- [x] 1.1 Fixar `auction_end_date` em ms em todo o código (ingest, PropertyCard, imovel, search).
- [x] 1.2 `findMarketData`: normalizar acentos com `normalizeName`.
- [x] 1.3 WP7: v2 como único motor, legacy `@deprecated`, migrar 5 `it.fails`, baixar `MAX_IT_FAILS`.
- [x] 1.4 `ValuationCard` passa a consumir v2 (motor único).
- [x] 1.5 Unificar os dois caminhos de escrita (`ingest.ts` e `scrape-dry-run.ts`).
- [x] 1.6 Leilões sem lance: campo separado `opening_bid`.

## FASE 2 — Backfill (WP11)
- [x] 2.1 Scripts de backfill com dry-run por defeito + relatório de distribuição (docs/backfill-report.md).
- [x] 2.2 Imagens: `backfill-images.ts` executado (22/48 demo).
- [x] 2.3 `area_sqm` nos 48 demo (estimativa por tipologia).
- [x] 2.4 Recalcular scores com v2 (23 atualizados em local).
- [x] 2.5 Rever os 15 imóveis `mixed` e melhorar `classify.ts`.

## FASE 3 — Produto e UI (WP8)
- [x] 3.1 Estados "Sem avaliação / Sem área / Sem score" consistentes (PropertyCard).
- [ ] 3.2 `SourceReliabilityBadge` com escala; rankings sem NULL; leilões em separador próprio; `rentability` sintético fora dos rankings.
- [ ] 3.3 Card com padrão da referência (badge de origem, score, preço vs valoração).
- [ ] 3.4 Detalhe: €/m² vs média da zona, tendência, rentabilidade.
- [ ] 3.5 Seletor de distrito na home + página por distrito.
- [ ] 3.6 Gráfico "novas oportunidades nas últimas 24 h".
- [ ] 3.7 Pesquisa em linguagem natural (feature flag).
- [ ] 3.8 Expor garagens/terrenos nos filtros.

## FASE 4 — SEO, copy e legal (WP9, WP10)
- [ ] 4.1 `generateMetadata` por rota, slugs sem acentos, meta descriptions, sitemap/robots.
- [ ] 4.2 Páginas de aterragem por distrito.
- [ ] 4.3 Remover "lucro garantido"/"apenas oportunidades reais"; avisos legais.
- [ ] 4.4 Sem testemunhos/métricas inventadas.

## FASE 5 — Landing 3D
- [ ] 5.1 Direção visual própria (evitar look de site de IA).
- [ ] 5.2 Tokens de design + `design-tokens.test.ts` com contraste.
- [ ] 5.3 Hero 3D leve (Three.js, lazy, fallback estático, reduced-motion).
- [ ] 5.4 Orçamento de performance: LCP < 2,5s, CLS < 0,1 mobile.

## FASE 6 — Qualidade e docs (WP12)
- [ ] 6.1 Auditoria CDT: screenshots 390/1360, console, Lighthouse, axe-core.
- [ ] 6.2 README: limitações, comando recriar BD local, auditorias em `docs/`.
- [ ] 6.3 Ativar Typesense opcional.

## FASE 7 — Gate final (ações humanas)
- [ ] 7.1 Rodar token Turso (fingerprint `1bb0c1abb032`).
- [ ] 7.2 `CRON_SECRET` na Vercel.
- [ ] 7.3 Aplicar migrações 0002/0003 na live; migrar `auction_end_date` para ms.
- [ ] 7.4 Decidir `SHOW_SEED_DATA` em produção.
- [ ] 7.5 Decidir portais "depende do dono"; chave + uso comercial Martelo.pt.
- [ ] 7.6 Preview `fase1-integracao` → merge `main`.
- [ ] 7.7 Ampliar tabela de mercado (~25 → 308 municípios).
