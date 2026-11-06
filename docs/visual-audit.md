# Visual audit — placeholders por tipo (2026-11-06, Fase 1 do Fecho definitivo)

## Metodologia

- Feature: `feat(ui): placeholders por tipo quando sem imagem real` (commit `a13e46e`).
- Fallback em `src/components/PropertyImage.tsx`: quando `image_url` é null, renderiza `/placeholders/{asset_class}.svg`.
- Auditoria feita via HTML server-rendered de `https://radar-pro2.vercel.app` (pós-deploy do commit `a13e46e`).

## Resultados por rota

| Rota | HTTP | Placeholders | "Sem imagem disponível" |
|---|---|---|---|
| `/` | 200 | 0 (homepage não renderiza cards com imagem) | 0 |
| `/melhores` | 200 | 8x apartment + 19x house | 0 |
| `/oportunidades` | 200 | 6x apartment + 6x house | 0 |
| `/leiloes` | 200 | 0 (rota não renderiza cards com imagem) | 0 |
| `/baixaram` | 200 | 0 (rota não renderiza cards com imagem) | 0 |
| `/imovel/martelo-lo1464432026` | 200 | 1x house | 0 |

## Detalhe — página de detalhe

- Imóvel sem imagem real (`martelo-lo1464432026`, asset_class `house`) → placeholder `/placeholders/house.svg`.
- Atributos: `alt` descritivo (`"<title> — <tipo>"`), `data-placeholder="true"`.
- Contador de "Sem imagem disponível" no HTML: **0**.

## Conclusão

- Após Fase 1, nenhuma rota auditada exibe o fallback "Sem imagem disponível".
- Cards sem imagem real (57 Martelo sem foto) renderizam placeholder por `asset_class`.
