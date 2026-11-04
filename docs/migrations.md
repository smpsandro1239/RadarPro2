# Migrações da base de dados

## Nota sobre shell
- PowerShell/bash: `VAR=value command` funciona.
- cmd: usar `set VAR=value && command` ou `npm run dev:local`.

## Passos para o humano executar (live Turso)

1. **Fork da base** (backup): `turso db fork radarpro2 radarpro2-backup-<data>`
2. **Dry-run:** `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/apply-migration.ts scripts/sql/0005_fix_auction_end_date.sql`
3. **Aplicar:** adicionar `--apply`.
4. **Verificar schema:** `turso db shell radarpro2 ".schema properties"` — confirmar colunas `parish`, `area_sqm`, `data_origin`, `opening_bid`.
5. **Repetir** para `0006_seed_market_data_district.sql` (após revisão dos valores).
6. **Redeploy** na Vercel para as funções apanharem o novo schema.
7. **Validar:** abrir `/`, `/imovel/<id>`, `/api/valuation` em produção.

## Migrações existentes
- `drizzle/0000_add_valuation_columns.sql`
- `drizzle/0001_amusing_captain_america.sql`
- `scripts/sql/0002_add_property_valuation_inputs.sql`
- `scripts/sql/0003_add_data_origin.sql`
- `scripts/sql/0004_add_opening_bid.sql`
- `scripts/sql/0005_fix_auction_end_date.sql`
- `scripts/sql/0006_seed_market_data_district.sql` (template, requer revisão)