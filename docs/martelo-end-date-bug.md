# Diagnóstico — Martelo.pt `auction_end_date` NULL (2026-11-06)

## F1.1 — O que o parser faz

- `src/lib/martelo-parser.ts` → `mapMarteloEvent` mapeia `auctionEndDate: parsePortugalDateTime(event.data_fim)`.
- `parsePortugalDateTime` (src/lib/portugal-time.ts) aceita "YYYY-MM-DDTHH:mm:ss" (hora local de Lisboa) e devolve epoch ms UTC.
- Conclusão parcial: o parser **já extrai** o fim do leilão a partir de `data_fim`.

## F1.2 — Resposta bruta da API Martelo.pt

- Endpoint: `https://martelo.pt/public-api/events` → `{ events: [...], total }`.
- `EVENTS_TOTAL=100`; `COM_DATA_FIM=100` (todos os eventos têm `data_fim`).
- Exemplo: `{ "reference": "LEIL_AVALIBERICA_62896", "data_fim": "2026-11-06T11:00:00", "valor_base": 63750, ... }`.
- Formato: `"YYYY-MM-DDTHH:mm:ss"` (local de Lisboa, sem fuso).
- Validação via `mapMarteloEvent`: `auctionEndDate` devolvido como epoch ms (ex.: `1793962800000`).

## F1.3 — Estado atual de `auction_end_date` no DB

- 50 imóveis com `data_origin='scrape' AND is_auction=1`.
- `COM_END_DATE=0` — **nenhum** tem `auction_end_date` preenchido.

## F1.2 — Resposta bruta da API Martelo.pt (actualizada)

- Endpoint: `https://martelo.pt/public-api/events` -> `{ events: [...], total }`.
- `EVENTS_TOTAL=100`; `COM_DATA_FIM=100` (todos os eventos comem data_fim).
- Exemplo: `{ "reference": "LEIL_AVALIBERICA_62896", "data_fim": "2026-11-06T11:00:00", "valor_base": 63750 }`.
- Formato: `"YYYY-MM-DDTHH:mm:ss"` (hora local de Lisboa, sem fuso designativo).
- `mapMarteloEvent` devolve `auctionEndDate` = epoch ms (ex.: `1793962800000`).

## F1.3 — Estado actual de `auction_end_date` no DB

- 50 imoveis com `data_origin='scrape' AND is_auction=1`.
- `COM_END_DATE=0` -> nenhum tem `auction_end_date` preenchido.

## Causa raiz (parcial)

- O mapeamento no parser esta correto e a API devolve `data_fim`.
- O caminho de escrita (`scripts/scrape-dry-run.ts` -> `writeRows`) faz INSERT/ON CONFLICT **sem a coluna `auction_end_date`**, descartando o valor extraido.


- O mapeamento no parser está correto e a API devolve `data_fim`.
- O caminho de escrita (`scripts/scrape-dry-run.ts` → `writeRows`) faz INSERT/ON CONFLICT **sem a coluna `auction_end_date`**, descartando o valor extraído.
