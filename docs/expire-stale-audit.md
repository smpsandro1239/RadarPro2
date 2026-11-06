# Auditoria — `expireStale` e `check_status = not_found`

## F1.1 — Leitura do código

- `src/lib/inngest/functions.ts` → `expireStale`: desativa rows com `isActive = true AND lastChecked < now - 7 dias`, setando `isActive = false, checkStatus = "not_found"`.
- `src/lib/ingest.ts` → `ingestProperty`: marca leilões com `auctionEndDate < now` como inativos.

## F1.2 — Onde `not_found` é atribuído

- `expireStale` atribui `checkStatus = "not_found"` quando desativa por inatividade.

## F1.3 — Correção aplicada

- **Opção B**: `expireStale` passa a excluir fontes com teto de eventos conhecido (prefixo `Martelo%`):

```ts
const expired = await db
  .update(properties)
  .set({ isActive: false, checkStatus: "not_found" })
  .where(
    and(
      eq(properties.isActive, true),
      lt(properties.lastChecked, cutoffDate),
      notLike(properties.sourceName, "Martelo%")
    )
  );
```

## F1.4 — Política

- Fontes com teto de eventos (`Martelo%`) não são expiradas por inatividade de check.
- Demais fontes seguem a política atual (expirar após 7 dias sem check).

## F1.3 (correção) — Implementação

- `expireStale` passou a excluir source `Martelo%` via `notLike(properties.sourceName, "Martelo%")`.
- Leilões com fim previsto (via `ingestProperty`) continuam a ser desativados quando o fim passa.

## F1.2 (correção final) — Estratégia robusta

- **Opção B (whitelist por prefixo) implementada**: `expireStale` exclui sources não listados em `SAFE_SOURCE_PREFIXES = ["Martelo", "Casa Sapo", "Imovirtual", "OLX", "SuperCasa"]` (verificação por `startsWith`).
- Fontes fora da whitelist (ex.: bancos, RSS sem source nomeado) seguem a política de expiração normal.
