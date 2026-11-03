# Gate de release — RadarPro

Objetivo: nenhum deploy com token Turso vazado, segredo no repositorio ou testes a vermelho.

## Ordem de execucao

1. `npm run verify` — typecheck (src), typecheck (scripts), vitest, build. Tem de passar inteiro.
2. `npm run release:check` — bloqueia se o token Turso em uso for um token vazado conhecido
   ou se houver padrao de segredo em ficheiros versionados. Saida 1 = nao publicar.
3. Review do diff e do estado do backlog em `docs/BACKLOG.md`.
4. Push para a branch de trabalho e preview da Vercel.
5. Merge para `main` — acao exclusiva do dono.

## Rotacao do token (acao do dono)

O gate falha enquanto o token em uso nao mudar. Passos:

1. Criar um token novo no painel da Turso (ou `turso db tokens create`).
2. Atualizar `TURSO_AUTH_TOKEN` no ambiente da Vercel e nos ficheiros `.env` / `.env.local` locais.
3. Revogar o token antigo no painel da Turso.
4. Correr `npm run release:check` e confirmar `RESULTADO: OK`.

O fingerprint (sha256[:12]) do token e mostrado no gate; o valor nunca e impresso.

## Estado atual

- Token Turso em uso: fingerprint `1bb0c1abb032` — token vazado conhecido, por rodar.
- `CRON_SECRET`: definido no ambiente local (valor nunca impresso); a definicao na Vercel e acao do dono.
- Base de dados remota: `libsql://...turso.io` (live). Scripts de escrita exigem `--write` explicito e
  nunca correm contra a live.
- Se o historico git contiver o token em uso, o gate falha: reescrever o historico e acao do dono.
