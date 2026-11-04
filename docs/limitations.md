# Limitações conhecidas

- PPR (Partial Prerendering) adiado até todas as páginas autenticadas usarem Suspense.
- Imagens ausentes em ~40 imóveis scrape (Martelo.pt não fornece fotos no dry-run).
- Área em falta nos 48 demo (estimada por tipologia via backfill).
- Tabela de mercado cobre ~25 municípios de 308.
- Portais "depende do dono" (Imovirtual, e-Leilões, Leilosoc, Bidizi, Santander, Caixa Imobiliário, Novo Banco) não confirmados.
- `auction_end_date` em segundos na live (migração pendente).
- `SHOW_SEED_DATA` não decidido em produção.