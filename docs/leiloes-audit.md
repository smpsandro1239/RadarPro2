# Auditoria — Leilões Martelo (2026-11-06)

## Inventário (57 imóveis Martelo no live)

- 7 com prefixo `martelo-leil_*` e `auction_end_date` preenchido (pós-fix F2/F3).
- 50 legados com `auction_end_date` NULL — prefixos `martelo-lo<seq>2026` (38) e `martelo-np<seq>2026` (12).

## F1.1 — Legados sem data (`martelo-lo*` / `martelo-np*`)

- Contagem: 50 registos, todos com `is_auction=1` e `auction_end_date IS NULL`.
- Distribuição por `asset_class`: rural_land 17, house 12, mixed 8, commercial 6, urban_land 4, apartment 3.
- Distribuição por `type`: Rústico 21, Moradia T3/T4/T5/T6 13, Terreno 3, Quinta/Misto 3, Armazém/Indústria 3, Prédio 2, Loja 1, Apartamento 2, Moradia 1, Moradia T2 1, Apartamento T4 1.

## F1.2 — Hipótese de reclassificação ("loja") — REFUTADA

- Prefixo `lo`/`np` não é indicador de tipo de imóvel; referencia o leilão (ex.: `LEIL_*` vs `LO*`/`NP*`).
- Apenas 1 dos 50 é Loja (`martelo-lo1517702026`, "INSTALAÇÕES FABRIS", asset_class commercial).
- Bulk são residenciais/rurais legítimos → manter `is_auction=1`.

## F1.3 — Conclusão

- 50 legados permanecem sem `auction_end_date` (sem janela <24h para o check).
- Sem correção de classificação — decisão registada em `DECISIONS_PENDING.md` §14.
