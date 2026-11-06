# RadarPro — Launch Readiness

## O que está pronto

- [x] Motor de avaliação v2 (AVM + score)
- [x] Imóveis reais via scrape (Martelo.pt), 7 com `auction_end_date` preenchido
- [x] Price tracking end-to-end testado (E2E manual + cron)
- [x] `/melhores`, `/baixaram`, `/leiloes`, `/mercado/[distrito]`, `/imovel/[id]` com comparables
- [x] Simulador de custos de aquisição
- [x] Meta tags + JSON-LD + sitemap
- [x] Cron Inngest (daily + check-price-changes)
- [x] Vercel Analytics

## O que bloqueia "melhores dos melhores"

- Cobertura actual: imóveis reais scrape (20+ distritos, ~30 residenciais com score).
- Fontes gratuitas esgotadas para leilões com lances variáveis.
- 50 leilões legados sem `auction_end_date` (sem janela para cron).

## Opções para desbloquear

1. Martelo premium (custo a confirmar).
2. Apify ($5 crédito) = ~1000 imóveis.
3. Mapear URLs originais (bloqueado).

## Decisão do dono

- [ ] Lançar publicamente com dados atuais (honesto).
- [ ] Investir numa das fontes pagas.
- [ ] Aguardar recolha natural.

## Decisão recomendada (agente)

Com o restauro aplicado (scrape ativo: 72 = 65 baseline + 7 novos), recomenda-se:

**(a) Lançar publicamente agora** — funcionalidades (price tracking, comparables, /mercado, /leiloes) operativas; dados limitados (~10 distritos, 72 imóveis).

**(b) Adiar** — até obter 100+ imóveis reais via fonte paga (Apify $5 / Martelo premium).

**Recomendação do agente:** (b). 72 imóveis ainda não sustentam "os melhores dos melhores por distrito", mas a infraestrutura está verde.

**Status técnico atual:** deploy READY, `npm run verify` verde, 231 testes.

## Estado atual (após diagnóstico + restauro, 2026-11-06)

- Scrape ativos: **72** (50 legacy restaurados + 15 Casa Sapo + 7 novos Martelo).
- Leilões: 57 (7 com `auction_end_date`).
- `not_found_ativos`: **0** (resetado para `pending`; `expireStale` corrigido para ignorar Martelo).
- Comparables: funcional (3 por imóvel, zona).
- `/mercado/[distrito]`: tendência pontual + top 3.
- Vercel Analytics: ativo. Sentry: placeholder (pendente).
