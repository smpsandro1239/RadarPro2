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
