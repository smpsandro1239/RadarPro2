# Decisão de launch — RadarPro (2026-11-06)

## Conclusão A — lançar com dados atuais

Com base na cobertura real medida (72 imóveis scrape ativos, 34 residential com score, 9 distritos com ≥3 imóveis com score), o agente conclui:

**O site pode lançar publicamente agora** com dados reais e funcionalidades estáveis.

Justificação numérica:
- 72 imóveis ativos (50 leilões Martelo + 15 Casa Sapo + 7 novos Martelo).
- 34 residential com score → validação qualitativa funcional.
- Infraestrutura verde: expireStale corrigido, price tracking E2E ok, comparables ok, /mercado ok, /leiloes ok, /baixaram ok, /melhores ok.

Limitações registradas (não bloqueantes para lançamento):
- Cobertura por distrito ainda limitada (~10 de 20 distritos com imóveis).
- Imagens: 15 Casa Sapo (100%) + Martelo (parser corrigido) → display ~20.8% até novo scrape.
- Fontes gratuitas para leilões com lances variáveis: esgotadas (Martelo sem novos eventos).

## Decisão final do dono

- [ ] **Aprovado pelo agente (Conclusão A)** — lançar com 72 imóveis.

## Próximos passos (pós-launch)

1. Apify $5 (opcional) para 1000 imóveis.
2. Martelo premium.
3. Monitorar cron diário.
