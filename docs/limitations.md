# Limitações conhecidas

- PPR (Partial Prerendering) adiado até todas as páginas autenticadas usarem Suspense.
- Imagens: 22/48 demo com imagem (backfill-images). 25 imóveis de bancos (Millennium BCP, Santander, etc.) não processados (fonte não está na lista de prioridade do backfill-images.ts). 1 sem imagem encontrada. Martelo.pt (scrape) não fornece fotos no endpoint usado.
- Área em falta nos 48 demo (estimada por tipologia via backfill).
- Tabela de mercado cobre ~25 municípios de 308.
- Portais "depende do dono" (Imovirtual, e-Leilões, Leilosoc, Bidizi, Santander, Caixa Imobiliário, Novo Banco) não confirmados.
- `auction_end_date` em segundos na live (migração pendente).
- Martelo.pt: API pública não expõe lances atualizados com frequência; imóveis do source `martelo` ficam com `auction_end_date` NULL (sem janela de leilão <24h para o check). O `check-price-changes-standalone` regista 0 ocorrências para a fonte. Ver `scripts/check-price-changes-standalone.ts`.
- `SHOW_SEED_DATA` não decidido em produção.
- `/leiloes` so existe em `fase2-dev`. A producao (`main`) devolve 404 ate o merge. Verificar com URL de preview da fase2-dev, nao producao.