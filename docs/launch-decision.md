# Launch Decision — RadarPro (2026-11-06)

## Estado atual
- 72 imóveis ativos (100% reais, 0 demo)
- 34 residential com score (apartment + house)
- 9 distritos com ≥3 residential → /melhores útil
- 11 distritos com cobertura limitada (1-2 imóveis)
- 5 fontes ativas: Martelo, Casa Sapo, Imovirtual, OLX (parcial), SuperCasa (parcial)
- Placeholders por tipo em cards sem imagem

## Decisão (Conclusão A)
**Lançar publicamente com o estado atual.**

Justificação:
- 9 distritos com ≥3 residential é o mínimo viável para "melhores por distrito".
- Site é honesto sobre limitações (/sobre-dados, /estado).
- Placeholders eliminam o aspeto "quebrado".
- Mais ciclos de scraping não trarão mais imóveis (fontes esgotadas).

## O que falta (não bloqueia launch)
- Sentry real (§15).
- Expandir para 100+ imóveis (Apify $5 ou Martelo premium — decisão do dono).
- Imagens reais para cards com placeholder.

## Próximos passos
1. Configurar domínio próprio (radarpro.pt?) — se aplicável.
2. Anunciar em redes sociais / fóruns PT.
3. Configurar Google Search Console (submeter sitemap).
4. Monitorar /estado semanalmente.

## Addenda (2026-11-06) — Fontes gratuitas não exploradas

A Conclusão A afirmava "fontes gratuitas esgotadas". Esta afirmação estava incompleta: nunca foram tentados 4 MCPs públicos (CasaNest, Fixatia, Minha Morada) nem 2 agregadores de leilões (Casas Penhoradas, Licito.pt).

A decisão de lançar mantém-se. O ciclo é reaberto apenas para testar estas fontes, sem alterar a data de lançamento. Se alguma funcionar, os imóveis adicionais aparecem em /melhores automaticamente. Se nenhuma funcionar, o site fica exatamente como está (72 imóis).

- **CasaNest:** CONECTADO e FUNCIONAL — 3 imóveis Lisboa ingeridos (commit `bf6ead3`).
- **Fixatia / Minha Morada:** falharam — registados em `DECISIONS_PENDING.md` §18, avanço sem retry.
- **Casas Penhoradas / Licito.pt:** falharam em scraping estável — avanço sem retry automático.
