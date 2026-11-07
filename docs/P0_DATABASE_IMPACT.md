# Impacto na BD
Nenhuma migração ou escrita foi executada. Backfill é dry-run por omissão; escrita requer --apply, ALLOW_DATABASE_BACKFILL=1 e TURSO_DATABASE_URL=file: local. URLs remotas são bloqueadas. A ingestão preserva marketValue existente. Não foi feita correcção retroactiva de valores ×1,2 por não ser possível distinguir automaticamente estimativas artificiais de avaliações legítimas.
